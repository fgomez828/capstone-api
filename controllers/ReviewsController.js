const express = require('express')
const request = require('request-promise-native')

const Place = require('../models/place')
const Review = require('../models/review')

const router = express.Router()

// create review (don't forget to save place if it's the first review!)
router.post('/new', async (req, res, next) => {
	// query database for place matching
	try {
		console.log(req.body, "request body");
		let existingPlace
		existingPlace = await Place.findOne({googleId: req.body.place.id})
		console.log("existingPlace after trying to find in DB based on req.body");
		if(!existingPlace) {
			console.log("it wasn't there");
			// google query
			const placeInfo = await request(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${req.body.place.address}&inputtype=textquery&fields=name,place_id,rating&key=${process.env.API_KEY}`)

			const possiblePlaces = JSON.parse(placeInfo)
			// assume it's the first one "I'm feeling lucky ;)"
			const thePlace = possiblePlaces.candidates[0] 

			// save to db using google info and info from front-end
			console.log(req.body.place, "req.body.place to see if it has name, id, and address")
			const placeObjToSave = {}
			placeObjToSave.name = req.body.place.name
			placeObjToSave.address = thePlace.name
			placeObjToSave.googleId = req.body.place.id

			const savedPlace = await Place.create(placeObjToSave)
			console.log("here's the place we just created since it doesn't exist");
			console.log(savedPlace);
			existingPlace = savedPlace
			console.log("stored it in existingPlace, here's existingPlace");
			console.log(existingPlace);
		}

		// now that place is in db, create review
		const reviewObjToSave = {}
		reviewObjToSave.place = existingPlace._id
		reviewObjToSave.user = req.session.userId
		reviewObjToSave.description = req.body.description
		reviewObjToSave.program = req.body.program

		const newReview = await Review.create(reviewObjToSave)
		existingPlace.reviews.push(newReview)
		await existingPlace.save()
		// make sure to add this review's id to the place and the user && the place id to the review && and the user id to the review
		res.status(201).json(newReview)

	} catch(err) {
		next(err)
	}
})
// get all reviews by place
router.get('/:googleId', async (req, res, next) => {
	try {
	    // find by googleId
	    console.log(req.params, "req.params when getting reviews by place");
	    const place = await Place.findOne({googleId: req.params.googleId})
	    console.log(place, " the place we want reviews for");
	    const placeReviews = await Review.find({place: place._id})
	    console.log(placeReviews, "reviews to be sent to react app");
	    res.status(200).json(placeReviews)
	} catch(err) {
		console.log("this is an error when getting reviews by place");
		console.log(err);
		next(err)
	}
})

// get all reviews by user
router.get('/:userId', async (req, res, next) => {
	try {
		const userReviews = await Review.find({user: req.params.userId})
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