const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require('../model/userModel');
require("dotenv").config();

// Update username
exports.updateUsername = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    // Check if username exists
    let nameExists = await User.findOne({ name });
    if (nameExists && nameExists._id.toString() !== userId) {
        return res.status(409).json({ message: 'Username already taken' });
    }
    const user = await User.findByIdAndUpdate(userId, { name }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ name: user.name, email: user.email });
});

// Change password
exports.changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Both old and new passwords are required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password changed successfully' });
});

exports.register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' })
    }

    // Check if email exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if username exists, suggest a new one if so
    let finalName = name;
    let nameExists = await User.findOne({ name });
    let suggestionCount = 1;
    while (nameExists) {
        finalName = `${name}${Math.floor(Math.random() * 10000)}`;
        nameExists = await User.findOne({ name: finalName });
        suggestionCount++;
        if (suggestionCount > 10) break; // avoid infinite loop
    }
    if (finalName !== name) {
        // If suggested, return suggestion to client
        return res.status(409).json({ message: `Username already taken. Try '${finalName}' or another name.` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const user = new User({
        name: finalName,
        email: email,
        password: hashedPass
    });

    // persist user and return created payload
    const created = await user.save();
    if (created) {
        return res.status(201).json({
            name: created.name,
            email: created.email,
            token: generateToken(created._id)
        });
    }
})

exports.login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password' })
    }

    // allow login by email OR username (name)
    const user = await User.findOne({ $or: [{ email }, { name: email }] });
    if (!user) {
        console.log('User not found for identifier:', email);
        return res.status(400).json({ message: 'User not found' })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (isMatch) {
        const token = generateToken(user._id);
        return res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: token
        })
    } else {
        return res.status(400).json({ message: 'Invalid password' })
    }
})

exports.getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user)
  })

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    })
  }