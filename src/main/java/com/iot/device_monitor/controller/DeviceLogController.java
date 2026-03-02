package com.iot.device_monitor.controller;

import com.iot.device_monitor.entity.DeviceLog;
import com.iot.device_monitor.service.DeviceLogService;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/device-logs")
@CrossOrigin(origins = "*")
public class DeviceLogController {

    private final DeviceLogService service;

    public DeviceLogController(DeviceLogService service) {
        this.service = service;
    }

    // POST single log
    @PostMapping
    public DeviceLog saveLog(@RequestBody DeviceLog log) {
        return service.saveLog(log);
    }

    // POST bulk logs
    @PostMapping("/bulk")
    public List<DeviceLog> saveBulk(@RequestBody List<DeviceLog> logs) {
        return service.saveAllLogs(logs);
    }

    // GET all logs
    @GetMapping
    public List<DeviceLog> getAllLogs() {
        return service.getAllLogs();
    }

    // GET logs by device ID
    @GetMapping("/device/{deviceId}")
    public List<DeviceLog> getByDevice(@PathVariable String deviceId) {
        return service.getLogsByDeviceId(deviceId);
    }
    
    @PostMapping("/upload-csv")
    public String uploadCSV(
            @RequestParam("file") MultipartFile file,
            @RequestParam("deviceId") String deviceId) {

        service.saveFromCSV(file, deviceId);

        return "CSV uploaded successfully";
    }
    @GetMapping("/device/{deviceId}/latest")
    public DeviceLog getLatest(@PathVariable String deviceId) {
        return service.getLatestLog(deviceId);
    }

}