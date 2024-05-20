require('dotenv').config();
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { isLoggedIn } = require("../middleware/middleware");

const { SECRET = 'secret' } = process.env

const UserModel = require('../models/user')

//returns all users
router.get('/getAll', async (req, res) => {
	try {
		const data = await UserModel.find()
		res.json(data)
	}
	catch (error) {
		res.status(500).json({ message: error.message })
	}
})

router.delete('/deleteOne/:id', isLoggedIn, async (req, res) => {
	const { username } = req.user;
	req.body.username = username;
	const id = req.params.id;
	try {
		const user = await UserModel.find({ username: username })
		if (user) {
			console.log(user[0].roles)
			if (user[0].roles.includes("admin")) {
				try {
					const userToDelete = await UserModel.findByIdAndDelete(id)
					res.json(userToDelete)
				}
				catch (error) {
					res.status(400).json({ message: error.message })
				}
			}else{
				res.status(400).json({message: "not allowed"})
			}
		} else {
			res.status(400).json({ message: "no user found" })
		}
	}
	catch (error) {
		res.status(500).json({ message: error.message })
	}
})

//returns info about a user by username
router.get('/find/:username', async (req, res) => {
	username = req.params.username
	try {
		const user = await UserModel.findOne({ "username": username })
		res.json({
			username: user.username,
			_id: user._id,
			score: user.score,
			predictions: user.predictions,
			roles: user.roles,
			rank: user.rank
		})
	}
	catch (error) {
		res.status(400).json({ message: error.message })
	}
})

//updates a user by id
router.patch('/update/:id', async (req, res) => {
	id = req.params.id
	try{
		const userUpdateData = req.body;
		const result = await UserModel.findByIdAndUpdate(id, userUpdateData)	
		res.send(result)
	}
	catch (error) {
		res.status(400).json({ message: error.message })
	}
})

//increments a users score by 1
router.patch('/incrementScore/:id', async (req, res) => {
	id = req.params.id
	try{
		const result = await UserModel.findByIdAndUpdate(id, 
			{$inc:{ score: 1 }},{new: true}
		)
		res.send(result)
	}
	catch (error) {
		res.status(400).json({ message: error.message })
	}
})

//registers a new user
router.post('/register', async (req, res) => {
	try {
		req.body.password = await bcrypt.hash(req.body.password, 10);
		const user = await UserModel.create(req.body)
		const token = jwt.sign({ username: user.username }, SECRET)
		res.json({
			username: user.username,
			id: user._id,
			token
		})
	}
	catch (error) {
		res.status(400).json({ message: error.message })
	}
});

//user login
router.post('/login', async (req, res) => {
	try {
		const user = await UserModel.findOne({ username: req.body.username });
		if (user) {
			const result = await bcrypt.compare(req.body.password, user.password)

			if (result) {
				const token = jwt.sign({ username: user.username }, SECRET)
				res.json({
					username: user.username,
					id: user._id,
					token,
					roles: user.roles
				})

			} else {
				res.status(400).json({ message: "password does not match" })
			}

		} else {
			res.status(400).json({ message: "user does not exist" })
		}

	}
	catch (error) {
		res.status(400).json({ message: error.message })
	}
});

module.exports = router;
