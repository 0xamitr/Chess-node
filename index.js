import express from 'express'
const app = express();
const PORT = 5000;
app.get('/', (req, res, next)=>{
    res.send("hello world")
})

app.listen(PORT, ()=>{
    console.log("running")
})