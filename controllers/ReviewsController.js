const express = require('express')
const request = require('request-promise-native')

const Place = require('../models/place')
const Review = require('../models/review')

const router = express.Router()

// create review (don't forget to save place if it's the first review!)
router.post('/new', async (req, res, next) => {
	// query database for place matching
	try {
		let existingPlace
		existingPlace = await Review.findOne({googleId: req.body.place.id})
		if(!existingPlace) {
			// google 
			const placeInfo = await request(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${req.body.place.address}&inputtype=textquery&fields=name,place_id,rating&key=${process.env.API_KEY}`)

			const possiblePlaces = JSON.parse(placeInfo)
			const thePlace = possiblePlaces.candidates[0]

			// save to db using google info and info from front-end
			const placeObjToSave = {}
			placeObjToSave.name = req.body.place.name
			placeObjToSave.address = thePlace.name
			placeObjToSave.googleId = req.body.place.id

			const savedPlace = await Place.create(placeObjToSave)
			existingPlace = savedPlace
		} else {
			res.send(201).json(existingPlace)
		}

		// now that place is in db, create review
		const reviewObjToSave = {}
		reviewObjToSave.place = existingPlace._id
		reviewObjToSave.user = req.session.userId
		reviewObjToSave.description = req.body.description
		reviewObjToSave.program = req.body.program

		const newReview = await Review.create(reviewObjToSave)
		// make sure to add this review's id to the place and the user && the place id to the review && and the user id to the review
		res.status(201).json(newReview)
	} catch(err) {
		next(err)
	}
})
// get all reviews by place
router.get('/:placeId', async (req, res, next) => {
	try {
	    // find by placeId, not by googleId, because it will alrady be in db if it has reviews
	    const placeReviews = await Review.findMany({place: req.params.placeId})
	    res.status(200).json(placeReviews)
	} catch(err) {
		next(err)
	}
})

// get all reviews by user
router.get('/:userId', async (req, res, next) => {
	try {
		const userReviews = await Review.findMany({user: req.params.userId})
		res.status(200).json(userReviews)
	} catch(err) {
		next(err)
	}
})

// edit review
router.put('/:id', async (req, res, next) => {
	try {
		const foundReview = await Review.findByIdAndUpdate(req.params.id, req.body)
		res.status(201).json(foundReview)
	} catch(err) {
		next(err)
	}
})
// delete review
router.delete('/:id', async (req, res, next) => {
	try {
		const deletedReview = await Review.findByIdAndDelete(req.params.id);
		res.status(200).send("Resource was successfully deleted")
	} catch(err) {
		next(err)
	}
})
module.exports = router