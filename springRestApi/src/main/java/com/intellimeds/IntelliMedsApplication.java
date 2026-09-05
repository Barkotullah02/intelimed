package com.intellimeds;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.intellimeds.config.DotenvLoader;

@SpringBootApplication
public class IntelliMedsApplication {

    public static void main(String[] args) {
        DotenvLoader.load();
        SpringApplication.run(IntelliMedsApplication.class, args);
    }
}
