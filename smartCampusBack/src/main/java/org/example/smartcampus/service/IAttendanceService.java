package org.example.smartcampus.service;

import org.example.smartcampus.dto.AttendanceRequest;
import org.example.smartcampus.dto.AttendanceResponse;

import java.util.List;

public interface IAttendanceService {

    /** Save or update attendance for a single student on a given schedule slot + date */
    AttendanceResponse saveAttendance(AttendanceRequest request);

    /** Get all attendance records for a given schedule slot on a specific date */
    List<AttendanceResponse> getAttendanceByScheduleAndDate(Long scheduleId, String date);

    /** Get all attendance records for a student (their own history) */
    List<AttendanceResponse> getAttendanceByStudent(Long studentId);

    /** Get attendance history for a specific student in a specific schedule slot */
    List<AttendanceResponse> getAttendanceByScheduleAndStudent(Long scheduleId, Long studentId);

    /** Delete an attendance record */
    void deleteAttendance(Long attendanceId);
}
