const exp = require('express')
const app = exp()

const expressAsyncHandler = require('express-async-handler')
const mongodb = require('mongodb').MongoClient
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helmet = require('helmet');
require('dotenv').config()
app.use(exp.json())

const cors = require('cors')
app.use(cors());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // Allow scripts from the same origin
    },
  })
);

let db, users, userData
mongodb.connect(process.env.MONGODB_URI)
  .then(client => {
    console.log('Connected to MongoDB successfully!')
    db = client.db('database')
    users = db.collection('userscollection')
    userData = db.collection('userdatacollection')
  })
  .catch(err => {
    console.error("Error connecting to DB:", err)
    process.exit(1) // Exit if DB connection fails
  })

app.post("/signup", expressAsyncHandler(async (req, res) => {
  let body = req.body;
  console.log(body)
  const dbUser = await users.findOne({ username: body.username });
  if (dbUser !== null)
    res.send({ message: "User already exists" });
  else {
    const hash = await bcryptjs.hash(body.password, 7);
    body.password = hash;
    await users.insertOne(body);
    // Create empty user data document
    await userData.insertOne({
      username: body.username,
      personalData: {
        aadhar: {
          number: '',
          name: '',
          dob: '',
          address: ''
        },
        pan: {
          number: '',
          name: ''
        },
        tenth: {
          school: '',
          percentage: '',
          year: ''
        },
        license: {
          number: '',
          name: '',
          validity: ''
        }
      }
    });
    res.send({ message: "User registered" });
  }
}));

app.post("/login", expressAsyncHandler(async (req, res) => {
  console.log('Login request received:', req.body); // Log incoming request

  const user = req.body;
  if (!user.username || !user.password) {
    console.log('Missing credentials');
    return res.status(400).send({ message: "Username and password are required" });
  }

  const dbUser = await users.findOne({ username: user.username });
  console.log('Database user found:', dbUser ? 'Yes' : 'No'); // Log user found status

  if (dbUser === null) {
    console.log('User not found');
    return res.status(401).send({ message: "Invalid username" });
  }

  try {
    const status = await bcryptjs.compare(user.password, dbUser.password);
    console.log('Password match:', status); // Log password match status

    if (status === false) {
      console.log('Invalid password');
      return res.status(401).send({ message: "Invalid password" });
    }

    const signedToken = jwt.sign({ username: dbUser.username }, process.env.SECRET_KEY, { expiresIn: "1d" });
    console.log('Token generated successfully'); // Log token generation

    res.status(200).send({
      message: "Login successful",
      token: signedToken,
      user: {
        username: dbUser.username
      }
    });
  } catch (error) {
    console.error('Login error:', error); // Log any errors
    res.status(500).send({ message: "Error during login process" });
  }
}));

app.get("/user-data", expressAsyncHandler(async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).send({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const username = decoded.username;

    const userDataDoc = await userData.findOne({ username: username });

    if (!userDataDoc) {
      res.status(404).send({ message: "User data not found" });
    } else {
      res.send({ data: userDataDoc.personalData });
    }
  } catch (error) {
    res.status(500).send({ message: "Error retrieving user data" });
  }
}));

app.put("/user-data", expressAsyncHandler(async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).send({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const username = decoded.username;
    const newData = req.body;

    if (!newData || !newData.personalData) {
      return res.status(400).send({ message: "Invalid data format" });
    }

    const result = await userData.updateOne(
      { username: username },
      {
        $set: { personalData: newData.personalData }
      },
      { upsert: true }
    );

    if (result.acknowledged) {
      res.send({ message: "User data updated successfully" });
    } else {
      res.status(500).send({ message: "Error updating user data" });
    }
  } catch (error) {
    res.status(500).send({ message: "Error updating user data" });
  }
}));

app.patch("/user-data/:docType", expressAsyncHandler(async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return res.status(401).send({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const username = decoded.username;
    const { docType } = req.params;
    const newData = req.body;

    console.log('Updating document:', {
      username,
      docType,
      newData
    });

    const validDocTypes = ['aadhar', 'pan', 'tenth', 'license'];
    if (!validDocTypes.includes(docType)) {
      console.log('Invalid document type:', docType);
      return res.status(400).send({ message: "Invalid document type" });
    }

    const updatePath = `personalData.${docType}`;

    const result = await userData.updateOne(
      { username: username },
      { $set: { [updatePath]: newData } }
    );

    console.log('Database update result:', result);

    if (result.acknowledged) {
      // Verify the update
      const updatedDoc = await userData.findOne({ username: username });
      console.log('Updated document:', updatedDoc);

      res.send({
        message: `${docType} data updated successfully`,
        data: updatedDoc.personalData[docType]
      });
    } else {
      console.log('Update not acknowledged');
      res.status(500).send({ message: `Error updating ${docType} data` });
    }
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).send({ message: "Error updating document data" });
  }
}));

let port = process.env.PORT || 4000
app.listen(port, () => console.log(`Listening in on ${port}`))