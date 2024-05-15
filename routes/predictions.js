const express = require('express');
const router = express.Router()
const PredictionModel = require('../models/prediction');
const { isLoggedIn } = require("../middleware/middleware");

const pageHandler = (pageNumber) => {
	const limit = 10;
	let skip;
}

//get all blogposts
router.get('/getAll', async (req, res) => {
	let page = req.query.page;
	const limit = 10;
	let skip
	skip = (page - 1) * limit;

	try {
		const total = await PredictionModel.countDocuments({});
		const data = await PredictionModel.find().skip(skip).limit(limit).sort({ finished_on: -1 })
		res.json({ data, total })
	}
	catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//gets all predictions made by a specific user
router.get('/getByUser/:username', async (req, res) => {
	const username = req.params.username

	let page = req.query.page;
	const limit = 10;
	let skip;
	skip = (page - 1) * limit;

	try {
		const total = await PredictionModel.countDocuments({"author": username})
		const data = await PredictionModel.find({ "author": username }).skip(skip).limit(limit).sort({ finished_on: -1 })
		res.json({ data, total })
	}
	catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//gets all predictions made by a specific user that have not yet been confirmed.
router.get('/getConfirmedByUser/:username', async (req, res) => {
	const username = req.params.username

	let page = req.query.page;
	const limit = 10;
	let skip;
	skip = (page - 1) * limit;

	try {
		const total = await PredictionModel.countDocuments({ "author": username, "authorPredictionConfirmed": null })
		const data = await PredictionModel.find({ "author": username, "authorPredictionConfirmed": null }).skip(skip).limit(limit)
		res.json({ data, total })
	}
	catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//gets all predictions a user has voted on..
router.get('/getVotedByUser/:username', async (req, res) => {
	const username = req.params.username

	let page = req.query.page;
	const limit = 10;
	let skip;
	skip = (page - 1) * limit;

	try {
		const total = await PredictionModel.countDocuments({ "votes": { $elemMatch: { "username": username } } })
		const data = await PredictionModel.find({ "votes": { $elemMatch: { "username": username } } }).skip(skip).limit(limit)
		res.json({ data, total })
	}
	catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//gets all predictions by category name
router.get('/getByCategory/:category', async (req, res) => {
	const category = req.params.category

	let page = req.query.page;
	const limit = 10;
	let skip;
	skip = (page - 1) * limit;

	try {
		const total = await PredictionModel.countDocuments({ "category": category })
		const data = await PredictionModel.find({ "category": category }).skip(skip).limit(limit)
		res.json({ data, total })
	}
	catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//deletes ALL predictions!!!!//
router.delete('/deleteAll', async (req, res) => {
	try {
		const data = await PredictionModel.deleteMany({})
		res.json(data)
	}
	catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//post a new prediction
router.post('/post', isLoggedIn, async (req, res) => {
	const { username } = req.user;
	req.body.username = username;
	const data = new PredictionModel({
		title: req.body.title,
		category: req.body.category,
		description: req.body.description,
		author: req.body.author,
		finished_on: req.body.finished_on,
		votes: req.body.votes,
		comments: req.body.comments
	})
	try {
		const dataToSave = await data.save();
		res.status(200).json(dataToSave)
	}
	catch (error) {
		res.status(400).json({ message: error.message })
	}
})

//get one prediction by id
router.get('/getOne/:id', async (req, res) => {
	const id = req.params.id;
	try {
		const data = await PredictionModel.findById(id);
		res.json(data)
	}
	catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//get the vote information for a single prediction by id
router.post('/getOne/:id/votes', async (req, res) => {
	const id = req.params.id;
	const username = req.body.username;
	try {
		const data = await PredictionModel.findById(id);
		const votes = data.votes
		let up = 0;
		let down = 0;
		let userVote = votes.find(item => item.username === username)
		for (let i of votes) {
			if (i.vote === false) {
				down += 1
			}
			if (i.vote === true) {
				up += 1
			}
		}
		const send = {
			upvotes: up,
			downvotes: down,
			total_votes: up + down,
			ratio: (up / (up + down) * 100),
			uservote: userVote
		}
		res.json(send)
	}
	catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//update blog post by id
router.patch('/update/:id', isLoggedIn, async (req, res) => {
	const { username } = req.user;
	req.body.username = username;
	try {
		const id = req.params.id;
		const postBodyUpdate = req.body;
		const options = { new: true };

		const result = await PredictionModel.findByIdAndUpdate(
			id, postBodyUpdate, options
		)
		res.send(result)
	}
	catch (error) {
		res.status(400).json({ message: error.message })
	}
})

router.patch('/addComment/:id', isLoggedIn, async (req, res) => {
	const { username } = req.user;
	req.body.username = username;
	try {
		const id = req.params.id;
		const commentId = req.body.commentId;
		const result = await PredictionModel.updateOne({_id: id}, {$push: {comments: commentId}})
		res.send(result)
	}
	catch (error) {
		res.status(400).json({ message: error.message })
	}
})

router.delete('/delete/:id', isLoggedIn, async (req, res) => {
	const { username } = req.user;
	req.body.username = username;
	try {
		const id = req.params.id;
		const data = await PredictionModel.findByIdAndDelete(id)
		res.send(`Document ${data.name} deleted`)
	}
	catch (error) {
		res.status(400).json({ message: error.message })
	}
})

module.exports = router;
