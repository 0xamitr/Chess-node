
let move = false;
let selected;
function Game(){
    document.getElementById('one').style.display = "none"
    const two = document.getElementById('two')
    for(let i = 0; i < 8; i++){
        const row = document.createElement('div')
        for(let j = 0; j < 8; j++){
            const boxes = document.createElement('div')
            boxes.className = "box"
            if(i == 0 || i == 1 || i == 6 || i == 7){
                boxes.classList.add("occupied")
            }
            if(i == 7 && j==7){
                boxes.classList.add("rook")

            }
            boxes.id = `${i},${j}`
            row.append(boxes)
        }
        row.className = "row"
        two.append(row)
    }
    populate()
    eventlistener()
}

function eventlistener(){
    const list = document.querySelectorAll('.box')
    Array.from(list).forEach((elem)=> {
        listener(elem)
    })
}

function listener(elem){
    elem.addEventListener("click", (event)=>{
        if(elem.classList.contains("occupied")){
            move = true
            selected = event.target
            possibleMoves(elem)
        }
        if(move && !elem.classList.contains("occupied")){
            removeShow()
            move = false;
            selected.textContent = "";
            selected.classList.remove("occupied")
            event.target.classList.add(selected.classList[1])
            selected.classList.remove(selected.classList[1])
            event.target.classList.add("occupied")
            event.target.textContent = "asdf"
            console.log(selected.classList)
        }
    })
}

function populate(){
    const list = document.querySelectorAll('.occupied')
    Array.from(list).forEach((e)=>{
        e.textContent = "asdf"
    })
}

function possibleMoves(elem){
    const pos = (elem.id).split(",");
    pos[0] = parseInt(pos[0])
    pos[1] = parseInt(pos[1])
    if(elem.classList.contains("knight")){
        let temp
        const a = [-2, -1, 1, 2]
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < a.length; j++) {
                if (Math.abs(a[i]) + Math.abs(a[j]) === 3) {
                    temp = pos.slice();
                    console.log(temp);
                    console.log("Fsdaf")
                    temp[0] = temp[0] + a[i];
                    temp[1] = temp[1] + a[j];
                    if (temp[0] < 0 || temp[0] > 7 || temp[1] < 0 || temp[1] > 7) {
                        console.log("Fsdf")
                        continue;
                    }
                    const toshow = document.getElementById(`${temp[0]},${temp[1]}`);
                    toshow.classList.add("show");
                    if (toshow.classList.contains("occupied")) {
                        continue;
                    }
                }
            }
        }
    }
    else if(elem.classList.contains("queen")){
        for(let i = -1; i < 2; i++){
            for(let j = -1; j < 2; j++){
                if(i == 0 && j == 0){
                    continue;
                }
                let temp = pos.slice();
                console.log(temp)
                while(true){
                    temp[0] = temp[0] + i;
                    temp[1] = temp[1] + j;
                    if((temp[0] < 0 || temp[0] > 7 || temp[1] < 0 || temp[1] > 7)){
                        break;
                    }
                    const toshow = document.getElementById(`${temp[0]},${temp[1]}`)
                    toshow.classList.add("show")
                    if(toshow.classList.contains("occupied")){
                        break;
                    }
                }
            }
        }
    }
    else if(elem.classList.contains("bishop")){
        for(let i = -1; i < 2; i++){
            for(let j = -1; j < 2; j++){
                if(Math.abs(i) == Math.abs(j) && i != 0){
                    let temp = pos.slice();
                    console.log(temp)
                    while(true){
                        temp[0] = temp[0] + i;
                        temp[1] = temp[1] + j;
                        if((temp[0] < 0 || temp[0] > 7 || temp[1] < 0 || temp[1] > 7)){
                            break;
                        }
                        const toshow = document.getElementById(`${temp[0]},${temp[1]}`)
                        toshow.classList.add("show")
                        if(toshow.classList.contains("occupied")){
                            break;
                        }
                    }
                }
            }
        }
    }
    else if(elem.classList.contains("pawn")){

    }
    else if(elem.classList.contains("rook")){
        for(let i = -1; i < 2; i++){
            for(let j = -1; j < 2; j++){
                if(Math.abs(i - j) == 1){
                    let temp = pos.slice();
                    console.log(temp)
                    while(true){
                        temp[0] = temp[0] + i;
                        temp[1] = temp[1] + j;
                        if((temp[0] < 0 || temp[0] > 7 || temp[1] < 0 || temp[1] > 7)){
                            break;
                        }
                        const toshow = document.getElementById(`${temp[0]},${temp[1]}`)
                        toshow.classList.add("show")
                        if(toshow.classList.contains("occupied")){
                            break;
                        }
                    }
                }
            }
        }
    }
    else if(elem.classList.contains("king")){

    }
}

function removeShow(){
    const list = document.querySelectorAll('.show')
    Array.from(list).forEach((e)=>{
        e.classList.remove('show')
    })
}
export default Game