package com.iot.device_monitor.service;

import com.iot.device_monitor.entity.DeviceLog;
import com.iot.device_monitor.repository.DeviceLogRepository;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DeviceLogService {

    private final DeviceLogRepository repository;

    public DeviceLogService(DeviceLogRepository repository) {
        this.repository = repository;
    }

    public DeviceLog saveLog(DeviceLog log) {
        return repository.save(log);
    }

    public List<DeviceLog> saveAllLogs(List<DeviceLog> logs) {
        return repository.saveAll(logs);
    }

    public List<DeviceLog> getAllLogs() {
        return repository.findAll();
    }

    public List<DeviceLog> getLogsByDeviceId(String deviceId) {
        return repository.findByDeviceId(deviceId);
    }

    // CSV upload method
    public void saveFromCSV(MultipartFile file, String deviceId) {

        try (
            Reader reader = new InputStreamReader(file.getInputStream())
        ) {

            Iterable<CSVRecord> records =
                    CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(reader);

            List<DeviceLog> logs = new ArrayList<>();

            for (CSVRecord record : records) {

                DeviceLog log = new DeviceLog();

                log.setDeviceId(deviceId);

                // ESP32 fields
                if (record.isMapped("time_ms"))
                    log.setTimeMs(Long.parseLong(record.get("time_ms")));

                if (record.isMapped("battery_voltage"))
                    log.setBatteryVoltage(Double.parseDouble(record.get("battery_voltage")));

                if (record.isMapped("rssi_dbm"))
                    log.setRssiDbm(Double.parseDouble(record.get("rssi_dbm")));

                if (record.isMapped("ble_conn_attempts"))
                    log.setBleConnAttempts(Integer.parseInt(record.get("ble_conn_attempts")));

                if (record.isMapped("prime_calc_ms"))
                    log.setPrimeCalcMs(Double.parseDouble(record.get("prime_calc_ms")));

                if (record.isMapped("cpu_cycles"))
                    log.setCpuCycles(Long.parseLong(record.get("cpu_cycles")));

                if (record.isMapped("latency_us"))
                    log.setLatencyUs(Double.parseDouble(record.get("latency_us")));

                // Other device fields
                if (record.isMapped("voltage_v"))
                    log.setVoltageV(Double.parseDouble(record.get("voltage_v")));

                if (record.isMapped("dv_avg"))
                    log.setDvAvg(Double.parseDouble(record.get("dv_avg")));

                if (record.isMapped("dv_norm"))
                    log.setDvNorm(Double.parseDouble(record.get("dv_norm")));

                if (record.isMapped("timestamp_local"))
                    log.setTimestampLocal(LocalDateTime.parse(record.get("timestamp_local")));

                if (record.isMapped("source_ip"))
                    log.setSourceIp(record.get("source_ip"));

                logs.add(log);
            }

            repository.saveAll(logs);

        } catch (Exception e) {
            throw new RuntimeException("CSV upload failed: " + e.getMessage());
        }
    }
    public DeviceLog getLatestLog(String deviceId) {
        return repository.findLatestByDeviceId(deviceId);
    }
}