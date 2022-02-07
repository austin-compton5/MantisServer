require('dotenv').config()
const express = require('express')
const { json } = require('express/lib/response')
const db = require('./db')
const parser = require('body-parser')
const cors = require('cors')
const { resourceLimits } = require('worker_threads')

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
        let result = await db.query(`SELECT * FROM USERS WHERE email = '${email}' AND password = '${password}' AND username = '${username}'`)
        let projectTable = await db.query(`CREATE TABLE ${username}(ID SERIAL PRIMARY KEY, PROJECTNAME TEXT NOT NULL UNIQUE, PLATFORM TEXT NOT NULL, DISCORD TEXT UNIQUE, WEBSITE TEXT UNIQUE, TWITTER TEXT UNIQUE);`)
        console.log(result)
        res.status(200).json({
            status: "success",
            user: result.rows[0]
        })
    }
    catch(e){
        res.status(400).json("unable to register user: field requirements likely not met or user is already registered")
    }
    
});

app.post("/signin", async (req, res) => {
    try{
        let {email, password} = {email: req.body.email, password : req.body.password}
        let result = await db.query(`SELECT * FROM USERS WHERE email = '${email}' AND password = '${password}'`)
        res.status(200).json({
            status : "success",
            user: result.rows[0]
        })
    }
    catch(e){
        res.status(400).json("user is not registered")
    }   
})


app.post("/bookmark", async (req, res)=> {
    try{
    console.log(req.body.username.trim(), req.body.projectname.trim(), req.body.platform.trim(), req.body.discord.trim(), req.body.website.trim(), req.body.twitter.trim())
    let {username, projectname, platform, discord, website, twitter} = {
        username : req.body.username.trim(),
        projectname : req.body.projectname.trim(),
        platform:req.body.platform.trim(),
        discord : req.body.discord.trim(),
        website : req.body.website.trim(),
        twitter: req.body.twitter.trim()
     }
     let newproject = await db.query(`INSERT INTO ${username}(projectname, platform, discord, website, twitter) values ('${projectname}', '${platform}', '${discord}', '${website}', '${twitter}')`)
     console.log(newproject)
     res.status(200).json({
         status : "success"
     })
    }catch(e){
        console.log(e)
    }
})

app.post("/deletebookmark", async (req, res) => {
    try {
        let {username, projectname} = {
            username : req.body.username,
            projectname : req.body.projectname
        }
        let deletedProject = await db.query(`DELETE FROM ${username} WHERE projectname = '${projectname}'`)
        console.log(deletedProject)
        res.status(200).json({
            status: "success"
        })
    }catch(e){
        console.log(e)
    }
})

app.post("/getbookmarked", async (req, res) => {
    try {
        let userTable = req.body.username
        let favoritedProjects = await db.query(`SELECT * FROM ${userTable}`)
        console.log(favoritedProjects.rows)
        res.status(200).json({
            status: "success",
            favoritedProjects: favoritedProjects.rows
        })
    }catch(e){
        console.log(e)
    }
})

app.listen(port, console.log(`app is running on port ${port}`))