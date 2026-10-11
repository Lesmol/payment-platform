package com.lvmp.paymentservice.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.io.input.BOMInputStream;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;

// File-level checks only (present, .csv, readable header); rows are validated and flagged by the service
public class CsvFileValidator implements ConstraintValidator<ValidCsvFile, MultipartFile> {
    private static final CSVFormat FORMAT = CSVFormat.DEFAULT.builder()
        .setHeader()
        .setSkipHeaderRecord(true)
        .setTrim(true)
        .setIgnoreEmptyLines(true)
        .get();

    @Override
    public boolean isValid(MultipartFile file, ConstraintValidatorContext context) {
        if (file == null || file.isEmpty() || !StringUtils.endsWithIgnoreCase(file.getOriginalFilename(), ".csv")) {
            return false;
        }

        // BOMInputStream drops the byte-order mark Excel adds, so the first header name stays clean
        try (Reader reader = new InputStreamReader(
                BOMInputStream.builder().setInputStream(file.getInputStream()).get(), StandardCharsets.UTF_8);
             CSVParser parser = FORMAT.parse(reader)) {
            // TODO: check parser.getHeaderNames() against the expected columns once they are fixed
            return parser.getHeaderNames().size() > 1;
        } catch (IOException | UncheckedIOException | IllegalArgumentException e) {
            return false;
        }
    }
}
