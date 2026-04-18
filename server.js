const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

const DATA_PATH = path.join(__dirname, 'data', 'records.json');

function readData(){
    try{
        if(!fs.existsSync(DATA_PATH)){
            return null;
        }
        const data = fs.readFileSync(DATA_PATH, 'utf-8');
        if (!data) return null;
        return JSON.parse(data);
    } catch (e) {
        console.error('Data read error: ', e);
        return null;
    }
}

function writeData(data){
    try{
        const dir = path.dirname(DATA_PATH);
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir, {recursive: true});
        }

        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error('Data write error:', e);
        return false;
    }
}

let db = readData();

if (!db) {
    db = {
        scada: [{
            id: 1,
            systemName: "Ambrams",
            connectedDevices: 5,
            dataPointsCount: 150,
            samplingRate: 60,
            alarmLevel: "normal", 
            communicationStatus: "connected",
            lastUpdate: new Date().toISOString(),
            storageUsed: 45
        }],
        devices: [
            { id: 1, name: "RLS-1", status: "online" },
            { id: 2, name: "RLS-2", status: "offline" }
        ],
        datapoints: [
            { id: 1, deviceId: 1, name: "Temperature", value: 45.5 },
            { id: 2, deviceId: 1, name: "Pressure", value: 1.2 }
        ],
        alarms: [
            { id: 1, level: "warning", message: "Low memory on RLS-1", active: true }
        ]
    };
    writeData(db);
}

app.get('/api/scada', (req, res) => {
    res.json(db.scada);
});

app.get('/api/scada/devices', (req, res) => {
    res.json(db.devices);
});

app.get('/api/scada/datapoints', (req, res) => {
    res.json(db.datapoints);
});

app.get('/api/scada/alarm', (req, res) => {
    res.json(db.alarms);
});

app.post('/api/scada/configure', (req, res) => {
    const {
        systemName, 
        connectedDevices, 
        dataPointsCount, 
        samplingRate, 
        alarmLevel, 
        communicationStatus, 
        storageUsed
    } = req.body;

    if (!systemName || samplingRate == undefined){
        return res.status(400).json({ 
            error: "For create new configuration need define systemName and samplingRate" 
        });
    }

    const newScada = {
        id: db.scada.length > 0 ? Math.max(...db.scada.map(s => s.id)) + 1 : 1,
        systemName,
        connectedDevices: connectedDevices || 0,
        dataPointsCount: dataPointsCount || 0,
        samplingRate,
        alarmLevel: alarmLevel || "normal",
        communicationStatus: communicationStatus || "connected",
        lastUpdate: new Date().toISOString(),
        storageUsed: storageUsed || 0
    }

    db.scada.push(newScada);

    if (writeData(db)){
        res.status(201).json({ 
            message: "New SCADA added", 
            data: newScada 
        });
    } else {
        res.status(500).json({ error: "Saving failure" });
    }
});

app.put('/api/scada', (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: "You must specify an ID to update" });
    }

    const index = db.scada.findIndex(s => s.id === parseInt(id));

    if (index === -1) {
        return res.status(404).json({ error: "System not found" });
    }

    db.scada[index] = {
        ...db.scada[index],
        ...req.body,
        id: parseInt(id), 
        lastUpdate: new Date().toISOString()
    };

    writeData(db);
    res.json({ message: "Settings SCADA updated", data: db.scada[index] });
});

app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});

app.listen(PORT, () => {
    console.log(`server run: http://localhost:${PORT}`);
});