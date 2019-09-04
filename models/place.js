const mongoose = require('mongoose');

const Place = new mongoose.model('Place', mongoose.Schema({
	name: {
		type: String,
		required: true
	}
	address: {
		type: String,
		required: true
	}
	reviews: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Review"
	}]
}))

module.exports = Place