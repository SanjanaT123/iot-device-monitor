package com.iot.device_monitor.dto;

import java.time.LocalDateTime;

public class DeviceHistoryDTO {

    private LocalDateTime timestamp;
    private Double batteryVoltage;
    private Long cpuCycles;

    public DeviceHistoryDTO(LocalDateTime timestamp,
                            Double batteryVoltage,
                            Long cpuCycles) {
        this.timestamp = timestamp;
        this.batteryVoltage = batteryVoltage;
        this.cpuCycles = cpuCycles;
    }

    public LocalDateTime getTimestamp() { return timestamp; }
    public Double getBatteryVoltage() { return batteryVoltage; }
    public Long getCpuCycles() { return cpuCycles; }
}