
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
            event.target.style.backgroundColor = "black"
        }
    })
}

function populate(){
    const list = document.querySelectorAll('.occupied')
    Array.from(list).forEach((e)=>{
        e.textContent = "asdf"
    })
}
export default Game