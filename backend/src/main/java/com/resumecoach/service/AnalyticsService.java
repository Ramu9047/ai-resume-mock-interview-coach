package com.resumecoach.service;

import com.resumecoach.dto.*;
import com.resumecoach.repository.ResumeDocumentRepository;
import com.resumecoach.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Provides analytics aggregation queries against the sessions collection.
 * Results are cached in-memory for 5 minutes to avoid hammering MongoDB on every
 * admin page load. No Redis required — ConcurrentHashMap TTL is sufficient for v1.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final MongoTemplate mongo;
    private final SessionRepository sessionRepo;
    private final ResumeDocumentRepository resumeRepo;

    // Simple TTL cache: key → (computedAt, value)
    private final ConcurrentHashMap<String, CacheEntry<?>> cache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 5 * 60 * 1000L; // 5 minutes

    // ── Public API ────────────────────────────────────────────────────────────

    public AnalyticsOverviewResponse getOverview() {
        return cached("overview", this::computeOverview);
    }

    public List<AtsOverTimeDto> getAtsOverTime() {
        return cached("atsOverTime", this::computeAtsOverTime);
    }

    public List<TopGapDto> getTopGaps() {
        return cached("topGaps", this::computeTopGaps);
    }

    public List<TopKeywordDto> getTopJdKeywords() {
        return cached("topKeywords", this::computeTopJdKeywords);
    }

    // ── Aggregations ──────────────────────────────────────────────────────────

    private AnalyticsOverviewResponse computeOverview() {
        long totalSessions    = sessionRepo.count();
        long totalDrafts      = resumeRepo.count();

        // Average ATS score via aggregation
        GroupOperation group = Aggregation.group().avg("atsScore").as("avgScore");
        Aggregation agg = Aggregation.newAggregation(group);
        AggregationResults<Map> results = mongo.aggregate(agg, "sessions", Map.class);

        double avg = 0.0;
        if (results.getUniqueMappedResult() != null) {
            Object raw = results.getUniqueMappedResult().get("avgScore");
            if (raw instanceof Number n) avg = Math.round(n.doubleValue() * 10.0) / 10.0;
        }

        log.info("Analytics overview: sessions={} avgAts={} drafts={}", totalSessions, avg, totalDrafts);
        return AnalyticsOverviewResponse.builder()
                .totalSessions(totalSessions)
                .avgAtsScore(avg)
                .totalResumeDrafts(totalDrafts)
                .build();
    }

    private List<AtsOverTimeDto> computeAtsOverTime() {
        // Last 30 days, group by date (truncate to day in UTC)
        Instant since = Instant.now().minus(Duration.ofDays(30));

        MatchOperation match = Aggregation.match(Criteria.where("createdAt").gte(since));

        // Project a date string from createdAt
        ProjectionOperation project = Aggregation.project("atsScore")
                .andExpression("dateToString('%Y-%m-%d', createdAt)").as("date");

        GroupOperation group = Aggregation.group("date")
                .avg("atsScore").as("avgScore")
                .count().as("sessionCount");

        SortOperation sort = Aggregation.sort(Sort.by(Sort.Direction.ASC, "_id"));

        Aggregation agg = Aggregation.newAggregation(match, project, group, sort);
        AggregationResults<Map> results = mongo.aggregate(agg, "sessions", Map.class);

        List<AtsOverTimeDto> list = new ArrayList<>();
        for (Map row : results.getMappedResults()) {
            String date = (String) row.get("_id");
            double avg  = row.get("avgScore") instanceof Number n
                    ? Math.round(n.doubleValue() * 10.0) / 10.0 : 0.0;
            long count  = row.get("sessionCount") instanceof Number n ? n.longValue() : 0L;
            list.add(AtsOverTimeDto.builder().date(date).avgScore(avg).sessionCount(count).build());
        }

        // Fill missing days with 0 so the chart line is continuous
        return fillMissingDays(list, since);
    }

    private List<TopGapDto> computeTopGaps() {
        UnwindOperation unwind = Aggregation.unwind("gaps");
        GroupOperation  group  = Aggregation.group("gaps").count().as("count");
        SortOperation   sort   = Aggregation.sort(Sort.by(Sort.Direction.DESC, "count"));
        LimitOperation  limit  = Aggregation.limit(10);

        Aggregation agg = Aggregation.newAggregation(unwind, group, sort, limit);
        AggregationResults<Map> results = mongo.aggregate(agg, "sessions", Map.class);

        List<TopGapDto> list = new ArrayList<>();
        for (Map row : results.getMappedResults()) {
            String gap = (String) row.get("_id");
            long count = row.get("count") instanceof Number n ? n.longValue() : 0L;
            if (gap != null && !gap.isBlank()) {
                list.add(TopGapDto.builder().gap(truncate(gap, 60)).count(count).build());
            }
        }
        return list;
    }

    private List<TopKeywordDto> computeTopJdKeywords() {
        // jdKeywords is a List<KeywordEntry> [ { keyword: "...", count: N }, ... ]
        UnwindOperation unwind = Aggregation.unwind("jdKeywords");
        GroupOperation  group  = Aggregation.group("jdKeywords.keyword").sum("jdKeywords.count").as("count");
        SortOperation   sort   = Aggregation.sort(Sort.by(Sort.Direction.DESC, "count"));
        LimitOperation  limit  = Aggregation.limit(15);

        Aggregation agg = Aggregation.newAggregation(
            Aggregation.match(Criteria.where("jdKeywords").exists(true)),
            unwind, group, sort, limit
        );

        AggregationResults<Map> results = mongo.aggregate(agg, "sessions", Map.class);
        List<TopKeywordDto> list = new ArrayList<>();
        for (Map row : results.getMappedResults()) {
            String kw   = (String) row.get("_id");
            long   cnt  = row.get("count") instanceof Number n ? n.longValue() : 0L;
            if (kw != null && !kw.isBlank()) {
                list.add(TopKeywordDto.builder().keyword(kw).count(cnt).build());
            }
        }
        return list;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Fills any missing day buckets in the 30-day window with 0 count / 0 avgScore. */
    private List<AtsOverTimeDto> fillMissingDays(List<AtsOverTimeDto> data, Instant since) {
        Map<String, AtsOverTimeDto> byDate = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Seed all 30 days
        LocalDate start = since.atZone(ZoneOffset.UTC).toLocalDate();
        LocalDate end   = LocalDate.now(ZoneOffset.UTC);
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            String key = d.format(fmt);
            byDate.put(key, AtsOverTimeDto.builder().date(key).avgScore(0).sessionCount(0).build());
        }

        // Overwrite with real data
        data.forEach(d -> byDate.put(d.getDate(), d));
        return new ArrayList<>(byDate.values());
    }

    private String truncate(String s, int max) {
        return s.length() > max ? s.substring(0, max) + "…" : s;
    }

    // ── Cache ─────────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private <T> T cached(String key, java.util.function.Supplier<T> supplier) {
        CacheEntry<?> entry = cache.get(key);
        if (entry != null && !entry.isExpired()) {
            return (T) entry.value;
        }
        T value = supplier.get();
        cache.put(key, new CacheEntry<>(value));
        return value;
    }

    private static class CacheEntry<T> {
        final T value;
        final long computedAt;

        CacheEntry(T value) {
            this.value      = value;
            this.computedAt = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - computedAt > CACHE_TTL_MS;
        }
    }
}
