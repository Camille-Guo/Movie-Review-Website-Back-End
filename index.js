const validator = require("validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;

require("dotenv").config();
const mongoose = require("mongoose");
const userModel = require("./models");
const CommentRecordModel = require("./models1");
mongoose.connect(
  "mongodb+srv://mongouser:" + process.env.MONGODB_PWD +"@cluster0.z0czpjb.mongodb.net/myFirstDB?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); //cross-orign resource sharing
const { default: isEmail } = require("validator/lib/isEmail");
const app = express();
const port = 3001; // Must be different than the port of the React app
app.use(cors()); // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(express.json()); // Allows express to read a request body
// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//register
app.post("/register", async (request, response) => {
  console.log(request.body);
  const id = request.body.id;
  const username = request.body.username;
  const email = request.body.email;
  const password = request.body.password;
  try {
    if (
      username &&
      validator.isAlphanumeric(username) &&
      email &&
      isEmail(email) &&
      password &&
      validator.isStrongPassword(password)
    ) {
      //check if email is exist
      const user = await userModel.findOne({ email: email });
      if (user) {
        response.send({ success: false });
        return;
      } else {
        hashedPassword = await bcrypt.hash(password, saltRounds);
        const userToSave = {
          username: username,
          email: email,
          password: hashedPassword,
        };
        await userModel.create(userToSave);
        response.send({ success: true });
        return;
      }
    }
  } catch (error) {
    console.log(error.message);
  }
  response.send({ success: false });
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

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
