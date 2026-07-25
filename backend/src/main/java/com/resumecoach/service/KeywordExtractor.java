package com.resumecoach.service;

import com.resumecoach.model.KeywordEntry;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Utility that tokenizes a block of text and returns a keyword-frequency map,
 * after stripping punctuation and filtering English stop words.
 * Used to populate {@code jdKeywords} / {@code resumeKeywords} on sessions.
 */
public final class KeywordExtractor {

    private KeywordExtractor() {}

    private static final Pattern NON_ALPHA = Pattern.compile("[^a-zA-Z0-9+#./-]");
    private static final int MIN_WORD_LEN = 2;

    /** Common English stop words to exclude from frequency maps. */
    private static final Set<String> STOP_WORDS = Set.of(
        "a", "about", "above", "across", "add", "after", "again", "against", "all", "almost",
        "alone", "along", "already", "also", "although", "always", "am", "among", "an", "and",
        "another", "any", "anybody", "anyone", "anything", "anywhere", "are", "around", "as", "at",
        "back", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "behind",
        "being", "below", "beside", "besides", "between", "beyond", "both", "but", "by", "came",
        "can", "cannot", "come", "could", "did", "do", "does", "doing", "done", "down",
        "during", "each", "either", "else", "enough", "etc", "even", "ever", "every", "everyone",
        "everything", "everywhere", "few", "following", "for", "found", "from", "further", "get", "give",
        "go", "good", "great", "had", "has", "have", "having", "he", "her", "here",
        "hers", "herself", "high", "him", "himself", "his", "how", "however", "i", "if",
        "in", "including", "into", "is", "it", "its", "itself", "just", "know", "large",
        "last", "less", "let", "like", "likely", "little", "lot", "made", "make", "many",
        "may", "me", "might", "more", "most", "much", "must", "my", "myself", "near",
        "need", "never", "new", "no", "nor", "not", "nothing", "now", "of", "off",
        "often", "on", "once", "one", "only", "onto", "or", "other", "others", "our",
        "ours", "ourselves", "out", "over", "own", "per", "place", "put", "rather", "same",
        "see", "set", "shall", "she", "should", "since", "small", "so", "some", "someone",
        "something", "somewhere", "still", "strong", "such", "system", "take", "than", "that", "the",
        "their", "theirs", "them", "themselves", "then", "there", "therefore", "these", "they", "thing",
        "things", "think", "this", "those", "though", "through", "throughout", "thus", "to", "together",
        "too", "two", "under", "until", "up", "upon", "us", "use", "used", "using",
        "various", "very", "was", "way", "we", "well", "were", "what", "whatever", "when",
        "where", "which", "while", "who", "whom", "whose", "why", "will", "with", "within",
        "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves"
    );

    /**
     * Extracts keyword frequencies from the given text.
     *
     * @param text raw text (resume or job description)
     * @return list of KeywordEntry objects, sorted descending by count
     */
    public static List<KeywordEntry> extractFrequency(String text) {
        if (text == null || text.isBlank()) return Collections.emptyList();

        // Tokenize & sanitize
        String[] tokens = NON_ALPHA.matcher(text.toLowerCase(Locale.ROOT)).replaceAll(" ").split("\\s+");

        Map<String, Integer> freq = new LinkedHashMap<>();
        for (String token : tokens) {
            String t = token.replaceAll("^[^a-zA-Z0-9+#]+|[^a-zA-Z0-9+#]+$", "").trim();
            if (t.length() < MIN_WORD_LEN) continue;
            if (STOP_WORDS.contains(t)) continue;
            freq.merge(t, 1, Integer::sum);
        }

        // Sort descending by count, keep top 80 keywords and map to List<KeywordEntry>
        return freq.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue(Comparator.reverseOrder()))
            .limit(80)
            .map(e -> KeywordEntry.builder().keyword(e.getKey()).count(e.getValue()).build())
            .collect(Collectors.toList());
    }
}
