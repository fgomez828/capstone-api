require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const session = require('express-session')
const PORT = 3000

const app = express()

// require database
require("./db/db")

// middleware
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, 
  optionsSuccessStatus: 200 
}
app.use(cors(corsOptions));

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}))

// controllers
const usersController = require('./controllers/UsersController')
app.use('/users', usersController)

const placesController = require('./controllers/PlacesController')
app.use('/places', placesController)

app.get('/', (req, res, next) => {
	res.send("woot connected to app.js");
})

// connection
app.listen(PORT, () => {
	console.log("listening on port ", PORT);
})