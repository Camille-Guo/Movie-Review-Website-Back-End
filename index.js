const validator = require('validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('./userModels');

//rucheng local database
mongoose.connect(
	'mongodb+srv://rrc:' +
		process.env.MONGODB_PWD +
		'@cluster0.rqltzmh.mongodb.net/monvie?retryWrites=true&w=majority',
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
	console.log('Connected successfully');
});
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); //cross-orign resource sharing
const { default: isEmail } = require('validator/lib/isEmail');
const app = express();
const port = 3001; // Must be different than the port of the React app
app.use(cors()); // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(express.json()); // Allows express to read a req body
// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//register handle
app.post('/identity/register', async (req, res) => {
	const { username, email, password, confirmPassword } = req.body;

	let status = 'failed',
		message = '';

	if (!username) {
		message = 'Please enter username';
		res.send({ status, message });
		return;
	}

	if (validator.isAlphanumeric(username)) {
		message = 'format of username is not correct';
		res.send({ status, message });
		return;
	}

	if (!email) {
		message = 'Please enter your email';
		res.send({ status, message });
		return;
	}

	if (!isEmail(email)) {
		message = 'Please enter with valid email';
		res.send({ status, message });
		return;
	}

	if (!password) {
		message = 'Please enter password';
		res.send({ status, message });
		return;
	}

	if (!confirmPassword) {
		message = 'Please confirm your password';
		res.send({ status, message });
		return;
	}

	if (!validator.isStrongPassword(password)) {
		message = 'Your password is too weak';
		res.send({ status, message });
		return;
	}

	if (password !== confirmPassword) {
		message = 'Password is not the same';
		res.send({ status, message });
		return;
	}

	const userRes = await userModel.findOne({ email });

	if (!userRes) {
		message = 'Email is exist';
		res.send({ status, message });
		return;
	}

	const hashedPassword = await bcrypt.hash(password, saltRounds);

	const userToSave = {
		username,
		email,
		password: hashedPassword,
		avatar: null,
	};

	let newUserModel = null;

	try {
		newUserModel = await userModel.create(userToSave);

		if (!newUserModel) {
			message = 'database error, create user failed';
			res.send({ status, message });
			return;
		}
	} catch (e) {
		message = e.message;
	}

	status = 'succeeded';
	data = newUserModel;

	res.send({ status, data });
});

//login handle
app.post('/identity/login', async (req, res) => {
	const { email, password } = req.body;
	let status = 'failed',
		message = '';
	if (!email) {
		message = 'Please enter your email';
		res.send({ status, message });
		return;
	}

	if (!password) {
		message = 'Please set your password';
		res.send({ status, message });
		return;
	}

	const userRes = await userModel.findOne({ email });

	if (!userRes) {
		message = 'Email does not exist. Please try again';
		res.send({ status, message });
		return;
	}

	const isSame = await bcrypt.compare(password, userRes.password);
	if (!isSame) {
		message = 'Wrong password, please try again.';
		res.send({ status, message });
		return;
	}
	status = 'succeeded';
	data = userRes;
	res.send({ status, data });
});

//change password handle
app.post('/user/change-password', async (req, res) => {
	const { email, oldPassword, newPassword, confirmPassword } = req.body;
	let message;
	if (!oldPassword) {
		message = 'Please enter your old password';
		res.send({ message });
		return;
	}
	if (!newPassword) {
		message = 'Please set your new password';
		res.send({ message });
		return;
	}
	if (!confirmPassword) {
		message = 'Please confirm your new password';
		res.send({ message });
		return;
	}
	if (!validator.isStrongPassword(newPassword)) {
		message = 'Your new password is too weak';
		res.send({ message });
		return;
	}

	if (newPassword !== confirmPassword) {
		message = 'Confirm Password is not the same';
		res.send({ message });
		return;
	}

	const userRes = await userModel.findOne({ email });
	//password security check
	const isSame = await bcrypt.compare(oldPassword, userRes.password);
	if (!isSame) {
		message = 'Wrong old password, please confirm your old password.';
		res.send({ message });
		return;
	}

	const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

	const update = { password: hashedPassword };

	const filter = { email };

	let updateUserModel = null;

	try {
		updateUserModel = await userModel.findOneAndUpdate(filter, update, {
			new: true,
		});

		if (!updateUserModel) {
			message = 'update user failed';
			res.send({ message });
			return;
		}
	} catch (e) {
		message = e.message;
	}
	data = updateUserModel;
	res.send({ data });
});

app.listen(port, () =>
	console.log(`Hello world app listening on port ${port}!`)
);
