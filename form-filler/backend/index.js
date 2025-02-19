const exp = require('express')
const app = exp()

const expressAsyncHandler = require('express-async-handler')
const mongodb = require('mongodb').MongoClient
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verifyToken");
require('dotenv').config()
app.use(exp.json())


let db, users
mongodb.connect(process.env.MONGODB_URI)
  .then(client => {
    console.log('Connected to MongoDB successfully!')
    db = client.db('moviedb')
    users = db.collection('userscollection')
  })
  .catch(err => console.log("Error in DB", err))

app.post("/register", expressAsyncHandler(async (req, res) => {
  let body = req.body;
  const dbUser = await users.findOne({ username: body.username });
  if (dbUser !== null)
    res.send({ message: "User already exists" });
  else {
    const hash = await bcryptjs.hash(body.password, 7);
    body.password = hash;
    await users.insertOne(body);
    res.send({ message: "User registered" });
  }
}));

app.post("/login", expressAsyncHandler(async (req, res) => {
  const user = req.body;
  const dbUser = await users.findOne({ username: user.username });
  if (dbUser === null)
    res.send({ message: "Invalid username" });
  else {
    const status = await bcryptjs.compare(user.password, dbUser.password);
    if (status === false)
      res.send({ message: "Invalid password" });
    else {
      const signedToken = jwt.sign({ username: dbUser.username }, process.env.SECRET_KEY, { expiresIn: "1d" });
      res.send({ message: "Login successful", token: signedToken, user: dbUser });
    }
  }
}));