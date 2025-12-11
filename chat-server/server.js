const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log("🔥 WebSocket server is running on ws://localhost:8080");

wss.on('connection', (ws) => {
    console.log("🟢 New client connected");

    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message.toString());
        } catch {
            console.log("❌ Invalid JSON");
            return;
        }

        if (data.type === "typing") {
            broadcastOthers(ws, {
                type: "typing",
                user: data.user
            });
            return;
        }

        if (data.type === "message") {
            console.log(`💬 ${data.user}: ${data.text}`);

            broadcast({
                type: "message",
                user: data.user,
                color: data.color,
                text: data.text
            });
        }
    });

    ws.on('close', () => {
        console.log("🔴 Client disconnected");
    });
});

function broadcast(data) {
    const json = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(json);
        }
    });
}

function broadcastOthers(except, data) {
    const json = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client !== except && client.readyState === WebSocket.OPEN) {
            client.send(json);
        }
    });
}