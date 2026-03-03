// ==========================================================
// IoT Device Health Monitoring Dashboard
// dashboard.js
//
// PURPOSE:
// Connect frontend dashboard to Spring Boot backend,
// fetch device logs, display parameters, and draw charts.
//
// BACKEND (Render):
// https://iot-device-monitor.onrender.com
//
// This file is FUTURE-PROOF:
// Adding new devices requires ONLY backend data,
// frontend logic will continue working.
// ==========================================================



// ==========================================================
// SECTION 1 — READ DEVICE INFO FROM URL
// Example URL:
// dashboard.html?deviceId=ESP32C3_001&image=esp32c3.png
// ==========================================================

// Read query parameters
const params = new URLSearchParams(window.location.search);

// Device unique ID (used for API call)
const deviceId = params.get("deviceId");

// Device image filename
const imageName = params.get("image");

let liveMode = false;


// Detect device type automatically based on ID naming
// This allows automatic support for future devices
let deviceType = "UNKNOWN";

const id = deviceId ? deviceId.toUpperCase() : "";

// Devices that use Voltage, dvAvg, dvNorm charts
if (
    id.includes("ESP32C3") ||
    id.includes("NANOBEL") ||
    id.includes("PICO")
)
    deviceType = "ESP32C3";

// Devices that use battery, cpu, rssi charts
else if (id.includes("ESP32"))
    deviceType = "ESP32";


// Set device image dynamically
if (imageName)
{
    document.getElementById("deviceImage").src =
        "images/" + imageName;
}


// Set dashboard title dynamically
const titleEl =
    document.getElementById("deviceTitle");

if(titleEl)
    titleEl.innerText =
        deviceId + " Health Dashboard";



// ==========================================================
// SECTION 2 — GLOBAL VARIABLES
// These store runtime dashboard state
// ==========================================================

// Complete dataset fetched from backend
let data = [];

// Current row index being displayed
let index = 0;

// Dashboard refresh interval (milliseconds)
let intervalTime = 2000;

// Timer reference
let timer;


// Chart objects (created once, updated later)
let batteryChart;
let cpuChart;

let voltageChart;
let dvAvgChart;
let dvNormChart;


// Chart data arrays (X axis = time, Y axis = values)
let batteryLabels = [];
let batteryValues = [];

let cpuLabels = [];
let cpuValues = [];

let voltageLabels = [];
let voltageValues = [];

let dvAvgLabels = [];
let dvAvgValues = [];

let dvNormLabels = [];
let dvNormValues = [];



// ==========================================================
// SECTION 3 — INITIALIZE UI
// Hides unused sections depending on device type
// This keeps UI clean and professional
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
        // Unknown device
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


// Utility function to hide UI elements
function hide(id)
{
    const el = document.getElementById(id);

    if(el)
        el.style.display = "none";
}

// ==========================================================
// FUNCTION: Convert timestamp to readable time (HH:MM:SS)
// Works for milliseconds OR ISO timestamp from backend
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
// SECTION 4 — STATUS DISPLAY
// Shows device online/offline/error state
// ==========================================================

function setStatus(text)
{
    const status =
        document.getElementById("statusText");

    if(status)
        status.innerText = text;
}



// ==========================================================
// SECTION 5 — LOAD DATA FROM BACKEND API
//
// Calls your Spring Boot backend on Render:
//
// GET:
// /api/device-logs/device/{deviceId}
//
// Returns JSON array of device logs
// ==========================================================

async function loadDataset()
{
    try
    {
        const res =
            await fetch(
                `https://iot-device-monitor.onrender.com/api/device-logs/device/${deviceId}`
            );

        data = await res.json();


        // If no data found
        if(!data || data.length === 0)
        {
            setStatus("No data available");
            return;
        }

        setStatus("Online");

        // Start dashboard update loop
        startSimulation();
    }
    catch(e)
    {
        console.error(e);
        setStatus("Backend connection error");
    }
}



// ==========================================================
// SECTION 6 — START AUTO UPDATE LOOP
//
// Runs updateDashboard() repeatedly
// based on configured interval
// ==========================================================

function startSimulation()
{
    clearInterval(timer);

    timer =
        setInterval(
            updateDashboard,
            intervalTime
        );
}



// ==========================================================
// SECTION 7 — UPDATE DASHBOARD WITH NEW DATA POINT
//
// Each interval:
// • reads next row from dataset
// • updates UI text values
// • updates charts
// ==========================================================

function updateDashboard()
{
    if(index >= data.length)
        return;

    const row = data[index];

    // Use timestamp if available, else index
	const rawTime =
	    row.timestamp ??
	    row.timeMs ??
	    Date.now();

	// Convert to readable clock time
	const time = formatTime(rawTime);


    // ======================================================
    // ESP32 DEVICE DATA
    // ======================================================
    if(deviceType === "ESP32")
    {
        setText("batteryText",
            row.batteryVoltage + " V");

        setText("rssi",
            row.rssiDbm);

        setText("ble",
            row.bleConnAttempts);

        setText("cpu",
            row.cpuCycles);


        // Update battery progress bar
        if(row.batteryVoltage)
        {
            const percent =
                ((row.batteryVoltage - 3.3) / 0.9) * 100;

            document.getElementById("batteryBar")
                .style.width =
                percent + "%";
        }


        // Add chart data
        batteryLabels.push(time);
        batteryValues.push(row.batteryVoltage);

        cpuLabels.push(time);
        cpuValues.push(row.cpuCycles);
    }



    // ======================================================
    // ESP32-C3 DEVICE DATA
    // ======================================================
    if(deviceType === "ESP32C3")
    {
        setText("voltageText",
            row.voltageV + " V");

        setText("dvAvgText",
            row.dvAvg);

        setText("dvNormText",
            row.dvNorm);


        voltageLabels.push(time);
        voltageValues.push(row.voltageV);

        dvAvgLabels.push(time);
        dvAvgValues.push(row.dvAvg);

        dvNormLabels.push(time);
        dvNormValues.push(row.dvNorm);
    }


    // Update graphs
    updateCharts();

    // Move to next dataset row
    index++;
}



// ==========================================================
// SECTION 8 — CREATE / UPDATE CHARTS
//
// Charts created once, then updated for performance
// ==========================================================

function updateCharts()
{

    // ======================
    // ESP32 charts
    // ======================
    if(deviceType === "ESP32")
    {
        if(!batteryChart)
        {
            batteryChart =
                new Chart(
                    document.getElementById("batteryChart"),
                    {
                        type:"line",
                        data:{
                            labels:batteryLabels,
                            datasets:[
                                {
                                    label:"Battery Voltage",
                                    data:batteryValues,
                                    borderColor:"green",
                                    fill:false
                                }
                            ]
                        }
                    });


            cpuChart =
                new Chart(
                    document.getElementById("cpuChart"),
                    {
                        type:"line",
                        data:{
                            labels:cpuLabels,
                            datasets:[
                                {
                                    label:"CPU Cycles",
                                    data:cpuValues,
                                    borderColor:"blue",
                                    fill:false
                                }
                            ]
                        }
                    });
        }
        else
        {
            batteryChart.update();
            cpuChart.update();
        }
    }



    // ======================
    // ESP32-C3 charts
    // ======================
    if(deviceType === "ESP32C3")
    {
        if(!voltageChart)
        {
            voltageChart =
                new Chart(
                    document.getElementById("voltageChart"),
                    {
                        type:"line",
                        data:{
                            labels:voltageLabels,
                            datasets:[
                                {
                                    label:"Voltage",
                                    data:voltageValues,
                                    borderColor:"green",
                                    fill:false
                                }
                            ]
                        }
                    });


            dvAvgChart =
                new Chart(
                    document.getElementById("dvAvgChart"),
                    {
                        type:"line",
                        data:{
                            labels:dvAvgLabels,
                            datasets:[
                                {
                                    label:"Voltage Stability",
                                    data:dvAvgValues,
                                    borderColor:"orange",
                                    fill:false
                                }
                            ]
                        }
                    });


            dvNormChart =
                new Chart(
                    document.getElementById("dvNormChart"),
                    {
                        type:"line",
                        data:{
                            labels:dvNormLabels,
                            datasets:[
                                {
                                    label:"Voltage Normalized",
                                    data:dvNormValues,
                                    borderColor:"red",
                                    fill:false
                                }
                            ]
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
// SECTION 9 — HELPER FUNCTION
// Safely update UI text
// ==========================================================

function setText(id, value)
{
    const el =
        document.getElementById(id);

    if(el)
        el.innerText = value;
}



// ==========================================================
// SECTION 10 — CONFIGURATION POPUP
// Allows user to change refresh interval
// ==========================================================

function openConfig()
{
    document.getElementById("configPopup")
        .style.display="flex";
}

function closeConfig()
{
    document.getElementById("configPopup")
        .style.display="none";
}


function applyConfig()
{
    const sec =
        document.getElementById("intervalInput").value;

    intervalTime =
        sec * 1000;

    document.getElementById("currentInterval")
        .innerText = sec;
		
		
	liveMode = document.getElementById("liveModeToggle").checked;

		if(liveMode)
		{
		    startLiveMode();
		}
		else
		{
		    startSimulation();
		}

    closeConfig();

    startSimulation();
	
	
}



// ==========================================================
// SECTION 11 — RESET GRAPH DATA
// Clears charts and restarts simulation
// ==========================================================

function resetSimulation()
{
    index = 0;

    batteryLabels=[];
    batteryValues=[];

    cpuLabels=[];
    cpuValues=[];

    voltageLabels=[];
    voltageValues=[];

    dvAvgLabels=[];
    dvAvgValues=[];

    dvNormLabels=[];
    dvNormValues=[];

    updateCharts();
}
function startLiveMode()
{
    clearInterval(timer);

    timer = setInterval(async () =>
    {
        const res = await fetch(
            `https://iot-device-monitor.onrender.com/api/device-logs/device/${deviceId}/latest`
        );

        const row = await res.json();

        if(!row) return;

        updateLiveDashboard(row);

    }, intervalTime);
}


// ==========================================================
// SECTION 12 — APPLICATION ENTRY POINT
// Runs when dashboard loads
// ==========================================================

initUI();

loadDataset();