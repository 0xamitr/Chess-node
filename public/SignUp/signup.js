const form = document.getElementById("form")

form.addEventListener("submit", (e)=>{
    e.preventDefault()
    console.log("ok")
    post(e)
})

const post = async(e)=>{
    const formdata =  {
        username: e.target.username.value,
        password: e.target.password.value
    }
    console.log()
    await fetch("/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formdata),
    })
}