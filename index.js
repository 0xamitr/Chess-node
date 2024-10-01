import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'https';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3005;

const isProduction = process.env.NODE_ENV === 'production';

let keyPath
let certPath

if (isProduction) {
    keyPath = '/etc/letsencrypt/live/socket.chessy.tech/privkey.pem'
    certPath = '/etc/letsencrypt/live/socket.chessy.tech/fullchain.pem'
}

console.log(isProduction)
let options;

if (isProduction) {
    try {
        options = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
        };
    } catch (error) {
        console.error("Error reading certificate files:", error);
        process.exit(1); // Exit if there's an error
    }
}
let server;
if (isProduction)
    server = createServer(options, app);
else
    server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.use(express.json());

setInterval(() => {
    console.log(io.sockets.adapter.rooms)
}, 5000)

io.on('connection', (socket) => {
    console.log("user connected", socket.id)
    socket.on('code', (code, id, name) => {
        socket.userId = id
        socket.name = name
        socket.join(code)
        setTimeout(() => {
            if (io.sockets.adapter.rooms.get(code) && io.sockets.adapter.rooms.get(code).size == 1) {
                console.log("gesdf")
                socket.disconnect();
            }
        }, 30 * 1000)
    })
    socket.on('submit', (submit, id, name) => {
        console.log('code', submit)
        console.log('Type of submit:', typeof submit);
        socket.userId = id
        socket.name = name
        let room = (io.sockets.adapter.rooms.get(submit))
        console.log(io.sockets.adapter.rooms)
        console.log(room)
        if (room) {
            console.log(room.size)
            if (room.size == 1) {
                socket.join(submit)
                const roomSockets = Array.from(io.sockets.adapter.rooms.get(submit) || []);
                const userIds = roomSockets.map(id => io.sockets.sockets.get(id)?.userId).filter(id => id !== undefined)
                const names = roomSockets.map(id => io.sockets.sockets.get(id)?.name).filter(id => id !== undefined)
                console.log("hi", userIds, names)
                io.to(submit).emit("connection_established", userIds, names)
            }
            else {
                socket.emit("roomfull")
                socket.disconnect();
            }
        }
        else {
            socket.emit("roomnotfound")
            socket.disconnect();
        }
    })
    socket.on('move', (move, code) => {
        console.log(code)
        let room = (io.sockets.adapter.rooms.get(code))
        if (room) {
            console.log(room.size)
            if (room.size == 2) {
                io.to(code).emit("move", move)
            }
            else {
                socket.emit("error")
            }
        }
    })

    socket.on('endGame', (code) => {
        console.log(code)
        let room = (io.sockets.adapter.rooms.get(code))
        if (room) {
            console.log(room.size)
            if (room.size == 2) {
                io.to(code).emit("endGame")
            }
            else {
                socket.emit("error")
            }
        }
    })

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id)
    });
})

server.listen(PORT, "0.0.0.0", () => {
    console.log("running")
})
