
const express = require("express");
const router = express.Router();
const { register, login, updateUsername, changePassword } = require("../controllers/userController");
const { validate } = require('../middlewares/AuthMiddleware');

router.put("/update-username", validate, updateUsername);
router.put("/change-password", validate, changePassword);


router.post("/register",register);

router.post("/login",login);

module.exports=router