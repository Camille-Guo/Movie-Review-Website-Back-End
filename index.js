const validator = require("validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;

require("dotenv").config();
const mongoose = require("mongoose");
const userModel = require("./models");
const CommentRecordModel = require("./models1");
mongoose.connect(
  "mongodb+srv://mongouser:" +
    process.env.MONGODB_PWD +
    "@cluster0.xy96opn.mongodb.net/myFirstDb?retryWrites=true&w=majority",
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
      userId: userId,
      username: username,
      updateDate: updateDate,
      rate: rate,
      content: content,
    };
    console.log(reviewToSave);
    await CommentRecordModel.create(reviewToSave);
    response.send({ success: true });
    return;
  } catch (error) {
    console.log(error.message);
  }
  response.send({ success: false });
});

//users/get
// app.post("/CommentRecord/get", async (req, res) => {
//   const username = req.body.username;
//   const review = await userModel.findOne({
//     username: username,
//   });
//   res.send(user);
// });

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
