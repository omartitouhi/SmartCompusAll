package org.example.smartcampus.enums;

public enum Level {
    FIRST_YEAR_PREPARATORY("1ère année cycle préparatoire intégré"),
    SECOND_YEAR_PREPARATORY("2ème année cycle préparatoire intégré"),
    FIRST_YEAR_ENGINEERING("1ère année ingénieur"),
    SECOND_YEAR_ENGINEERING("2ème année ingénieur"),
    THIRD_YEAR_ENGINEERING("3ème année ingénieur");

    private final String displayName;

    Level(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
