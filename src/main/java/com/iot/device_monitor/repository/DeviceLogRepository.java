package com.iot.device_monitor.repository;

import com.iot.device_monitor.entity.DeviceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import org.springframework.data.jpa.repository.Query;

    public interface DeviceLogRepository extends JpaRepository<DeviceLog, Long> {

        List<DeviceLog> findByDeviceId(String deviceId);

        @Query("""
            SELECT d FROM DeviceLog d
            WHERE d.deviceId = :deviceId
            ORDER BY d.id DESC
            LIMIT 1
        """)
        DeviceLog findLatestByDeviceId(String deviceId);
    }

