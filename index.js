const validator = require("validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;

require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('./userModels');
const CommentRecordModel = require("./models1");

//Xiaoming local database
mongoose.connect(
	"mongodb+srv://mongouser:" + process.env.MONGODB_PWD +"@cluster0.z0czpjb.mongodb.net/myFirstDB?retryWrites=true&w=majority",
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
);

//zibin local database connection
// mongoose.connect(
// 	"mongodb+srv://mongouser:" +
// 	  process.env.MONGODB_PWD +
// 	  "@cluster0.xy96opn.mongodb.net/myFirstDb?retryWrites=true&w=majority",
// 	{ useNewUrlParser: true, useUnifiedTopology: true }
//   );

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
	console.log('Connected successfully');
});
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); //cross-orign resource sharing
const { default: isEmail } = require("validator/lib/isEmail");
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

	if (!validator.isAlphanumeric(username)) {
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

	if (userRes) {
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
		message = 'Please enter your password';
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


//add review
app.post("/addreview", async (request, response) => {
  // console.log(request.body);
  const id = request.body.id;
  const movieId = request.body.movieId;
  const movieName = request.body.movieName;
  const userId = request.body.userId;
  const username = request.body.username;
  const updateDate = request.body.updateDate;
  const rate = request.body.rate;
  const content = request.body.content;
  // const contentText = request.body.content.contentText;
  // console.log(id, movieId, userId, username, updateDate, rate, contentText);
  // console.log("==");
  try {
    const reviewToSave = {
      movieId: movieId,
      movieName: movieName,
      userId: userId,
      username: username,
      updateDate: updateDate,
      rate: rate,
      content: content,
    };
    // console.log(reviewToSave);
    await CommentRecordModel.create(reviewToSave);
    response.send({ success: true });
    return;
  } catch (error) {
    console.log(error.message);
  }
  response.send({ success: false });
});
/**Test for Get users */
app.get("/users", async (req, res) => {
  const users = await userModel.find();
  res.send(users);
  });
/**Test for Get notes */
  app.get("/notes", async (req, res) => {
    const notes = await CommentRecordModel.find();
    res.send(notes);
    });


/* get review using userId 
/commandreviews/get */
app.post("/commandreviews/get", async (req, res) => {
  const userId = req.body.userId;
  // console.log(userId);
  const record = await CommentRecordModel.find({
    userId: userId,
  });
  res.send(record);
  // console.log(record);
});

/* delete review using recordId  */
app.delete("/commandreviews/:recordId", async (req, res) => {
  const recordId = req.params.recordId;
  const results = await CommentRecordModel.deleteOne({ _Id: recordId });
  // console.log(results);
  res.send(results);
});

/* get review using URL path parameters 
to /commandreviews/:recordId */
app.get("/commandreviews/:recordId", async (req, res) => {
  const recordId = req.params.recordId;
  // console.log(recordId);
  const results = await CommentRecordModel.findOne({
    _id: recordId,
  });
  // console.log(results);
  res.send(results);
});

/* update review using body /users. 
Replaces the entire user. */
app.put("/commandreviews", async (req, res) => {
  const recordId = req.body.recordId;
  const movieId = req.body.movieId;
  const movieName = req.body.movieName;
  const userId = req.body.userId;
  const username = req.body.username;
  const updateDate = req.body.updateDate;
  const rate = req.body.rate;
  const content = req.body.content;
  const review = {
    _id: recordId,
    movieId: movieId,
    movieName: movieName,
    userId: userId,
    username: username,
    updateDate: updateDate,
    rate: rate,
    content: content,
  };
  console.log(review);
  const results = await CommentRecordModel.replaceOne(
    {
      _id: recordId,
    },
    review
  );
  // const res = await Person.replaceOne({ _id: 24601 }, { name: 'Jean Valjean' });
  console.log("matched: " + results.matchedCount);
  console.log("modified: " + results.modifiedCount);
  res.send(results);
});


/* An API post request using body /users. 
Replaces the entire user. */
app.put("/users", async (req, res) => {
	const password = req.body.password;
	const username = req.body.username;
	const email = req.body.email;
	const user = {
	username: username,
	password: password,
	email: email };
	const results = await userModel.replaceOne({ 
	username: username }, user);
	console.log("matched: " + results.matchedCount);
	console.log("modified: " + 
	results.modifiedCount);
	res.send(results);
	});
	
	
app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);