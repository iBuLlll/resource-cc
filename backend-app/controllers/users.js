const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.register= async(req, res) => {
  try {
    const user = await User.create(req.body) 
    const token = user.getSignedJwtToken()
    res.status(200).json({ 
      message: "success",
      token
    }) 
  } catch (err) {
    console.error(err.message);
    // Check if the error is a duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email has already been used"
      });
    }
    res.status(500).send('Server Error');
  }
}


exports.login = async(req, res, next) => {
  try {
    const { email, password } = req.body;
    // Validate emil & password
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide an email and password"
      })
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: "Email Doesnt Match"
      })
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Wrong Password"
      })
    }

    const token = user.getSignedJwtToken()

    res.status(200).json({ 
      message: "success",
      token
    })
  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}


exports.logout = async (req, res) => {
  try {
    // Biasanya, tidak perlu ada operasi pada sisi server saat logout
    // Karena state di sini dianggap stateless (tidak menyimpan informasi sesi)

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

exports.findUserById = async (req, res) => {
  try {
      const userId = req.params.id;  // Ambil ID dari parameter URL
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({
              message: "User not found"
          });
      }

      res.status(200).json({
          message: "User found successfully",
          data: user
      });
  } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
          return res.status(400).json({
              message: "Invalid user ID"
          });
      }
      res.status(500).send('Server Error');
  }
}
