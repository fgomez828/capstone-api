const express = require('express')
const Review = require('../models/review')

const router = express.Router()

// create review (don't forget to save place if it's the first review!)
router.post('/new', async (req, res, next) => {
	// query database for place matching
	const existingPlace = await Review.findOne({googleId: req.body.place})
	if(!existingPlace) {
		const placeInfo = await request(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${req.params.place}&fields=name,formatted_address,place_id,rating,vicinity&key=${process.env.API_KEY}`)

		console.log(placeInfo, "<--- place info if not found in db");
		// if it shows up the way I need, save it to send as json to front end
	}
	// create review
	const newReview = await Review.create(req.body)
	// make sure to add this review's id to the place and the user && the place id to the review && and the user id to the review
	console.log(newReview);
	res.status(201).json(newReview)
})
// get all reviews by place
router.get('/:placeId', async (req, res, next) => {
    // find by placeId, not by googleId, because it will alrady be in db if it has reviews
    const placeReviews = await Review.findMany({place: req.params.placeId})
    res.status(200).json(placeReviews)
})

// get all reviews by user
router.get('/:userId', async (req, res, next) => {
	const userReviews = await Review.findMany({user: req.params:userId})
	res.status(200).json(userReviews)
})

// edit review

// delete review

module.exports = router