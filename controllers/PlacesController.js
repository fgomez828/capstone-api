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

		await newUser.save()

		console.log(newUser, "new user with lat and long info");

		// next, query for nearby gov't offices
		const data = await request(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${long}&radius=1500&type=bus_station,cemetery,city_hall,courthouse,embassy,fire_station,hospital,library,local_government_office,museum,park,parking,police,post_office,school,train_station,transit_station&key=${process.env.API_KEY}`)

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
router.post('/', async (req, res, next) => {
	// geocode zip code again
	const zipcode = req.session.user.zipcode
	const coordInfo = await request(`https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=${process.env.API_KEY}`)
	const parsedCoordInfo = JSON.parse(coordInfo)
	const lat = parsedCoordInfo.results[0].geometry.location.lat
	const long = parsedCoordInfo.results[0].geometry.location.lng

	// now do a nearby search for places that match query
	const query = req.body.query
	const searchResults = await request(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${long}&radius=5000&type=bus_station,cemetery,city_hall,courthouse,embassy,fire_station,hospital,library,local_government_office,museum,park,parking,police,post_office,school,train_station,transit_station&keyword=${query}&key=${process.env.API_KEY}`)

	const parsedSearchResults = JSON.parse(searchResults)
	const searchResultsArray = parsedSearchResults.results
	const condensedSearchResults = searchResultsArray.map(result => {
		const condensedResult = {}
		condensedResult.id = result.place_id
		condensedResult.name = result.name
		condensedResult.address = result.vicinity
		condensedResult.rating = result.rating
		return condensedResult
	})
	console.log(condensedSearchResults);
	res.status(200).send(condensedSearchResults)
})

module.exports = router



