package com.intellimeds.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/**
 * Loads a local {@code .env} file into JVM system properties before Spring starts, so
 * secrets like GEMINI_API_KEY can be referenced as {@code ${GEMINI_API_KEY}} in
 * application.properties. A real OS environment variable of the same name always wins
 * (we never overwrite one that is already set).
 */
public final class DotenvLoader {

    private DotenvLoader() {}

    public static void load() {
        Path envFile = Path.of(System.getProperty("user.dir"), ".env");
        if (!Files.exists(envFile)) {
            return;
        }
        try {
            List<String> lines = Files.readAllLines(envFile);
            for (String line : lines) {
                String trimmed = line.strip();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) continue;
                int eq = trimmed.indexOf('=');
                if (eq <= 0) continue;
                String key = trimmed.substring(0, eq).strip();
                String value = trimmed.substring(eq + 1).strip();
                if (value.length() >= 2
                        && ((value.startsWith("\"") && value.endsWith("\""))
                         || (value.startsWith("'") && value.endsWith("'")))) {
                    value = value.substring(1, value.length() - 1);
                }
                // OS env var and any explicitly-set system property take precedence.
                if (System.getenv(key) == null && System.getProperty(key) == null) {
                    System.setProperty(key, value);
                }
            }
        } catch (IOException ignored) {
            // no readable .env — app runs without it
        }
    }
}
