const validator = require('validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

require('dotenv').config();
const mongoose = require("mongoose");
const userModel = require("./models");

//rucheng local database
mongoose.connect("mongodb+srv://rrc:" + process.env.MONGODB_PWD + "@cluster0.rqltzmh.mongodb.net/monvie?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("Connected successfully");
});
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); //cross-orign resource sharing
const { default: isEmail } = require('validator/lib/isEmail');
const app = express();
const port = 3001; // Must be different than the port of the React app
app.use(cors()); // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(express.json()); // Allows express to read a request body
// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//register handle
app.post('/register', async (request, response) => {
    console.log(request.body);
    const id = request.body.id;
    const username = request.body.username;
    const email = request.body.email;
    const password = request.body.password;
    // console.info(validator.isStrongPassword(password));
    const comfirmpassword = request.body.comfirmpassword;
    try {
        if (username && validator.isAlphanumeric(username) &&
            email && isEmail(email) &&
            password && validator.isStrongPassword(password) &&
            comfirmpassword
        ) {
            //check if password and comfirm password are same
            if (password !== comfirmpassword) {
                response.send({ success: false, pwdErrMsg: 'Password and confirmpassword must be same' });
                return;
            }
            //check if email is exist
            const user = await userModel.findOne({ email: email }); console.info(user);
            if (user) {
                response.send({ success: false, emailErrMsg: "Email is exist" });
                return;
            } else {
                hashedPassword = await bcrypt.hash(password, saltRounds);
                const userToSave = {
                    username: username,
                    email: email,
                    password: hashedPassword,
                    avatar: null,
                };
                await userModel.create(userToSave);
                response.send({ success: true });
                return;
            }
        } else {
            if (!username || !email || !password || !comfirmpassword) {
                response.send({ success: false, errorMsg:"All fields is require"})
                return;
            }
        }
    } catch (error) {
        console.log("error");
    }
    response.send({ success: false });

});

//login handle
app.post("/login", async (request, response)=>{
    const email = request.body.email;
    const password = request.body.password;
    try {
        if (email && password) {
            // Check to see if the user already exists. If not, then create it.
            const user = await userModel.findOne({ email: email });
            if (!user) {
                console.log("Invalid login - email " + email + " doesn'texist.");
                response.send({ success: false });
                return;
            } else {
                const isSame = await bcrypt.compare(password, user.password);
                if (isSame) {
                    console.log("Successful login");
                    response.send({ success: true });
                    return;
                }else{
                    response.send({ success: false, loginErr:'Wrong password' })
                    return;
                }
            }
        }
    } catch (error) {
        console.log(error.message);
    }
    response.send({ success: false });
});

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))