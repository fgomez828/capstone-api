const express = require("express")
const methodOverride = require("method-override")
const session = require("express-session")
const PORT = 3000

const app = express()

// require database
require("./db/db")

// middleware
app.use(methodOverride("_method"))
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}))
// controllers

// connection
app.listen(PORT, () => {
	console.log("listening on port ", PORT);
})
