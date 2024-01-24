const btn = document.getElementById("button")
const input = document.getElementById("input")
const submit_btn = document.getElementById("submit-input")

let socket;
btn.addEventListener("click", () => {
    const code = Math.floor(Math.random() * 1000);
    input.style.display = "none"
    document.getElementById("code").textContent = code
    socket = io()
    socket.emit('code', {
        code: code,
        id: socket.id
    });
})
input.addEventListener("keyup", (e) => {
    if(e.key == "Enter"){
        socket = io()
        socket.emit('submit', parseInt(e.value));
        input.value = ""
    }
})
submit_btn.addEventListener("click", ()=>{
    socket = io()
    socket.emit('submit', parseInt(input.value));
    input.value = ""
})
socket.on('hi', (msg) => {
    const item = document.createElement('li');
    item.textContent = msg;
    document.appendChild(item);
  });