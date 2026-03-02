// ===============================
// READ DEVICE INFO FROM URL
// ===============================

const params = new URLSearchParams(window.location.search);

const deviceId = params.get("deviceId");

const imageName = params.get("image");


// detect device type
let deviceType = "UNKNOWN";

if (deviceId && deviceId.toUpperCase().includes("ESP32C3"))
deviceType = "ESP32C3";

else if (deviceId && deviceId.toUpperCase().includes("ESP32"))
deviceType = "ESP32";


// set device image
if (imageName)
{
document.getElementById("deviceImage").src =
"images/" + imageName;
}


// set dashboard title
const titleEl =
document.getElementById("deviceTitle");

if(titleEl)
titleEl.innerText =
deviceType + " Dashboard";


// ===============================
// GLOBAL VARIABLES
// ===============================

let data = [];

let index = 0;

let intervalTime = 2000;

let timer;


// ESP32 charts
let batteryChart;
let cpuChart;


// ESP32-C3 charts
let voltageChart;
let dvAvgChart;
let dvNormChart;


// data arrays
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


// ===============================
// HIDE UNUSED SECTIONS
// ===============================

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

setStatus("No data available");

}

}


function hide(id)
{

const el = document.getElementById(id);

if(el)
el.style.display = "none";

}


// ===============================
// STATUS TEXT
// ===============================

function setStatus(text)
{

const status =
document.getElementById("statusText");

if(status)
status.innerText = text;

}


// ===============================
// LOAD DATA FROM BACKEND
// ===============================

async function loadDataset()
{

try
{

const res =
await fetch(
`http://localhost:8080/api/device-logs/device/${deviceId}`
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

setStatus("Connection error");

}

}


// ===============================
// SIMULATION LOOP
// ===============================

function startSimulation()
{

clearInterval(timer);

timer =
setInterval(
updateDashboard,
intervalTime
);

}


// ===============================
// UPDATE INTERVAL
// ===============================

function applyInterval()
{

intervalTime =
parseInt(
document.getElementById("interval").value
);

startSimulation();

}


// ===============================
// UPDATE DASHBOARD VALUES
// ===============================

function updateDashboard()
{

if(index >= data.length)
return;

const row = data[index];

const time = row.timeMs ?? index;


// ESP32
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


// battery bar
if(row.batteryVoltage)
{

const percent =
((row.batteryVoltage - 3.3) / 0.9) * 100;

document.getElementById("batteryBar")
.style.width =
percent + "%";

}


// charts data
batteryLabels.push(time);
batteryValues.push(row.batteryVoltage);

cpuLabels.push(time);
cpuValues.push(row.cpuCycles);

}


// ESP32-C3
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


updateCharts();

index++;

}


// ===============================
// UPDATE CHARTS
// ===============================

function updateCharts()
{


// ESP32 charts
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


// ESP32-C3 charts
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


// ===============================
// HELPER
// ===============================

function setText(id, value)
{

const el =
document.getElementById(id);

if(el)
el.innerText = value;

}


// ===============================
// CONFIG POPUP
// ===============================

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

closeConfig();

startSimulation();

}


// ===============================
// RESET
// ===============================

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


// ===============================
// START
// ===============================

initUI();

loadDataset();