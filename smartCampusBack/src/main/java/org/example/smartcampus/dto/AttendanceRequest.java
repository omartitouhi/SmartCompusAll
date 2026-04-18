package org.example.smartcampus.dto;

import org.example.smartcampus.enums.AttendanceStatus;

public class AttendanceRequest {
    private Long scheduleId;
    private Long studentId;
    private String date; // ISO-8601: "YYYY-MM-DD"
    private AttendanceStatus status;
    private String comment;

    public Long getScheduleId() { return scheduleId; }
    public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
