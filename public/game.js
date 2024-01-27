let move = false;
let selected;
function Game(socket, code) {
    document.getElementById('one').style.display = "none"
    const two = document.getElementById('two')
    for (let i = 0; i < 8; i++) {
        const row = document.createElement('div')
        for (let j = 0; j < 8; j++) {
            const boxes = document.createElement('div')
            boxes.className = "box"
            if (i == 0 || i == 1) {
                boxes.classList.add("enemy")
            }
            if (i == 1) {
                boxes.textContent = "E Pawn"
            }
            else if (i == 0) {
                if (j == 7 || j == 0) {
                    boxes.textContent = "E Rook"
                }
                else if (j == 6 || j == 1) {
                    boxes.textContent = "E Knight"
                }
                else if (j == 5 || j == 2) {
                    boxes.textContent = "E Bishop"
                }
                else if (j == 4) {
                    boxes.textContent = "E King"
                }
                else if (j == 3) {
                    boxes.textContent = "E Queen"
                }
            }
            if (i == 6 || i == 7) {
                boxes.classList.add("occupied")
            }
            if (i == 6) {
                boxes.textContent = "Pawn"
                boxes.classList.add("pawn")
            }
            else if (i == 7) {
                if (j == 7 || j == 0) {
                    boxes.textContent = "Rook"
                    boxes.classList.add("rook")
                }
                else if (j == 6 || j == 1) {
                    boxes.textContent = "Knight"
                    boxes.classList.add("knight")
                }
                else if (j == 5 || j == 2) {
                    boxes.textContent = "Bishop"
                    boxes.classList.add("bishop")
                }
                else if (j == 4) {
                    boxes.textContent = "King"
                    boxes.classList.add("king")
                }
                else if (j == 3) {
                    boxes.textContent = "Queen"
                    boxes.classList.add("queen")
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
        console.log(e)
        alert("move")
        const id = "" + e.initial[0] + "," + e.initial[1]
        const finalid = e.final[0] + "," + e.final[1]
        console.log(typeof(id))
        let select = document.getElementById(id)
        console.log(select)
        let final = document.getElementById(finalid)
        final.textContent = select.textContent
        select.textContent = ""
        Array.from(select.classList).forEach(function(className) {
            if(className!="box"){
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

function listener(elem, socket, code) {
    elem.addEventListener("click", (event) => {
        if (elem.classList.contains("occupied")) {
            move = true
            selected = event.target
            possibleMoves(elem)
        }
        if (move && elem.classList.contains("show")) {
            const initial_pos = modifyPosition((selected.id).split(","));
            const final_pos = modifyPosition((event.target.id).split(","));
            socket.emit("move", {
                initial: initial_pos,
                final: final_pos
            });
            removeShow()
            move = false;
            event.target.textContent = selected.textContent
            selected.textContent = "";
            console.log(selected.classList)
            Array.from(selected.classList).forEach(function(className) {
                if(className!="box"){
                    event.target.classList.add(className)
                    selected.classList.remove(className)
                }
            });
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
                    console.log("Fafdfsf")
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
export default Game