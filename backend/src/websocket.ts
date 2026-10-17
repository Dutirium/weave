import type { Server } from "http";
import WebSocket, { WebSocketServer } from "ws";

type Client = {
    socket: WebSocket;
    weaveId: string | null;
};

const clients = new Set<Client>();

export function setupWebSocket(server: Server) {

    const wss = new WebSocketServer({
        server,
    });

    wss.on("connection", (socket) => {

        console.log("WebSocket client connected");

        const client: Client = {
            socket,
            weaveId: null,
        };

        clients.add(client);

        socket.send(
            JSON.stringify({
                type: "connection:success",
                message: "WebSocket connected",
            })
        );

        socket.on("message", (raw) => {

            try {

                const data = JSON.parse(raw.toString());

                if (
                    data.type === "subscribe" &&
                    typeof data.weaveId === "string"
                ) {

                    client.weaveId = data.weaveId;

                    console.log(
                        `Client subscribed to weave ${data.weaveId}`
                    );

                    socket.send(
                        JSON.stringify({
                            type: "subscription:success",
                            weaveId: data.weaveId,
                        })
                    );
                }

            } catch (error) {

                console.error(
                    "Invalid WebSocket message:",
                    error
                );

            }

        });

        socket.on("close", () => {

            console.log("WebSocket client disconnected");

            clients.delete(client);

        });

        socket.on("error", (error) => {

            console.error(
                "WebSocket error:",
                error
            );

            clients.delete(client);

        });

    });

    return wss;
}


export function broadcastToWeave(
    weaveId: string,
    event: object
) {

    //debugging condition       
    console.log("BroadcastToWeave", weaveId, event);

    const payload = JSON.stringify(event);

    for (const client of clients) {

        if (
            client.weaveId === weaveId &&
            client.socket.readyState === WebSocket.OPEN
        ) {

            client.socket.send(payload);

        }

    }

}