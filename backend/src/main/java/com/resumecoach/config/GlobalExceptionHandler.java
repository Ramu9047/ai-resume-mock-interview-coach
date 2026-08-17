package com.resumecoach.config;

import com.resumecoach.service.GroqService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.io.IOException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoResourceFoundException.class)
    public ProblemDetail handleNoResourceFound(NoResourceFoundException ex) {
        log.debug("No resource found: {}", ex.getMessage());
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Resource not found");
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ProblemDetail handleResponseStatus(ResponseStatusException ex) {
        log.warn("ResponseStatusException: {}", ex.getMessage());
        return ProblemDetail.forStatusAndDetail(ex.getStatusCode(), ex.getReason());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ProblemDetail handleFileTooLarge(MaxUploadSizeExceededException ex) {
        log.warn("File too large: {}", ex.getMessage());
        return ProblemDetail.forStatusAndDetail(
            HttpStatus.PAYLOAD_TOO_LARGE,
            "Resume PDF must be smaller than 5MB."
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArg(IllegalArgumentException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(IOException.class)
    public ProblemDetail handleIo(IOException ex) {
        log.error("IO error processing PDF", ex);
        return ProblemDetail.forStatusAndDetail(
            HttpStatus.UNPROCESSABLE_ENTITY,
            "Could not read the uploaded PDF. Please ensure it is a valid, non-corrupted PDF file."
        );
    }

    @ExceptionHandler(GroqService.GroqApiException.class)
    public ProblemDetail handleGroqError(GroqService.GroqApiException ex) {
        log.error("Groq API error: {}", ex.getMessage());
        String detail = ex.getMessage() != null && !ex.getMessage().isBlank()
                ? ex.getMessage()
                : "The AI service is temporarily unavailable. Please try again in a moment.";
        return ProblemDetail.forStatusAndDetail(
            HttpStatus.SERVICE_UNAVAILABLE,
            detail
        );
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneric(Exception ex) {
        log.error("Unexpected error occurred during request processing", ex);
        String message = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
        return ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Server error: " + message
        );
    }
}
