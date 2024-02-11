import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import path from 'path'
import {mongoose} from 'mongoose'
import User from './public/Schema/schema.js'
import passport from 'passport'
import LocalStrategy from 'passport-local'

const MONGO_URL = process.env.MONGODB_URL
const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 3000

const server = createServer(app);
const io = new Server(server);

async function main(){
    await mongoose.connect(MONGO_URL)
}
main().catch((err)=>{
    console.log(err)
})
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next)=>{
    res.sendFile(path.join(__dirname, "index.html"))
})

app.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
});

app.get('/signup', (req, res)=>{
    res.sendFile(path.join(__dirname, "/public/SignUp/signup.html"))
})

app.post('/signup', (req, res)=>{
    console.log(req.body.username);
    console.log(req.body.password);
});

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
    socket.on("move", (e) => {
        let code = Array.from(socket.rooms)[1]
        console.log(io.sockets.adapter.rooms)
        console.log(socket.id)
        socket.to(code).emit("go", e);
    });
    socket.on("gameover", ()=>{
        let code = Array.from(socket.rooms)[1]
        socket.to(code).emit("over")
        socket.disconnect()
    })
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id)
    });
})

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
        });
    }
));

server.listen(PORT, "0.0.0.0", ()=>{
    console.log("running")
})
