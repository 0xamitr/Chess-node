let move = false;
let selected;
let globalturn = false
let int
let timerinterval = 120
const timer = document.getElementById('timer')
let globalcheck = false
let k = []
function Game(socket, code, turn) {
    globalturn = turn
    timer.textContent = format(timerinterval)
    if (globalturn)
        start(socket)
    const two = document.getElementById('two')
    two.innerHTML = ""
    for (let i = 0; i < 8; i++) {
        const row = document.createElement('div')
        let j = globalturn ? 0: 7;
        while((globalturn && (j < 8)) || (!globalturn && (j > -1))){
            const boxes = document.createElement('div')
            boxes.classList.add("box")
            let t
            if(globalturn)
                t = j
            else
                t = 7-j
            if (i % 2 == 0) {
                if (t % 2 == 0) {
                    boxes.classList.add("light");
                }
                else {
                    boxes.classList.add("dark")
                }
            }
            else {
                if (t % 2 != 0) {
                    boxes.classList.add("light");
                }
                else {
                    boxes.classList.add("dark")
                }
            }
            if (i == 1) {
                boxes.classList.add("enemy")
                if (!globalturn)
                    boxes.textContent = String.fromCharCode(9817)
                else
                    boxes.textContent = String.fromCharCode(9823)
                boxes.classList.add("epawn")
            }
            else if (i == 0) {
                boxes.classList.add("enemy")
                if (j == 6 || j == 1) {
                    if (!globalturn)
                        boxes.textContent = String.fromCharCode(9816)
                    else
                        boxes.textContent = String.fromCharCode(9822)
                    boxes.classList.add("eknight")
                }
                else if (j == 5 || j == 2) {
                    if (!globalturn)
                        boxes.textContent = String.fromCharCode(9815)
                    else
                        boxes.textContent = String.fromCharCode(9821)
                    boxes.classList.add("ebishop")

                }
                else if (j == 7 || j == 0) {
                    if (!globalturn)
                        boxes.textContent = String.fromCharCode(9814)
                    else
                        boxes.textContent = String.fromCharCode(9820)
                    boxes.classList.add("erook")
                }
                else if (j == 3) {
                    if (!globalturn)
                        boxes.textContent = String.fromCharCode(9813)
                    else
                        boxes.textContent = String.fromCharCode(9819)
                    boxes.classList.add("equeen")
                }
                else if (j == 4) {
                    if (!globalturn)
                        boxes.textContent = String.fromCharCode(9812)
                    else
                        boxes.textContent = String.fromCharCode(9818)
                    boxes.classList.add("eking")
                }
            }
            else if (i == 6) {
                boxes.classList.add("occupied")
                if (globalturn)
                    boxes.textContent = String.fromCharCode(9817)
                else
                    boxes.textContent = String.fromCharCode(9823)
                boxes.classList.add("pawn")
            }
            else if (i == 7) {
                boxes.classList.add("occupied")
                if (j == 6 || j == 1) {
                    if (globalturn)
                        boxes.textContent = String.fromCharCode(9816)
                    else
                        boxes.textContent = String.fromCharCode(9822)
                    boxes.classList.add("knight")
                }
                else if (j == 5 || j == 2) {
                    if (globalturn)
                        boxes.textContent = String.fromCharCode(9815)
                    else
                        boxes.textContent = String.fromCharCode(9821)
                    boxes.classList.add("bishop")
                }
                if (j == 7 || j == 0) {
                    if (globalturn)
                        boxes.textContent = String.fromCharCode(9814)
                    else
                        boxes.textContent = String.fromCharCode(9820)
                    boxes.classList.add("rook")
                    boxes.classList.add("notmoved")
                }
                else if (j == 3) {
                    if (globalturn)
                        boxes.textContent = String.fromCharCode(9813)
                    else
                        boxes.textContent = String.fromCharCode(9819)
                    boxes.classList.add("queen")
                }
                else if (j == 4) {
                    if (globalturn)
                        boxes.textContent = String.fromCharCode(9812)
                    else
                        boxes.textContent = String.fromCharCode(9818)
                    boxes.classList.add("king")
                    boxes.classList.add("notmoved")
                }
            }
            boxes.id = `${i},${j}`
            row.append(boxes)
            if(globalturn)
                j++
            else
                j--
        }
        row.className = "row"
        two.append(row)
    }
    eventlistener(socket, code)
    socket.on('over', () => {
        document.getElementById("gameoverheading").textContent = "YOU WIN"
        document.getElementById("gameover").style.display = "block"
        socket.disconnect()
        document.getElementById("container").style.filter = "blur(5px)"
    })
    socket.on('go', (e) => {
        start(socket)
        globalturn = true
        const id = "" + e.initial[0] + "," + e.initial[1]
        const finalid = e.final[0] + "," + e.final[1]
        let select = document.getElementById(id)
        let final = document.getElementById(finalid)
        final.textContent = select.textContent
        select.textContent = ""
        Array.from(final.classList).forEach(function (className) {
            if (className == "box" || className == "dark" || className == "light") {

            }
            else {
                final.classList.remove(className)
            }
        })
        Array.from(select.classList).forEach(function (className) {
            if (className == "box" || className == "dark" || className == "light") {

            }
            else {
                final.classList.add(className)
                select.classList.remove(className)
            }
        });
        const checkCheck = check()
        if (checkCheck.length != 0) {
            alert("check")
            globalcheck = true
            if (checkCheckmate() == true) {
                alert("checkmate")
                timerinterval = 0
            }
        }
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
                possibleMoves(elem, globalcheck)
            }
            if (move && elem.classList.contains("show")) {
                globalcheck = false
                stop()
                if (event.target.classList.contains("enemy")) {
                    event.target.classList.remove("enemy")
                }
                removeEnemy(event.target)
                const initial_pos = modifyPosition((selected.id).split(","));
                const final_pos = modifyPosition((event.target.id).split(","));
                socket.emit("move", {
                    initial: initial_pos,
                    final: final_pos
                });
                if (selected.textContent == String.fromCharCode(9814) || selected.textContent == String.fromCharCode(9812)) {
                    if (selected.classList.contains("notmoved")) {
                        selected.classList.remove("notmoved");
                    }
                }
                if ((selected.textContent == String.fromCharCode(9812) || selected.textContent == String.fromCharCode(9818)) && (event.target.id == "7,6" || event.target.id == "7,4")) {
                    let oldrook
                    let newrook
                    if (event.target.id == "7,6") {
                        console.log("ok")
                        oldrook = document.getElementById("7,7")
                        newrook = document.getElementById("7,5")
                        socket.emit("move", {
                            initial: [0,7],
                            final: [0,5]
                        });
                    }
                    else if (event.target.id == "7,1") {
                        oldrook = document.getElementById("7,0")
                        newrook = document.getElementById("7,3")
                    }
                    oldrook.classList.remove("notmoved")
                    Array.from(oldrook.classList).forEach(function (className) {
                        if (className == "box" || className == "dark" || className == "light") {
                        }
                        else {
                            newrook.classList.add(className)
                            oldrook.classList.remove(className)
                        }
                    })
                    newrook.textContent = oldrook.textContent
                    oldrook.textContent = ""
            
                }
                removeShow()
                move = false
                event.target.textContent = selected.textContent
                selected.textContent = "";
                Array.from(selected.classList).forEach(function (className) {
                    if (className == "box" || className == "dark" || className == "light") {
                    }
                    else {
                        event.target.classList.add(className)
                        selected.classList.remove(className)
                    }
                });
                globalturn = false
            }
        }
    })
}

function possibleMoves(elem, globalcheck, ok = 0) {
    let find = 0
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
                    let toshow
                    if (!globalcheck) {
                        toshow = document.getElementById(`${temp[0]},${temp[1]}`);
                        if (toshow.classList.contains("occupied")) {
                            continue;
                        }
                        if (!elem.hasAttribute("cant-move")) {
                            toshow.classList.add("show");
                        }
                        else if (elem.hasAttribute("cant-move")) {
                            if (toshow.hasAttribute("set-check")) {
                                doit(temp[0], temp[1], i, j)
                            }
                        }
                    }
                    else {
                        for (let t = 0; t < k.length; t++) {
                            if (compareArr(`${temp[0]},${temp[1]}`, k[t]) == true) {
                                toshow = document.getElementById(`${temp[0]},${temp[1]}`);
                                toshow.classList.add("show");
                                find++
                            }

                        }
                    }
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
                    let toshow
                    if (!globalcheck) {
                        toshow = document.getElementById(`${temp[0]},${temp[1]}`);
                        if (toshow.classList.contains("occupied")) {
                            break;
                        }
                        if (!elem.hasAttribute("cant-move")) {
                            toshow.classList.add("show");
                        }
                        else if (elem.hasAttribute("cant-move")) {
                            if (toshow.hasAttribute("set-check")) {
                                doit(temp[0], temp[1], i, j)
                            }
                        }
                        if (toshow.classList.contains("enemy")) {
                            break;
                        }
                    }
                    else {
                        toshow = document.getElementById(`${temp[0]},${temp[1]}`);
                        if (toshow.classList.contains("occupied")) {
                            break
                        }
                        for (let t = 0; t < k.length; t++) {
                            if (compareArr(`${temp[0]},${temp[1]}`, k[t]) == true) {
                                toshow.classList.add("show")
                                find++
                            }
                        }
                    }
                }
            }
        }
    }
    else if (elem.classList.contains("bishop")) {
        let lock = false
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (Math.abs(i) == Math.abs(j) && i != 0) {
                    let temp = pos.slice();
                    while (true) {
                        temp[0] = temp[0] + i;
                        temp[1] = temp[1] + j;
                        if ((temp[0] < 0 || temp[0] > 7 || temp[1] < 0 || temp[1] > 7)) {
                            break;
                        }
                        let toshow
                        if (!globalcheck) {
                            toshow = document.getElementById(`${temp[0]},${temp[1]}`);
                            if (toshow.classList.contains("occupied")) {
                                break;
                            }
                            if (!elem.hasAttribute("cant-move")) {
                                toshow.classList.add("show");
                            }
                            else if (elem.hasAttribute("cant-move")) {
                                if (toshow.hasAttribute("set-check")) {
                                    doit(temp[0], temp[1], i, j)
                                }
                            }
                            if (toshow.classList.contains("enemy")) {
                                break;
                            }
                        }
                        else {
                            toshow = document.getElementById(`${temp[0]},${temp[1]}`);
                            if (toshow.classList.contains("occupied")) {
                                break
                            }
                            for (let t = 0; t < k.length; t++) {
                                if (compareArr(`${temp[0]},${temp[1]}`, k[t]) == true) {
                                    toshow.classList.add("show")
                                    find++
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    else if (elem.classList.contains("pawn")) {
        let neeraj = false
        let temp = pos.slice();
        if ((temp[0] > 0 || temp[0] <= 7 || temp[1] >= 0 || temp[1] <= 7)) {
            temp[0]--;
            let toshow
            if (!globalcheck) {
                toshow = document.getElementById(`${temp[0]},${temp[1]}`);
                if (!toshow.classList.contains("occupied") && !toshow.classList.contains("enemy")) {
                    if (!elem.hasAttribute("cant-move")) {
                        toshow.classList.add("show");
                    }
                }
                else {
                    neeraj = true
                }
            }
            else {
                for (let t = 0; t < k.length; t++) {
                    if (compareArr(`${temp[0]},${temp[1]}`, k[t]) == true) {
                        console.log("Faf")
                        toshow = document.getElementById(`${temp[0]},${temp[1]}`);
                        toshow.classList.add("show")
                        find++
                    }
                }
            }
            const idl = temp[0] + "," + (temp[1] - 1)
            const idr = temp[0] + "," + (temp[1] + 1)
            let left = document.getElementById(idl)
            let right = document.getElementById(idr)
            if (left && left.classList.contains("enemy")) {
                if (!globalcheck) {
                    if (elem.hasAttribute("cant-move")) {
                        if (left.hasAttribute("set-check"))
                            left.classList.add("show")
                    }
                    else
                        left.classList.add("show")
                }
                else {
                    for (let t = 0; t < k.length; t++) {
                        if (compareArr(idl, k[t]) == true) {
                            left.classList.add("show")
                            find++
                        }
                    }
                }
            }
            if (right && right.classList.contains("enemy")) {
                if (!globalcheck) {
                    if (elem.hasAttribute("cant-move")) {
                        if (right.hasAttribute("set-check"))
                            right.classList.add("show")
                    }
                    else
                        right.classList.add("show")
                }
                else {
                    for (let t = 0; t < k.length; t++) {
                        if (compareArr(idr, k[t]) == true) {
                            right.classList.add("show")
                            find++
                        }
                    }
                }
            }
            if (!neeraj && temp[0] == 5) {
                temp[0]--;
                const toshow = document.getElementById(`${temp[0]},${temp[1]}`)
                if (!globalcheck) {
                    if (!toshow.classList.contains("occupied") && !toshow.classList.contains("enemy")) {
                        if (!elem.hasAttribute("cant-move"))
                            toshow.classList.add("show")
                    }
                    else {
                        for (let t = 0; t < k.length; t++) {
                            if (compareArr(`${temp[0]},${temp[1]}`, k[t]) == true) {
                                toshow = document.getElementById(`${temp[0]},${temp[1]}`);
                                toshow.classList.add("show")
                                find++
                            }
                        }
                    }
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
                        let toshow
                        if (!globalcheck) {
                            toshow = document.getElementById(`${temp[0]},${temp[1]}`);
                            if (toshow.classList.contains("occupied")) {
                                break;
                            }
                            if (!elem.hasAttribute("cant-move")) {
                                toshow.classList.add("show");
                            }
                            else if (elem.hasAttribute("cant-move")) {
                                if (toshow.hasAttribute("set-check")) {
                                    doit(temp[0], temp[1], i, j)
                                }
                            }
                            if (toshow.classList.contains("enemy")) {
                                break;
                            }
                        }
                        else {
                            toshow = document.getElementById(`${temp[0]},${temp[1]}`);
                            if (toshow.classList.contains("occupied")) {
                                break
                            }
                            for (let t = 0; t < k.length; t++) {
                                if (compareArr(`${temp[0]},${temp[1]}`, k[t]) == true) {
                                    toshow.classList.add("show")
                                    find++
                                }
                            }
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
                if (document.getElementById(`${temp[0]},${temp[1]}`).hasAttribute("position")) {
                    continue
                }
                let toshow = document.getElementById(`${temp[0]},${temp[1]}`)
                if (toshow.classList.contains("occupied")) {
                    continue;
                }
                toshow.classList.add("show")
                find++
            }
        }
        if (elem.classList.contains("notmoved")) {
            const rooks = document.querySelectorAll(".rook")
            Array.from(rooks).forEach((rook) => {
                if (rook.classList.contains("notmoved")) {
                    console.log(rook.id)
                    if (rook.id == "7,7") {
                        const first = document.getElementById("7,5")
                        const second = document.getElementById("7,6")
                        console.log(first)
                        console.log(second)
                        if (!first.classList.contains("occupied") && !second.classList.contains("occupied") && (first.getAttribute("position") != "threatning") && (second.getAttribute("position") != "threatning")) {
                            second.classList.add("show")
                        }
                    }
                    else if (rook.id == "7,0") {

                    }
                }
            })
        }
    }
    if (ok == 1) {
        return find
    }
    return 0
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

function start(socket) {
    int = setInterval(() => {
        timerinterval--;
        timer.textContent = format(timerinterval);
        if (timerinterval < 0) {
            globalturn = false
            clearInterval(int)
            gameOver(socket)
        }
    }, 1000)
}

function stop() {
    clearInterval(int)
}

function format(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    remainingSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    return minutes + ':' + remainingSeconds;
}

function check() {
    k = []
    let a = document.querySelectorAll("[position='threatning']");
    Array.from(a).forEach((elem) => {
        elem.removeAttribute("position")
    })
    a = document.querySelectorAll("[cant-move='true']");
    Array.from(a).forEach((elem) => {
        elem.removeAttribute("cant-move")
    })
    a = document.querySelectorAll("[set-check='true']");
    Array.from(a).forEach((elem) => {
        elem.removeAttribute("set-check")
    })
    const list = document.querySelectorAll(".enemy")
    Array.from(list).forEach((elem) => {
        const pos = (elem.id).split(",");
        pos[0] = parseInt(pos[0])
        pos[1] = parseInt(pos[1])
        if (elem.classList.contains("eknight")) {
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
                        toshow.setAttribute('position', 'threatning');
                        if (toshow.classList.contains("enemy")) {
                            break;
                        }
                        if (toshow.classList.contains("occupied")) {
                            if (toshow.classList.contains("king")) {
                                let p = temp[0] - a[i];
                                let q = temp[1] - a[j];
                                k.push(`${p},${q}`)
                            }
                            continue;
                        }
                    }
                }
            }
        }
        else if (elem.classList.contains("equeen")) {
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
                        toshow.setAttribute('position', 'threatning');
                        if (toshow.classList.contains("enemy")) {
                            break;
                        }
                        if (toshow.classList.contains("occupied")) {
                            console.log(lookforKing(temp[0], temp[1], i, j))
                            console.log(temp[0], temp[1], i, j)
                            if (lookforKing(temp[0], temp[1], i, j) == true) {
                                toshow.setAttribute('cant-move', 'true')
                                elem.setAttribute('set-check', 'true')
                            }
                            if (toshow.classList.contains("king")) {
                                let p = temp[0]
                                let q = temp[1]
                                while (!document.getElementById(`${p},${q}`).classList.contains("enemy")) {
                                    p = p - i
                                    q = q - j
                                    k.push(`${p},${q}`)
                                }
                            }
                            else
                                break;
                        }
                    }
                }
            }
        }
        else if (elem.classList.contains("ebishop")) {
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
                            toshow.setAttribute('position', 'threatning');
                            if (toshow.classList.contains("enemy")) {
                                if (lookforKing(temp[0], temp[1], i, j) == true) {
                                    toshow.setAttribute('cant-move', 'true')
                                }
                                break;
                            }
                            if (toshow.classList.contains("occupied")) {
                                if (toshow.classList.contains("king")) {
                                    let p = temp[0]
                                    let q = temp[1]
                                    while (document.getElementById(`${p},${q}`).classList.contains("occupied")) {
                                        k.push(`${p},${q}`)
                                        p = p - i
                                        q = q - j
                                    }
                                }
                                else
                                    break;
                            }
                        }
                    }
                }
            }
        }
        else if (elem.classList.contains("epawn")) {
            let temp = pos.slice();
            if ((temp[0] > 0 || temp[0] <= 7 || temp[1] >= 0 || temp[1] <= 7)) {
                temp[0]++;
                const idl = temp[0] + "," + (temp[1] - 1)
                const idr = temp[0] + "," + (temp[1] + 1)
                const left = document.getElementById(idl)
                const right = document.getElementById(idr)
                if (left && !left.classList.contains("occupied")) {
                    if (left.classList.contains("king")) {
                        k.push(idl)
                    }
                    left.setAttribute('position', 'threatning');
                }
                if (right && !right.classList.contains("occupied")) {
                    if (right.classList.contains("king")) {
                        k.push(idr)
                    }
                    right.setAttribute('position', 'threatning');
                }
            }
        }
        else if (elem.classList.contains("erook")) {
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
                            if (toshow.classList.contains("enemy")) {
                                if (lookforKing(temp[0], temp[1], i, j) == true) {
                                    toshow.setAttribute('cant-move', 'true')
                                }
                                break;
                            }
                            toshow.setAttribute('position', 'threatning');
                            if (toshow.classList.contains("occupied")) {
                                if (toshow.classList.contains("king")) {
                                    let p = temp[0]
                                    let q = temp[1]
                                    while (document.getElementById(`${p},${q}`).classList.contains("occupied")) {
                                        k.push(`${p},${q}`)
                                        p = p - i
                                        q = q - j
                                    }
                                }
                                else
                                    break;
                            }
                        }
                    }
                }
            }
        }
        else if (elem.classList.contains("eking")) {
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    let temp = pos.slice();
                    temp[0] = temp[0] + i;
                    temp[1] = temp[1] + j;
                    if ((temp[0] < 0 || temp[0] > 7 || temp[1] < 0 || temp[1] > 7)) {
                        continue;
                    }
                    const toshow = document.getElementById(`${temp[0]},${temp[1]}`)
                    if (toshow.classList.contains("enemy")) {
                        continue;
                    }
                    toshow.setAttribute('position', 'threatning');
                    if (toshow.classList.contains("occupied")) {
                        continue;
                    }
                }
            }
        }
    })
    return k;
}

function removeEnemy(elem) {
    if (elem.classList.contains("eking")) {
        elem.classList.remove("eking")
    }
    else if (elem.classList.contains("equeen")) {
        elem.classList.remove("equeen")
    }
    else if (elem.classList.contains("eknight")) {
        elem.classList.remove("eknight")
    }
    else if (elem.classList.contains("ebishop")) {
        elem.classList.remove("ebishop")
    }
    else if (elem.classList.contains("epawn")) {
        elem.classList.remove("epawn")
    }
    else if (elem.classList.contains("erook")) {
        elem.classList.remove("erook")
    }
}

function compareArr(arr1, arr2) {
    const len1 = arr1.length
    const len2 = arr2.length
    if (len1 != len2) {
        return false
    }
    else {
        for (let i = 0; i < len1; i++) {
            if (arr1[i] != arr2[i]) {
                return false
            }
        }
    }
    return true
}

function checkCheckmate() {
    const pieces = document.querySelectorAll('.occupied');
    let find = 0
    for (let i = 0; i < pieces.length; i++) {
        const piece = pieces[i];
        find += possibleMoves(piece, true, 1)
    }
    if (find == 0) {
        return true
    }
    return false
}

function lookforKing(a, b, i, j) {
    while (true) {
        a = a + i
        b = b + j
        if (a < 0 || a > 7 || b < 0 || b > 7) {
            return false
        }
        const toshow = document.getElementById(`${a},${b}`)
        if (toshow.classList.contains("king")) {
            return true
        }
        else if (toshow.classList.contains("enemy")) {
            return false
        }
    }
}

function doit(a, b, i, j) {
    while (true) {
        const toshow = document.getElementById(`${a},${b}`)
        if (toshow.hasAttribute("cant-move")) {
            break
        }
        toshow.classList.add("show")
        a = a - i
        b = b - j
        if (a < 0 || a > 7 || b < 0 || b > 7) {
            break
        }
    }
}

function gameOver(socket) {
    document.getElementById("gameoverheading").textContent = "YOU LOSE"
    document.getElementById("gameover").style.display = "block"
    socket.emit("gameover")
    document.getElementById("container").style.filter = "blur(5px)"

}
export default Game