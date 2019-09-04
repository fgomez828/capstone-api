const express = require('express')
const request = require('request-promise-native')

const Place = require('../models/place')

const router = express.Router()

// get info for places near zip code from google api
router.get('/', async (req, res, next) => {
	try {
		// first, geocode zip code
		const zipcode = req.session.user.zipcode
		const coordInfo = await request(`https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=${process.env.API_KEY}`)
		const parsedCoordInfo = JSON.parse(coordInfo)
		const lat = parsedCoordInfo.results[0].geometry.location.lat
		const long = parsedCoordInfo.results[0].geometry.location.lng

		// next, query for nearby gov't offices

		const data = await request(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${long}&radius=1500&type=local_government_office&key=${process.env.API_KEY}`)

		res.status(200).send(data)
		
	} catch(err) {
		next(err)
	}
})

module.exports = router