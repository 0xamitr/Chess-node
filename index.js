import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import path from 'path'

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 3005

const server = createServer(app);
const io = new Server(server, {
    cors: {
      origin: '*',
    }
});
app.use(express.json());


setInterval(()=>{
    console.log(io.sockets.adapter.rooms)
}, 5000)

io.on('connection', (socket) => {
    console.log("user connected", socket.id)
    socket.on('code', (code)=>{
        socket.join(code)
        setTimeout(()=>{
            if(io.sockets.adapter.rooms.get(code) && io.sockets.adapter.rooms.get(code).size == 1){
                console.log("gesdf")
                socket.disconnect();
            }
        }, 30 * 1000)
    })
    socket.on('submit', (submit)=>{
        console.log('code', submit)
        console.log('Type of submit:', typeof submit);

        let room = (io.sockets.adapter.rooms.get(submit))
        console.log(io.sockets.adapter.rooms)
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

server.listen(PORT, "0.0.0.0", ()=>{
    console.log("running")
})
