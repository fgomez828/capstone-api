const express = require('express')
const bcrypt = require('bcryptjs')
const request = require('request-promise-native')

const User = require('../models/user')

const router = express.Router()

// register
router.post('/register', async (req, res, next) => {
	try {
		// check for duplicate user
		const duplicateUser = await User.findOne({phone: req.body.phone})
		if(!duplicateUser) {
			// take req.body and hash password
			const hashedPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
			req.body.password = hashedPassword

			// create user
			const newUser = await User.create(req.body)

			// add latitude and longitude info to user using google api
			const zipcode = newUser.zipcode
			const coordInfo = await request(`https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=${process.env.API_KEY}`)
			const parsedCoordInfo = JSON.parse(coordInfo)
			newUser.lat = parsedCoordInfo.results[0].geometry.location.lat
			newUser.long = parsedCoordInfo.results[0].geometry.location.lng

			await newUser.save()
			// set session
			req.session.user = newUser
			req.session.userId = newUser._id
			req.session.username = newUser.username
			req.session.loggedIn = true

			res.status(201).json(newUser)

		} else {
			res.status(400).json({data: {}, message: "A User with that phone number already exists"})
		}
	} catch(err) {
		next(err)
	}
})

// login
router.post('/login', async (req, res, next) => {
	try {
		// check for duplicate user
		const existingUser = await User.findOne({phone: req.body.phone})		
		// if hashed passwords match, set session
		if(bcrypt.compareSync(req.body.password, existingUser.password)) {			
			// set session
			req.session.user = existingUser
			req.session.userId = existingUser._id
			req.session.username = existingUser.username
			req.session.loggedIn = true

			res.status(201).json(existingUser)
		} else {
			// send message that phone number or password was incorrect
			res.status(401).json({data: {}, message: "Phone number or password was incorrect"})
		}

	} catch(err) {
		next(err)
	}
})

// logout
router.get('/logout', (req, res, next) => {
	req.session.destroy((err) => {
		if(err) next(err)
		else res.status(200).json({data: {}, message: "Log out successful"})
	})
})

// update account
router.put('/:id', async (req, res, next) => {
	// get new user object; find matching user by id and update
	const updatedUser = await User.findByIdAndUpdate(req.body.id, req.body)
	// return updated user object
	res.status(200).json(updatedUser)
})

// delete account
router.delete('/:id', async (req, res, next) => {
	const deletedUser = await User.findByIdAndDelete(req.session.userId)
	res.status(200).json({data: {}, message: "User account deleted"})
})

module.exports = router
