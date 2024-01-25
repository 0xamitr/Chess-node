import Game from './game.js'

const btn = document.getElementById("button")
const input = document.getElementById("input")
const submit_btn = document.getElementById("submit-input")
let socket;
btn.addEventListener("click", () => {
    createConnection();
    
})
input.addEventListener("keyup", (e) => {
    if(e.key == "Enter"){
        submit();
    }
})
submit_btn.addEventListener("click", ()=>{
    submit();
})

const createConnection = ()=>{
    const code = Math.floor(Math.random() * 1000);
    input.style.display = "none"
    document.getElementById("code").textContent = code
    socket = io()
    socket.emit('code', code)
    socket.on('connection_established', ()=>{
        alert("connection")
        Game();
    })
}
const submit = ()=>{
    socket = io()
    socket.emit('submit', parseInt(input.value));
    input.value = ""
    socket.on('roomfull', ()=>{
        alert("roomfull")
    })
    socket.on('connection_established', ()=>{
        alert("connection")
        Game();
    })
}