const express = require('express');
const router = express.Router();
const database = require('../database');

router.get('/', (req, res) => res.send('Server API working'));

router.post('/registrationUser', async (req, res) => {
	const {userId, firstName} = req.body;
	const {rows} = await database.query(
		'INSERT INTO users (user_id, first_name) VALUES ($1, $2) RETURNING id',
		[userId, firstName]
	);

	res.json({id: rows[0].id});
});

router.post('/checkUser', async (req, res) => {
	const {userId} = req.body;
	const {rows} = await database.query('SELECT id FROM users WHERE user_id = $1', [userId]);

	if (rows.length < 1) {
		res.json({status: false});
	} else {
		res.json({status: true});
	}
});

router.post('/getIndex', async (req, res) => {
	const {userId} = req.body;
	const {rows} = await database.query('SELECT index, is_done FROM survey WHERE user_id = $1', [userId]);

	if (rows.length < 1) {
		res.json({
			index: 1,
			is_done: false
		});
	} else {
		res.json({
			index: rows[0].index,
			is_done: rows[0].is_done
		});
	}
});

router.post('/addIndex', async (req, res) => {
	const {userId} = req.body;
	const {rows} = await database.query('INSERT INTO survey (user_id) VALUES ($1) RETURNING id', [userId]);

	res.json({id: rows[0].id});
});

router.post('/updateIndex', async (req, res) => {
	const {userId, index} = req.body;
	const {rows} = await database.query('UPDATE survey SET index = $1 WHERE user_id = $2 RETURNING index', [index, userId]);

	res.json({status: rows[0].index});
});

router.post('/doneSurvey', async (req, res) => {
	const {userId} = req.body;
	const {rows} = await database.query('UPDATE survey SET is_done = $1 WHERE user_id = $2 RETURNING id', [true, userId]);

	res.json({status: rows[0].id});
});

router.post('/addAnswer', async (req, res) => {
	const {userId, index, message} = req.body;
	const {rows} = await database.query(
		'INSERT INTO answers (user_id, question_id, message) VALUES ($1, $2, $3) RETURNING id',
		[userId, index, message]
	);

	res.json({index: rows[0].id});
});

router.post('/getQuestion', async (req, res) => {
	const {index} = req.body;
	const {rows} = await database.query('SELECT title FROM questions WHERE id = $1', [index]);

	if (rows.length < 1) {
		res.json({title: 0});
	} else {
		res.json({title: rows[0].title});
	}
});

router.post('/getAnswer', async (req, res) => {
	const {userId} = req.body;
	const user = await database.query('SELECT user_id, first_name FROM users WHERE is_admin = $1', [true]);
	const answer = await database.query(
		`SELECT title, message
		FROM answers
		INNER JOIN questions ON (answers.question_id = questions.id AND answers.user_id = $1)`,
		[userId]
	);

	if (user.rows.length < 1) {
		res.json({answer: 0});
	} else {
		res.json({
			users: user.rows,
			answers: answer.rows
		})
	}
});

module.exports = router;