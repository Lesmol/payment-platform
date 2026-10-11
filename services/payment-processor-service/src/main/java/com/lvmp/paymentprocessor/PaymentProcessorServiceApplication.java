package com.lvmp.paymentprocessor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PaymentProcessorServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaymentProcessorServiceApplication.class, args);
    }
}
