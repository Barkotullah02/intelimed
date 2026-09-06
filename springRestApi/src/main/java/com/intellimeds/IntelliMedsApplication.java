package com.intellimeds;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.intellimeds.config.DotenvLoader;

import java.util.TimeZone;

@SpringBootApplication
public class IntelliMedsApplication {

    public static void main(String[] args) {
        // Run the whole app in UTC regardless of the host/VPS OS timezone. The mobile app
        // sends and reads appointment times as UTC, so the backend must compare "now" in UTC
        // too — otherwise a change to the server's timezone breaks booking + the join window.
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        DotenvLoader.load();
        SpringApplication.run(IntelliMedsApplication.class, args);
    }
}
