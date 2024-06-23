const express = require("express");
const auth = require("../middleware/auth");

const { register, login, logout,findUserById } = require("../controllers/users");

const router = express.Router();

router.post("/signup", register);
router.post("/signin", login);
router.delete("/logout", logout);
router.get('/:id', auth, findUserById);

module.exports = router;
