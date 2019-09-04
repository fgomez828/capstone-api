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

		const parsedData = JSON.parse(data)

		const condensedResults = parsedData.results.map(result => {
			const condensedResult = {}
			condensedResult.id = result.place_id
			condensedResult.name = result.name
			condensedResult.address = result.vicinity
			condensedResult.rating = result.rating
			return condensedResult
		})

		res.status(200).send(condensedResults)
		
	} catch(err) {
		next(err)
	}
})

// get info for one place that is clicked on
router.get('/:id', async (req, res, next) => {
	try {
		// const id = "ChIJR3p8jfEZBYgRozK3wGYpbQM"
		// first check if it's in database
		const foundPlace = await Place.findOne({googleId: req.params.id})
		if(foundPlace) {
			foundPlace.populate('reviews').exec((err, place, next) => {
				if(err) next(err);
				res.status(200).json(place)
			})
		} else {
			// if not, do google api call
			const placeInfo = await request(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${req.params.id}&fields=name,formatted_address,place_id,rating,vicinity&key=${process.env.API_KEY}`)
			res.status(200).send(placeInfo)
		}
	} catch(err) {
		next(err)
	}
})

// get info for a search query

module.exports = router



