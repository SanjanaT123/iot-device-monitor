package com.iot.device_monitor.dto;

public class DeviceStatusDTO {

    private String deviceName;
    private String room;
    private Double batteryPercentage;
    private Integer rssi;
    private String status;

    public DeviceStatusDTO() {}

    public DeviceStatusDTO(String deviceName, String room,
                           Double batteryPercentage, Integer rssi,
                           String status) {
        this.deviceName = deviceName;
        this.room = room;
        this.batteryPercentage = batteryPercentage;
        this.rssi = rssi;
        this.status = status;
    }

    public String getDeviceName() { return deviceName; }
    public void setDeviceName(String deviceName) { this.deviceName = deviceName; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public Double getBatteryPercentage() { return batteryPercentage; }
    public void setBatteryPercentage(Double batteryPercentage) { this.batteryPercentage = batteryPercentage; }

    public Integer getRssi() { return rssi; }
    public void setRssi(Integer rssi) { this.rssi = rssi; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}