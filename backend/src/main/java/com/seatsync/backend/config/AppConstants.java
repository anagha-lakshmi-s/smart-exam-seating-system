package com.seatsync.backend.config;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public final class AppConstants {

    public static final List<String> BRANCHES =
            Collections.unmodifiableList(Arrays.asList("CSE", "ECE", "MECH", "CIVIL", "EEE"));

    private AppConstants() {
    }
}