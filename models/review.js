const mongoose = require('mongoose');

const Review = new mongoose.model('Review', mongoose.Schema({
	date: {
		type: Date,
		default: Date.now
	},
	place: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Place",
		required: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	description: {
		type: String,
		required: true
	},
	program: []
}))

module.exports = Review