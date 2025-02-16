import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import createGame from './creategame.js';
import { createClient } from 'redis';
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

// console.log(isProduction)
let options;

// client.on('error', err => console.log('Redis Client Error', err));

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
const onlineUsers = {}
const clientRoom = {}
const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

app.use(express.json());

const games = new Map()

// setInterval(() => {
// console.log(io.sockets.adapter.rooms)
// console.log(onlineUsers)
// }, 5000)

io.on('connection', async (socket) => {
    console.log("user connected", socket.id)
    const userId = socket.handshake.query.id;
    const username = socket.handshake.query.username;

    const r = clientRoom[userId]
    if (r) {
        const room = r
        socket.join(room)
    }
    console.log("room", r)
    const game = games[r]
    if (game) {
        const gameState2 = {
            player1Name: game.player1Name,
            player2Name: game.player2Name,
            player1Id: game.player1Id,
            player2Id: game.player2Id,
            board: game.board,
            turn: game.turn,
            whitetime: game.whitetime,
            blacktime: game.blacktime,
            movelist: game.movelist,
            tempmove: game.tempmove,
            totalmoves: game.totalmoves,
            pgn: game.pgn,
            roomCode: game.code,
            lastwhitetime: game.lastwhitetime,
            lastblacktime: game.lastblacktime,
        }
        console.log("fire")
        socket.emit('game-update', gameState2);
    }


    if (userId)
        onlineUsers[userId] = socket.id;

    socket.on('challenge', id => {
        const toId = onlineUsers[id]
        const fromId = onlineUsers[userId]
        if (toId) {
            // console.log("fds")
            io.to(toId).emit('challenge-received', fromId, username);
        }
    })

    socket.on('challenge-accepted', async (from) => {
        const toId = onlineUsers[userId]
        const room = from + toId
        io.to(from).emit('start-game', { room });
        io.to(toId).emit('start-game', { room });

        socket.join(room)
        io.sockets.sockets.get(from).join(room)
        console.log("holy shit")
        const opponentId = io.sockets.sockets.get(from).handshake.query.id
        const opponentName = io.sockets.sockets.get(from).handshake.query.username

        if(games[room])
            return Error("wtf")

        games[room] = createGame(userId, opponentId, username, opponentName, room)

        clientRoom[userId] = room
        clientRoom[opponentId] = room

        io.to(room).emit("connection_established", userId, room, [{ id: opponentId, name: opponentName }, { id: userId, name: username }])
    })

    socket.on('code', (code, id, name) => {
        socket.userId = id
        socket.name = name
        socket.join(code)
        setTimeout(() => {
            if (io.sockets.adapter.rooms.get(code) && io.sockets.adapter.rooms.get(code).size == 1) {
                // console.log("gesdf")
                socket.disconnect();
            }
        }, 30 * 1000)
    })

    socket.on('submit', async (submit, id, name) => {
        // console.log('code', submit)
        // console.log('Type of submit:', typeof submit);
        let room = (io.sockets.adapter.rooms.get(submit))
        // console.log(io.sockets.adapter.rooms)
        // console.log(room)
        if (room) {
            // console.log(room.size)
            if (room.size == 1) {
                socket.join(submit)
                const opponentId = io.sockets.sockets.get(from).handshake.query.id
                const opponentName = io.sockets.sockets.get(from).handshake.query.username
                io.to(submit).emit("connection_established", userId, submit[{ id: opponentId, name: opponentName }, { id: userId, name: username }])
                await client.set(id, submit)
                await client.set(opponentId, submit)
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

    socket.on('move', async (move, code) => {
        const game = games[code]
        let room = (io.sockets.adapter.rooms.get(code))
        if (room) {
            if (room.size == 2) {
                game.acceptMove(move)
                const gameState = {
                    player1Name: game.player1Name,
                    player2Name: game.player2Name,
                    player1Id: game.player1Id,
                    player2Id: game.player2Id,
                    board: game.board,
                    turn: game.turn,
                    whitetime: game.whitetime,
                    blacktime: game.blacktime,
                    movelist: game.movelist,
                    pgn: game.pgn,
                    tempmove: game.tempmove,
                    totalmoves: game.totalmoves,
                    roomCode: game.code,
                    lastwhitetime: game.lastwhitetime,
                    lastblacktime: game.lastblacktime,
                }
                io.to(code).emit('game-update', gameState);
            }
            else {
                socket.emit("error")
            }
        }
    })

    socket.on('endGame', async (code) => {
        await client.del(`game:${userId}`)
        // console.log(code)
        let room = (io.sockets.adapter.rooms.get(code))
        if (room) {
            // console.log(room.size)
            if (room.size == 2) {
                io.to(code).emit("endGame")
            }
            else {
                socket.emit("error")
            }
        }
    })

    socket.on('disconnect', () => {
        delete onlineUsers[userId]
        // console.log('user disconnected', socket.id)
    });
})

server.listen(PORT, "0.0.0.0", () => {
    console.log("running")
})
