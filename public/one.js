import Game from './game.js'

const btn = document.getElementById("button")
const input = document.getElementById("input")
const submit_btn = document.getElementById("submit-input")
let socket;
let globalturn = true
const two = document.getElementById('two')
for (let i = 0; i < 8; i++) {
    const row = document.createElement('div')
    for (let j = 0; j < 8; j++) {
        const boxes = document.createElement('div')
        boxes.classList.add("box")
        if(i%2 == 0){
            if(j%2 == 0){
                boxes.classList.add("light");
            }
            else{
                boxes.classList.add("dark")
            }
        }
        else{
            if(j%2 != 0){
                boxes.classList.add("light");
            }
            else{
                boxes.classList.add("dark")
            }
        }
        if (i == 1) {
            boxes.classList.add("enemy")
            if(!globalturn)
                boxes.textContent = String.fromCharCode(9817)
            else
                boxes.textContent = String.fromCharCode(9823)
            boxes.classList.add("epawn")
        }
        else if (i == 0) {
            boxes.classList.add("enemy")
            if (j == 6 || j == 1) {
                if(!globalturn)
                    boxes.textContent = String.fromCharCode(9816)
                else
                    boxes.textContent = String.fromCharCode(9822)
                boxes.classList.add("eknight")
            }
            else if (j == 5 || j == 2) {
                if(!globalturn)
                    boxes.textContent = String.fromCharCode(9815)
                else
                    boxes.textContent = String.fromCharCode(9821)
                boxes.classList.add("ebishop")

            }
            else if (j == 7 || j == 0) {
                if(!globalturn)
                    boxes.textContent = String.fromCharCode(9814)
                else
                    boxes.textContent = String.fromCharCode(9820)  
                boxes.classList.add("erook")              
            }
            else if (j == 3) {
                if(!globalturn)
                    boxes.textContent = String.fromCharCode(9813)
                else
                    boxes.textContent = String.fromCharCode(9819)
                    boxes.classList.add("equeen")
            }
            else if (j == 4) {
                if(!globalturn)
                    boxes.textContent = String.fromCharCode(9812)
                else
                    boxes.textContent = String.fromCharCode(9818)
                boxes.classList.add("eking")
            }
        }
        else if (i == 6) {
            boxes.classList.add("occupied")
            if(globalturn)
                boxes.textContent = String.fromCharCode(9817)
            else
                boxes.textContent = String.fromCharCode(9823)
            boxes.classList.add("pawn")
        }
        else if (i == 7) {
            boxes.classList.add("occupied")
            if (j == 6 || j == 1) { 
                if(globalturn)
                    boxes.textContent = String.fromCharCode(9816)
                else
                    boxes.textContent = String.fromCharCode(9822)
                boxes.classList.add("knight")
            }
            else if (j == 5 || j == 2) {
                if(globalturn)
                    boxes.textContent = String.fromCharCode(9815)
                else
                    boxes.textContent = String.fromCharCode(9821)
                boxes.classList.add("bishop")
            }
            if (j == 7 || j == 0) {
                if(globalturn)
                    boxes.textContent = String.fromCharCode(9814)
                else
                    boxes.textContent = String.fromCharCode(9820)
                boxes.classList.add("rook")
            }
            else if (j == 3) {
                if(globalturn)
                    boxes.textContent = String.fromCharCode(9813)
                else
                    boxes.textContent = String.fromCharCode(9819)
                boxes.classList.add("queen")
            }
            else if (j == 4) {
                if(globalturn)
                    boxes.textContent = String.fromCharCode(9812)
                else
                    boxes.textContent = String.fromCharCode(9818)
                boxes.classList.add("king")
            }
        }
        boxes.id = `${i},${j}`
        row.append(boxes)
    }
    row.className = "row"
    two.append(row)
}
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
    document.getElementById("code").textContent = code
    socket = io()
    console.log("Socket:", socket);
    socket.emit('code', code)
    socket.on('connection_established', ()=>{
        alert("connection")
        Game(socket, code, true);
    })
}
const submit = ()=>{
    socket = io()
    console.log(socket)
    const val = parseInt(input.value)
    socket.emit('submit', val);
    input.value = ""
    socket.on('roomfull', ()=>{
        alert("roomfull")
    })
    socket.on('connection_established', ()=>{
        alert("connection")
        Game(socket, val, false);
    })
}