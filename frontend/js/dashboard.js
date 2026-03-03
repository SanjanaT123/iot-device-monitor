// ==========================================================
// IoT Device Health Monitoring Dashboard
// FULL PRODUCTION VERSION
// Supports:
// 1. History Replay Mode
// 2. Live Latest Mode
// ==========================================================


// ==========================================================
// SECTION 1 — READ DEVICE INFO FROM URL
// ==========================================================

const params = new URLSearchParams(window.location.search);
const deviceId = params.get("deviceId");
const imageName = params.get("image");

let liveMode = false;

// Detect device type automatically
let deviceType = "UNKNOWN";
const id = deviceId ? deviceId.toUpperCase() : "";

if (id.includes("ESP32C3") || id.includes("NANOBEL") || id.includes("PICO"))
    deviceType = "ESP32C3";
else if (id.includes("ESP32"))
    deviceType = "ESP32";


// Set image
if (imageName)
{
    document.getElementById("deviceImage").src =
        "images/" + imageName;
}

// Set title
const titleEl = document.getElementById("deviceTitle");
if(titleEl)
    titleEl.innerText = deviceId + " Health Dashboard";


// ==========================================================
// SECTION 2 — GLOBAL VARIABLES
// ==========================================================

let data = [];
let index = 0;
let intervalTime = 2000;
let timer;

// Charts
let batteryChart, cpuChart;
let voltageChart, dvAvgChart, dvNormChart;

// Chart Data Arrays
let batteryLabels = [], batteryValues = [];
let cpuLabels = [], cpuValues = [];
let voltageLabels = [], voltageValues = [];
let dvAvgLabels = [], dvAvgValues = [];
let dvNormLabels = [], dvNormValues = [];


// ==========================================================
// SECTION 3 — INITIALIZE UI
// ==========================================================

function initUI()
{
    if(deviceType === "ESP32")
    {
        hide("voltageSection");
        hide("dvAvgSection");
        hide("dvNormSection");
        hide("esp32c3Charts");
    }
    else if(deviceType === "ESP32C3")
    {
        hide("batterySection");
        hide("rssiSection");
        hide("bleSection");
        hide("cpuSection");
        hide("esp32Charts");
    }
    else
    {
        hide("batterySection");
        hide("rssiSection");
        hide("bleSection");
        hide("cpuSection");
        hide("voltageSection");
        hide("dvAvgSection");
        hide("dvNormSection");
        hide("esp32Charts");
        hide("esp32c3Charts");
        setStatus("Unsupported device");
    }
}

function hide(id)
{
    const el = document.getElementById(id);
    if(el) el.style.display = "none";
}


// ==========================================================
// TIME FORMAT FUNCTION
// ==========================================================

function formatTime(timestamp)
{
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
}


// ==========================================================
// STATUS
// ==========================================================

function setStatus(text)
{
    const status = document.getElementById("statusText");
    if(status) status.innerText = text;
}


// ==========================================================
// LOAD HISTORY DATA
// ==========================================================

async function loadDataset()
{
    try
    {
        const res = await fetch(
            `https://iot-device-monitor.onrender.com/api/device-logs/device/${deviceId}`
        );

        data = await res.json();

        if(!data || data.length === 0)
        {
            setStatus("No data available");
            return;
        }

        setStatus("Online");
        startSimulation();
    }
    catch(e)
    {
        console.error(e);
        setStatus("Backend connection error");
    }
}


// ==========================================================
// HISTORY REPLAY MODE
// ==========================================================

function startSimulation()
{
    clearInterval(timer);

    timer = setInterval(() =>
    {
        if(index >= data.length) return;

        updateDashboard(data[index]);
        index++;

    }, intervalTime);
}


// ==========================================================
// LIVE MODE
// ==========================================================

function startLiveMode()
{
    clearInterval(timer);

    timer = setInterval(async () =>
    {
        try
        {
            const res = await fetch(
                `https://iot-device-monitor.onrender.com/api/device-logs/device/${deviceId}/latest`
            );

            const row = await res.json();
            if(!row) return;

            updateDashboard(row);
        }
        catch(e)
        {
            console.error("Live mode error:", e);
        }

    }, intervalTime);
}


// ==========================================================
// COMMON DASHBOARD UPDATE (USED BY BOTH MODES)
// ==========================================================

function updateDashboard(row)
{
    const rawTime =
        row.timestampLocal ??
        row.timeMs ??
        Date.now();

    const time = formatTime(rawTime);


    // ESP32
    if(deviceType === "ESP32")
    {
        setText("batteryText", row.batteryVoltage + " V");
        setText("rssi", row.rssiDbm);
        setText("ble", row.bleConnAttempts);
        setText("cpu", row.cpuCycles);

        batteryLabels.push(time);
        batteryValues.push(row.batteryVoltage);

        cpuLabels.push(time);
        cpuValues.push(row.cpuCycles);
    }

    // ESP32-C3
    if(deviceType === "ESP32C3")
    {
        setText("voltageText", row.voltageV + " V");
        setText("dvAvgText", row.dvAvg);
        setText("dvNormText", row.dvNorm);

        voltageLabels.push(time);
        voltageValues.push(row.voltageV);

        dvAvgLabels.push(time);
        dvAvgValues.push(row.dvAvg);

        dvNormLabels.push(time);
        dvNormValues.push(row.dvNorm);
    }

    updateCharts();
}


// ==========================================================
// CHART CREATION / UPDATE
// ==========================================================

function updateCharts()
{
    if(deviceType === "ESP32")
    {
        if(!batteryChart)
        {
            batteryChart = new Chart(
                document.getElementById("batteryChart"),
                {
                    type:"line",
                    data:{ labels:batteryLabels,
                        datasets:[{ label:"Battery Voltage", data:batteryValues, borderColor:"green", fill:false }]
                    }
                });

            cpuChart = new Chart(
                document.getElementById("cpuChart"),
                {
                    type:"line",
                    data:{ labels:cpuLabels,
                        datasets:[{ label:"CPU Cycles", data:cpuValues, borderColor:"blue", fill:false }]
                    }
                });
        }
        else
        {
            batteryChart.update();
            cpuChart.update();
        }
    }

    if(deviceType === "ESP32C3")
    {
        if(!voltageChart)
        {
            voltageChart = new Chart(
                document.getElementById("voltageChart"),
                {
                    type:"line",
                    data:{ labels:voltageLabels,
                        datasets:[{ label:"Voltage", data:voltageValues, borderColor:"green", fill:false }]
                    }
                });

            dvAvgChart = new Chart(
                document.getElementById("dvAvgChart"),
                {
                    type:"line",
                    data:{ labels:dvAvgLabels,
                        datasets:[{ label:"Voltage Stability", data:dvAvgValues, borderColor:"orange", fill:false }]
                    }
                });

            dvNormChart = new Chart(
                document.getElementById("dvNormChart"),
                {
                    type:"line",
                    data:{ labels:dvNormLabels,
                        datasets:[{ label:"Voltage Normalized", data:dvNormValues, borderColor:"red", fill:false }]
                    }
                });
        }
        else
        {
            voltageChart.update();
            dvAvgChart.update();
            dvNormChart.update();
        }
    }
}


// ==========================================================
// HELPER
// ==========================================================

function setText(id, value)
{
    const el = document.getElementById(id);
    if(el) el.innerText = value;
}


// ==========================================================
// CONFIGURATION
// ==========================================================

function openConfig()
{
    document.getElementById("configPopup").style.display="flex";
}

function closeConfig()
{
    document.getElementById("configPopup").style.display="none";
}

function applyConfig()
{
    const sec = document.getElementById("intervalInput").value;
    intervalTime = sec * 1000;

    document.getElementById("currentInterval").innerText = sec;

    const toggle = document.getElementById("liveModeToggle");
    liveMode = toggle ? toggle.checked : false;

    clearInterval(timer);

    if(liveMode)
        startLiveMode();
    else
        startSimulation();

    closeConfig();
}


// ==========================================================
// RESET
// ==========================================================

function resetSimulation()
{
    index = 0;

    batteryLabels=[]; batteryValues=[];
    cpuLabels=[]; cpuValues=[];
    voltageLabels=[]; voltageValues=[];
    dvAvgLabels=[]; dvAvgValues=[];
    dvNormLabels=[]; dvNormValues=[];

    updateCharts();
}


// ==========================================================
// ENTRY POINT
// ==========================================================

initUI();
loadDataset();