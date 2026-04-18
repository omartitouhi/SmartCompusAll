package org.example.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.smartcampus.enums.Level;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ScheduleResponse {

    private Long id;
    private Long classId;
    private String className;      // e.g. "Informatique-A"
    private String filiereName;
    private Level level;
    private Long teacherId;
    private String teacherName;
    private Long subjectId;
    private String subjectName;
    private DayOfWeek dayOfWeek;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    private String room;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
}
