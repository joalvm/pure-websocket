import WebSocket, { Data, ErrorEvent, Server } from 'ws';
import dotenv from 'dotenv';
import { app } from './config';
import { v4 } from 'uuid';

dotenv.config();

// Creando el servidor
const server = new Server({
    port: app.APP_PORT,
    verifyClient: (_info, done: CallableFunction) => {
        // Sirve para verificar cada conección, de cada cliente.
        done(true);
    },
});

// Asignando los eventos para el servidor.
server
    .on('error', function (error: ErrorEvent) {
        console.log(error);
    })
    .on('listening', function () {
        console.log(`Servidor corriendo en el puerto ${this.options.port}`);
    })
    .on('connection', function (client: WebSocket) {
        // Asignando un identificador al cliente conectado
        (client as any).uuid = v4();

        // Agregando los eventos para el manejo del socket del cliente.
        client
            .on('error', function (error: ErrorEvent) {
                console.log(['From event Error of Websocket', error]);
            })
            .on('close', function (code: number, reason: string) {
                console.log(`El cliente ${(this as any).uuid} se ha desconectado.`);
            })
            .on('message', function (buffer: Data) {
                const payload: { event: string; data: any } = JSON.parse(buffer.toLocaleString());
                const handler = payload.event;
                const data = payload.data;
                const response = {
                    client: (this as any).uuid,
                    payload: { handler, data },
                };

                console.log(response);
                this.send(
                    JSON.stringify({
                        event: handler,
                        data: response,
                    }),
                );
            });

        console.log(`Cliente conectado: ${(client as any).uuid}`);
        client.send(
            JSON.stringify({
                client: (client as any).uuid,
                message: 'Bienvenido',
            }),
        );
    });
