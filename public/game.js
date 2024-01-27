let move = false;
let selected;
let globalturn = false
let int
let timerinterval = 120
const timer = document.getElementById('timer')
function Game(socket, code, turn) {
    globalturn = turn
    timer.textContent = format(timerinterval)
    if(globalturn){
        start()
    }
    document.getElementById('one').style.display = "none"
    const two = document.getElementById('two')
    for (let i = 0; i < 8; i++) {
        const row = document.createElement('div')
        for (let j = 0; j < 8; j++) {
            const boxes = document.createElement('div')
            boxes.className = "box"
            if (i == 1) {
                boxes.classList.add("enemy")
                if(!globalturn)
                    boxes.textContent = String.fromCharCode(9817)
                else
                    boxes.textContent = String.fromCharCode(9823)
            }
            else if (i == 0) {
                boxes.classList.add("enemy")
                if (j == 6 || j == 1) {
                    if(!globalturn)
                        boxes.textContent = String.fromCharCode(9816)
                    else
                        boxes.textContent = String.fromCharCode(9822)
                }
                else if (j == 5 || j == 2) {
                    if(!globalturn)
                        boxes.textContent = String.fromCharCode(9815)
                    else
                        boxes.textContent = String.fromCharCode(9821)
                }
                else if (j == 7 || j == 0) {
                    if(!globalturn)
                        boxes.textContent = String.fromCharCode(9814)
                    else
                        boxes.textContent = String.fromCharCode(9820)                }
                else if (j == 3) {
                    if(!globalturn)
                        boxes.textContent = String.fromCharCode(9813)
                    else
                        boxes.textContent = String.fromCharCode(9819)
                }
                else if (j == 4) {
                    if(!globalturn)
                        boxes.textContent = String.fromCharCode(9812)
                    else
                        boxes.textContent = String.fromCharCode(9818)
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
    eventlistener(socket, code)
    socket.on('go', (e) => {
        start()
        globalturn = true
        console.log(e)
        const id = "" + e.initial[0] + "," + e.initial[1]
        const finalid = e.final[0] + "," + e.final[1]
        let select = document.getElementById(id)
        let final = document.getElementById(finalid)
        final.textContent = select.textContent
        select.textContent = ""
        Array.from(final.classList).forEach(function (className) {
            if (className != "box") {
                final.classList.remove(className)
            }
        });
        Array.from(select.classList).forEach(function (className) {
            if (className != "box") {
                final.classList.add(className)
                select.classList.remove(className)
            }
        });
    })
}

function eventlistener(socket, code) {
    const list = document.querySelectorAll('.box')
    Array.from(list).forEach((elem) => {
        listener(elem, socket, code)
    })
}

function listener(elem, socket) {
    elem.addEventListener("click", (event) => {
        if (globalturn) {
            if (elem.classList.contains("occupied")) {
                move = true
                selected = event.target
                possibleMoves(elem)
            }
            if (move && elem.classList.contains("show")) {
                stop()
                if (event.target.classList.contains("enemy")) {
                    event.target.classList.remove("enemy")
                }
                const initial_pos = modifyPosition((selected.id).split(","));
                const final_pos = modifyPosition((event.target.id).split(","));
                socket.emit("move", {
                    initial: initial_pos,
                    final: final_pos
                });
                removeShow()
                move = false
                event.target.textContent = selected.textContent
                selected.textContent = "";
                console.log(selected.classList)
                Array.from(selected.classList).forEach(function (className) {
                    if (className != "box") {
                        event.target.classList.add(className)
                        selected.classList.remove(className)
                    }
                });
                globalturn = false
            }
        }
    })
}

function possibleMoves(elem) {
    removeShow();
    const pos = (elem.id).split(",");
    pos[0] = parseInt(pos[0])
    pos[1] = parseInt(pos[1])
    if (elem.classList.contains("knight")) {
        let temp
        const a = [-2, -1, 1, 2]
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < a.length; j++) {
                if (Math.abs(a[i]) + Math.abs(a[j]) === 3) {
                    temp = pos.slice();
                    temp[0] = temp[0] + a[i];
                    temp[1] = temp[1] + a[j];
                    if (temp[0] < 0 || temp[0] > 7 || temp[1] < 0 || temp[1] > 7) {
                        continue;
                    }
                    const toshow = document.getElementById(`${temp[0]},${temp[1]}`);
                    if (toshow.classList.contains("occupied")) {
                        continue;
                    }
                    toshow.classList.add("show");
                }
            }
        }
    }
    else if (elem.classList.contains("queen")) {
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i == 0 && j == 0) {
                    continue;
                }
                let temp = pos.slice();
                console.log(temp)
                while (true) {
                    temp[0] = temp[0] + i;
                    temp[1] = temp[1] + j;
                    if ((temp[0] < 0 || temp[0] > 7 || temp[1] < 0 || temp[1] > 7)) {
                        break;
                    }
                    const toshow = document.getElementById(`${temp[0]},${temp[1]}`)
                    if (toshow.classList.contains("occupied")) {
                        break;
                    }
                    toshow.classList.add("show")
                    if (toshow.classList.contains("enemy")) {
                        break;
                    }
                }
            }
        }
    }
    else if (elem.classList.contains("bishop")) {
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (Math.abs(i) == Math.abs(j) && i != 0) {
                    let temp = pos.slice();
                    console.log(temp)
                    while (true) {
                        temp[0] = temp[0] + i;
                        temp[1] = temp[1] + j;
                        if ((temp[0] < 0 || temp[0] > 7 || temp[1] < 0 || temp[1] > 7)) {
                            break;
                        }
                        const toshow = document.getElementById(`${temp[0]},${temp[1]}`)
                        if (toshow.classList.contains("occupied")) {
                            break;
                        }
                        toshow.classList.add("show")
                        if (toshow.classList.contains("enemy")) {
                            break;
                        }
                    }
                }
            }
        }
    }
    else if (elem.classList.contains("pawn")) {
        let temp = pos.slice();
        if ((temp[0] > 0 || temp[0] <= 7 || temp[1] >= 0 || temp[1] <= 7)) {
            temp[0]--;
            const toshow = document.getElementById(`${temp[0]},${temp[1]}`)
            if (!toshow.classList.contains("occupied")) {
                toshow.classList.add("show")
            }
            const idl = temp[0] + "," + (temp[1]-1)
            const idr = temp[0] + "," + (temp[1]+1)
            const left = document.getElementById(idl)
            const right = document.getElementById(idr)
            if(left.classList.contains("enemy"))
                left.classList.add("show")
            if(right.classList.contains("enemy"))
                right.classList.add("show")
            if (temp[0] == 5) {
                temp[0]--;
                const toshow = document.getElementById(`${temp[0]},${temp[1]}`)
                if (!toshow.classList.contains("occupied")) {
                    toshow.classList.add("show")
                }
            }
        }
    }
    else if (elem.classList.contains("rook")) {
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (Math.abs(i - j) == 1) {
                    let temp = pos.slice();
                    while (true) {
                        temp[0] = temp[0] + i;
                        temp[1] = temp[1] + j;
                        if ((temp[0] < 0 || temp[0] > 7 || temp[1] < 0 || temp[1] > 7)) {
                            break;
                        }
                        const toshow = document.getElementById(`${temp[0]},${temp[1]}`)
                        if (toshow.classList.contains("occupied")) {
                            break;
                        }
                        toshow.classList.add("show")
                        if (toshow.classList.contains("enemy")) {
                            break;
                        }
                    }
                }
            }
        }
    }
    else if (elem.classList.contains("king")) {
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let temp = pos.slice();
                temp[0] = temp[0] + i;
                temp[1] = temp[1] + j;
                if ((temp[0] < 0 || temp[0] > 7 || temp[1] < 0 || temp[1] > 7)) {
                    continue;
                }
                const toshow = document.getElementById(`${temp[0]},${temp[1]}`)
                if (toshow.classList.contains("occupied")) {
                    continue;
                }
                toshow.classList.add("show")
            }
        }
    }
}

function modifyPosition(pos) {
    pos[0] = 7 - pos[0]
    return pos;
}

function removeShow() {
    const list = document.querySelectorAll('.show')
    Array.from(list).forEach((e) => {
        e.classList.remove('show')
    })
}

function start(){
    int = setInterval(()=>{
        timerinterval--;
        timer.textContent = format(timerinterval);
        if(timerinterval == 0){
            clearInterval(int)
        }
    }, 1000)
}

function stop(){
    clearInterval(int)
}

function format(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    remainingSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    return minutes + ':' + remainingSeconds;
}

export default Game