const validator = require("validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;

require("dotenv").config();
const mongoose = require("mongoose");
const userModel = require("./models");

//rucheng local database
mongoose.connect(
  "mongodb+srv://rrc:" +
    process.env.MONGODB_PWD +
    "@cluster0.rqltzmh.mongodb.net/monvie?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
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
app.use(express.json()); // Allows express to read a req body
// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//register handle
app.post("/register", async (req, res) => {
  const { username, email, password, comfirmPassword } = req.body;

  let status = "failed",
    message = "";

  if (!username) {
    message = "Please fill username";
  }

  if (validator.isAlphanumeric(username)) {
    message = "aaaa";
  }

  if (!email) {
    message = "Please fill email";
  }

  if (!isEmail(email)) {
    message = "Please fill with valid email";
  }

  if (!password) {
    message = "Please fill password";
  }

  if (!validator.isStrongPassword(password)) {
    message = "Your password is too weak";
  }

  if (password !== comfirmPassword) {
    message = "Password is not the same";
  }

  const userRes = await userModel.findOne({ email });

  if (!userRes) {
    message = "Email is exist";
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
      message = "create user failed";
    }
  } catch (e) {
    message = e.message;
  }

  status = "succeeded";
  data = newUserModel;

  res.send(status === "failed" ? { status, message } : { status, data });
});

//login handle
app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    if (email && password) {
      // Check to see if the user already exists. If not, then create it.
      const user = await userModel.findOne({ email: email });
      if (!user) {
        console.log("Invalid login - email " + email + " doesn'texist.");
        res.send({ success: false });
        return;
      } else {
        const isSame = await bcrypt.compare(password, user.password);
        if (isSame) {
          console.log("Successful login");
          res.send({ success: true, user: user });
          return;
        } else {
          res.send({ success: false, loginErr: "Wrong password" });
          return;
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
  res.send({ success: false });
});

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
