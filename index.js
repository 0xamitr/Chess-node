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
setInterval(()=>{
    console.log(io.sockets.adapter.rooms)
    console.log(io.sockets.sockets.size)
}, 5000)
io.on('connection', (socket) => {
    console.log("user connected", socket.id)
    socket.leave(socket.id);
    socket.on('code', (code)=>{
        socket.join(code)
        setTimeout(()=>{
            if(io.sockets.adapter.rooms(code) && io.sockets.adapter.rooms.get(code).size == 1){
                console.log("gesdf")
                socket.disconnect();
            }
        }, 10 * 1000)
    })
    socket.on('submit', (submit)=>{
        let room = (io.sockets.adapter.rooms.get(submit))
        console.log(room)
        if(room){
            console.log(room.size)
            if(room.size == 1){
                socket.join(submit)
                io.to(submit).emit("connection_established")
            }
            else{
                socket.emit("roomfull")
                socket.disconnect();
            }
        }
        else{
            socket.disconnect();
        }
    })
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id)
    });
})

server.listen(PORT, ()=>{
    console.log("running")
})
