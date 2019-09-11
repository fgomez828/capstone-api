const express = require('express')
const request = require('request-promise-native')

const Place = require('../models/place')
const Review = require('../models/review')
const User = require('../models/user')

const router = express.Router()

// create review (don't forget to save place if it's the first review!)
router.post('/new', async (req, res, next) => {
	// query database for place matching
	try {
		console.log("request body in review create");
		console.log(req.body);
		let existingPlace
		existingPlace = await Place.findOne({googleId: req.body.place.googleId})
		console.log( "existingPlace after trying to find in DB based on req.body:");
		console.log(existingPlace);
		if(!existingPlace) {
			// google query if place does not exist
			const placeInfo = await request(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${req.body.place.address}&inputtype=textquery&fields=name,place_id,rating&key=${process.env.API_KEY}`)
			const possiblePlaces = JSON.parse(placeInfo)

			// assume it's the first one
			const thePlace = possiblePlaces.candidates[0] 

			// save to db using google info and info from front-end
			const placeObjToSave = {}
			placeObjToSave.name = req.body.place.name
			placeObjToSave.address = thePlace.name
			placeObjToSave.googleId = req.body.place.googleId

			// we must create it if it wasn't already there
			const savedPlace = await Place.create(placeObjToSave)

			existingPlace = savedPlace
		}
		// find the user whose review this is
		const reviewingUser = await User.findById(req.session.userId)

		// now that place is in db, create review
		const reviewObjToSave = {}
		reviewObjToSave.place = existingPlace._id
		reviewObjToSave.user = reviewingUser
		reviewObjToSave.description = req.body.description
		reviewObjToSave.program = req.body.program

		// make sure to add this review's id to the place
		const newReview = await Review.create(reviewObjToSave)
		existingPlace.reviews.push(newReview)
		await existingPlace.save()

		// and to the user who wrote it
		const reviewUser = await User.findById(newReview.user)
		reviewingUser.reviews.push(newReview)
		await reviewUser.save()

		// sending created review object causes callstack size error; sending message instead
		res.status(201).json({
			message: 'successfully added review'
		})

	} catch(err) {
		next(err)
	}
})
// get all reviews by place
router.get('/:googleId', async (req, res, next) => {
	try {
	    // find by googleId
	    const place = await Place.findOne({googleId: req.params.googleId})
	    if(place) {
		    const placeReviews = await Review.find({place: place._id})
		    console.log(placeReviews, "reviews to be sent to react app");
		    res.status(200).json(placeReviews)
	    } else {
	    	res.status(200).json("No place found in database")
	    }
	} catch(err) {
		next(err)
	}
})

// get all reviews by user
router.get('/user/:userId', async (req, res, next) => {
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
		console.log("below is req.body for updating a review");
		console.log(req.body)
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