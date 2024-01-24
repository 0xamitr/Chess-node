import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import path from 'path'
import { SocketAddress } from 'net';
import { rootCertificates } from 'tls';

const __dirname = path.resolve();
const app = express();
const PORT = 5000;
const server = createServer(app);
const io = new Server(server);
app.use( express.static( __dirname + '/public' ));

app.get('/', (req, res, next)=>{
    res.sendFile(path.join(__dirname, "index.html"))
})
io.on('connection', (socket) => {
    console.log("user connected", socket.id)
    socket.on('code', (code)=>{
        socket.join(code.code)
    })
    socket.on('submit', (submit)=>{
        let room = (io.sockets.adapter.rooms.get(submit))
        socket.join(room)
        console.log(io.sockets.adapter.rooms)
        room.emit("hi", "fasfas");
    })
    socket.on('disconnect', () => {
        console.log('user disconnected')
    });
})

server.listen(PORT, ()=>{
    console.log("running")
})
