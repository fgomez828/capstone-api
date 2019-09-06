const express = require('express')
const Review = require('../models/review')
const request = require('request-promise-native')

const router = express.Router()

// create review (don't forget to save place if it's the first review!)
router.post('/new', async (req, res, next) => {
	// query database for place matching
	try {
		const existingPlace = await Review.findOne({googleId: req.body.place})
		if(!existingPlace) {
			const placeInfo = await request(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${req.params.place}&fields=name,formatted_address,place_id,rating,vicinity&key=${process.env.API_KEY}`)

			console.log(placeInfo, "<--- place info if not found in db");
			// if it shows up the way I need, save it to db
		}
		// create review
		const newReview = await Review.create(req.body)
		// make sure to add this review's id to the place and the user && the place id to the review && and the user id to the review
		console.log(newReview);
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