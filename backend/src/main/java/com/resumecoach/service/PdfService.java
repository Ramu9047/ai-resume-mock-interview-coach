package com.resumecoach.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class PdfService {

    private static final int MAX_TEXT_LENGTH = 8_000; // ~2k tokens — optimize prompt size for Groq TPM limits

    /**
     * Extracts plain text from an uploaded PDF file.
     *
     * @param file the uploaded PDF
     * @return extracted text, trimmed to MAX_TEXT_LENGTH characters
     * @throws IOException if the file cannot be read or is not a valid PDF
     */
    public String extractText(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty.");
        }

        byte[] bytes = file.getBytes();

        try (PDDocument document = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            text = text.replaceAll("\\r\\n|\\r", "\n") // normalise line endings
                       .replaceAll("[ \\t]+", " ")      // collapse horizontal whitespace
                       .trim();

            if (text.isBlank()) {
                throw new IllegalArgumentException(
                    "No extractable text found in the PDF. " +
                    "Please ensure the file is not a scanned image-only PDF."
                );
            }

            // Truncate to avoid exceeding LLM context limits
            if (text.length() > MAX_TEXT_LENGTH) {
                text = text.substring(0, MAX_TEXT_LENGTH) + "\n[...truncated for analysis]";
            }

            return text;
        }
    }
}
