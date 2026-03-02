package com.iot.device_monitor.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "device_logs")
public class DeviceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "timestamp_local")
    private LocalDateTime timestampLocal;

    @Column(name = "time_ms")
    private Long timeMs;

    // ESP32 fields
    @Column(name = "battery_voltage")
    private Double batteryVoltage;

    @Column(name = "rssi_dbm")
    private Double rssiDbm;

    @Column(name = "ble_conn_attempts")
    private Integer bleConnAttempts;

    @Column(name = "prime_calc_ms")
    private Double primeCalcMs;

    @Column(name = "cpu_cycles")
    private Long cpuCycles;

    @Column(name = "latency_us")
    private Double latencyUs;

    // Other device fields
    @Column(name = "voltage_v")
    private Double voltageV;

    @Column(name = "dv_avg")
    private Double dvAvg;

    @Column(name = "dv_norm")
    private Double dvNorm;

    @Column(name = "source_ip")
    private String sourceIp;


    // ===== Getters and Setters =====

    public Long getId() {
        return id;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public LocalDateTime getTimestampLocal() {
        return timestampLocal;
    }

    public void setTimestampLocal(LocalDateTime timestampLocal) {
        this.timestampLocal = timestampLocal;
    }

    public Long getTimeMs() {
        return timeMs;
    }

    public void setTimeMs(Long timeMs) {
        this.timeMs = timeMs;
    }

    public Double getBatteryVoltage() {
        return batteryVoltage;
    }

    public void setBatteryVoltage(Double batteryVoltage) {
        this.batteryVoltage = batteryVoltage;
    }

    public Double getRssiDbm() {
        return rssiDbm;
    }

    public void setRssiDbm(Double rssiDbm) {
        this.rssiDbm = rssiDbm;
    }

    public Integer getBleConnAttempts() {
        return bleConnAttempts;
    }

    public void setBleConnAttempts(Integer bleConnAttempts) {
        this.bleConnAttempts = bleConnAttempts;
    }

    public Double getPrimeCalcMs() {
        return primeCalcMs;
    }

    public void setPrimeCalcMs(Double primeCalcMs) {
        this.primeCalcMs = primeCalcMs;
    }

    public Long getCpuCycles() {
        return cpuCycles;
    }

    public void setCpuCycles(Long cpuCycles) {
        this.cpuCycles = cpuCycles;
    }

    public Double getLatencyUs() {
        return latencyUs;
    }

    public void setLatencyUs(Double latencyUs) {
        this.latencyUs = latencyUs;
    }

    public Double getVoltageV() {
        return voltageV;
    }

    public void setVoltageV(Double voltageV) {
        this.voltageV = voltageV;
    }

    public Double getDvAvg() {
        return dvAvg;
    }

    public void setDvAvg(Double dvAvg) {
        this.dvAvg = dvAvg;
    }

    public Double getDvNorm() {
        return dvNorm;
    }

    public void setDvNorm(Double dvNorm) {
        this.dvNorm = dvNorm;
    }

    public String getSourceIp() {
        return sourceIp;
    }

    public void setSourceIp(String sourceIp) {
        this.sourceIp = sourceIp;
    }
}