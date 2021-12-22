require('dotenv').config()
const express = require('express')
const { json } = require('express/lib/response')
const db = require('./db')
const parser = require('body-parser')
const cors = require('cors')

const app = express()
const port  = process.env.PORT || "5001"

app.use(express.json())
app.use(cors())
app.use(parser.json())

function authenticateRegistration(userName, password, email){
    let regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let validEmail = regexEmail.test(String(email).toLowerCase())
    let validUserName = userName.length >= 5;
    let validPassword = password.length >= 7;

    if(validEmail === validUserName === validPassword){
        return true
    }else{
        return false
    }
}

app.post("/newuser", async (req, res) => {
    try{
        let {username, password, email} = {username : req.body.username, password : req.body.password, email : req.body.email }
        let insert = await db.query(`INSERT INTO USERS(username, email, password) values ('${username}', '${email}', '${password}')`)
        let result = await db.query(`SELECT * FROM USERS WHERE email = '${email}' AND password = '${password}' AND email = '${email}'`)
        res.status(200).json({
            status: "success",
            user: result.rows[0]
        })
    }
    catch(e){
            res.status(400).json("unable to register user: registration requirements likely not met or user is already registered")
    }
    
});

app.get("/signin", async (req, res) => {
    let {email, password} = {email: req.body.email, password : req.body.password}
    let result = await db.query(`SELECT * FROM USERS WHERE email = '${email}' AND password = '${password}'`)
    res.status(200).json({
        status : "success",
        user: result.rows[0],
    })
})





app.listen(port, console.log(`app is running on port ${port}`))