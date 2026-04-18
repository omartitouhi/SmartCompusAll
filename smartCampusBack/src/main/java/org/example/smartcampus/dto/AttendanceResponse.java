package org.example.smartcampus.dto;

import org.example.smartcampus.enums.AttendanceStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AttendanceResponse {
    private Long id;
    private Long scheduleId;
    private String subjectName;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private Long studentId;
    private String studentName;
    private LocalDate date;
    private AttendanceStatus status;
    private String comment;
    private LocalDateTime recordedAt;

    public AttendanceResponse(Long id, Long scheduleId, String subjectName, String dayOfWeek,
                               String startTime, String endTime, Long studentId, String studentName,
                               LocalDate date, AttendanceStatus status, String comment, LocalDateTime recordedAt) {
        this.id = id;
        this.scheduleId = scheduleId;
        this.subjectName = subjectName;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.studentId = studentId;
        this.studentName = studentName;
        this.date = date;
        this.status = status;
        this.comment = comment;
        this.recordedAt = recordedAt;
    }

    public Long getId() { return id; }
    public Long getScheduleId() { return scheduleId; }
    public String getSubjectName() { return subjectName; }
    public String getDayOfWeek() { return dayOfWeek; }
    public String getStartTime() { return startTime; }
    public String getEndTime() { return endTime; }
    public Long getStudentId() { return studentId; }
    public String getStudentName() { return studentName; }
    public LocalDate getDate() { return date; }
    public AttendanceStatus getStatus() { return status; }
    public String getComment() { return comment; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
}
