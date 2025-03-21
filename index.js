const WebSocket = require("ws");
const { TYPES } = require("./types");
const wss = new WebSocket.Server({ port: 8080 });

const sendOrders = [];

wss.on("connection", function connection(ws) {
  console.log("Cliente conectado");

  // Enviar un mensaje al cliente
  ws.send(JSON.stringify({ message: "Conexión establecida" }));

  // Recibir mensajes del cliente
  ws.on("message", function incoming(message) {
    console.log("Recibido: %s", message);
    const { type, payload } = JSON.parse(message);

    if (type === TYPES.START_SENDING) {
      sendOrders.push(payload.checkoutId);
    }

    if (type === TYPES.UPDATE_STATUS_SENDING) {
      if (sendOrders.includes(payload.checkoutId)) {
        ws.send(
          JSON.stringify({
            message: JSON.parse({
              type: TYPES.UPDATE_STATUS_SENDING,
              payload: {
                checkoutId: payload.checkoutId,
                status: payload.status,
              },
            }),
          })
        );
      }
    }

    if (type === TYPES.FINISHED_SENDING) {
      const index = sendOrders.indexOf(payload.checkoutId);
      if (index !== -1) {
        sendOrders.splice(index, 1);
      }
      ws.send(
        JSON.stringify({
          message: JSON.parse({
            type: TYPES.FINISHED_SENDING,
            payload: {
              checkoutId: payload.checkoutId,
            },
          }),
        })
      );
    }
  });

  console.log("Enviando mensajes a los clientes");
});
