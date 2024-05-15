const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
	author: {
		type: String,
		unique: false,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	postBody: {
		type: String,
		required: true
	},
	parentId: {
		type: String,
		required: true
	},
	replies: {
		type: Array,
		default: [],
		required: true
	},
	votes: {
		type: Array,
		default: [],
		required: true
	},
})

module.exports = mongoose.model("Comment", CommentSchema)
