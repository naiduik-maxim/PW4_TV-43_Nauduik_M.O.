const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
    try {
        // 1. GET - Отримати поточну конфігурацію SCADA
        console.log('GET /api/scada');
        let response = await fetch(`${BASE_URL}/scada`);
        let data = await response.json();
        console.log('Response:', data);
        console.log('---\n');

        // 2. GET - Список пристроїв
        console.log('GET /api/scada/devices');
        response = await fetch(`${BASE_URL}/scada/devices`);
        data = await response.json();
        console.log('Response:', data);
        console.log('---\n');

        // 3. GET - Список точок даних
        console.log('GET /api/scada/datapoints');
        response = await fetch(`${BASE_URL}/scada/datapoints`);
        data = await response.json();
        console.log('Response:', data);
        console.log('---\n');

        // 4. GET - Список активних тривог
        console.log('GET /api/scada/alarm');
        response = await fetch(`${BASE_URL}/scada/alarm`);
        data = await response.json();
        console.log('Response:', data);
        console.log('---\n');

        console.log('POST /api/scada/configure');
        const newConfig = {
            systemName: "Leopard",
            samplingRate: 15,
            connectedDevices: 42,
            alarmLevel: "warning"
        };
        response = await fetch(`${BASE_URL}/scada/configure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newConfig)
        });
        data = await response.json();
        console.log('Response (Status ' + response.status + '):', data);
        const createdId = data.data.id;

        console.log('PUT /api/scada');
        const updatePayload = {
            id: createdId,
            communicationStatus: "offline",
            alarmLevel: "critical"
        };
        response = await fetch(`${BASE_URL}/scada`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
        });
        data = await response.json();
        console.log('Response (Status ' + response.status + '):', data);
        console.log('---\n');

        console.log('Test success!');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAPI();