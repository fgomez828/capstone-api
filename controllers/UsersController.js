const express = require('express')
const bcrypt = require('bcryptjs')
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
			// res.status(200).json(req.body)

			// create user
			const newUser = await User.create(req.body)
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
// router.post('/', (req, res, next) => {
	
// })

// logout

// update account

// delete account

module.exports = router