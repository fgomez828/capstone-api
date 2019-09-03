const mongoose = require('mongoose');

const User = new mongoose.model('User', mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	password: {
		type: String, 
		required: true
	},
	zipcode: {
		type: Number,
		required: true
	},
	reviews: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Review"
	}]
}))