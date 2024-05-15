const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
	title: {
		type: String,
		unique: false,
		required: true
	},
	category: {
		type: String,
		required: false,
		default: "other"
	},
	description: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	},
	created_on: {
		type: Date,
		required: true,
		default: Date.now
	},
	finished_on: {
		type: Date,
		required: true,
		default: Date.now
	},
	votes: {
		type: Array,
		required: true,
		default: []
	},
	comments: {
		type: Array,
		required: false
	},
	// completed: {
	// 	type: Boolean,
	// 	default: function() {return this.finished_on < Date.now()},
	// },
	authorPredictionConfirmed: {
		type: Boolean,
		default: null,
	}
})

module.exports = mongoose.model("Prediction", PredictionSchema)
