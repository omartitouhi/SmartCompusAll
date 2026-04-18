package org.example.smartcampus.service;

import org.example.smartcampus.dto.ScheduleRequest;
import org.example.smartcampus.dto.ScheduleResponse;
import org.example.smartcampus.dto.SchoolClassResponse;
import java.util.List;

public interface IScheduleService {

    ScheduleResponse createSchedule(ScheduleRequest request);

    List<ScheduleResponse> getAllSchedules();

    List<ScheduleResponse> getSchedulesByClass(Long classId);

    List<ScheduleResponse> getSchedulesByTeacher(Long teacherId);

    ScheduleResponse updateSchedule(Long id, ScheduleRequest request);

    void deleteSchedule(Long id);

    List<SchoolClassResponse> getAllClasses();
}
