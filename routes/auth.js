const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const verify = require("./authVerify");

//Validaton of user inputs
const Joi = require("@hapi/joi");

const registerSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
  gender: Joi.string(),
  interests: Joi.array(),
});

//Sign Up Route
router.post("/register", async (req, res) => {
  //Check if email exists
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    res.status(400).send("Email already exists.");
    return;
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashedPassword,
    gender: req.body.gender ? req.body.gender : "Male",
    interests: req.body.interests ? req.body.interests : [],
  });
  try {
    //Validte user inputs
    const { error } = await registerSchema.validateAsync(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
    } else {
      await user.save(), res.status(201).send(`User created`).end();
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

const loginSchema = Joi.object({
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

//Login Route
router.post("/login", async (req, res) => {
  //Check if email exists
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return res.status(400).json({ message: "Incorrect email address." });

  if (user.suspendedTill >= new Date().getTime()) {
    return res.status(400).json({
      success: false,
      message: `You are suspended till ${new Date(user.suspendedTill)}`,
    });
  }

  //Validating password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).json({ message: "Invalid password" });

  try {
    //Validating login inputs
    const { error } = loginSchema.validateAsync(req.body);

    if (error) return res.status(400).send(error.details[0].message);
    else {
      const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SECRET);

      res.header("auth-token", token).json({
        message: "Login successful",
        user,
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/allusers", verify, async (req, res) => {
  try {
    const results = await User.find().exec();
    res.send(results);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
