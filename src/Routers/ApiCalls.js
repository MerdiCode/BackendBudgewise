const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

const Router = express.Router();
const db = require('../db')

Router.post('/SignUp', (req, res) => {
  const { email, name, password, balance } = req.body;
  
  // ... existing validation code ...

  db.query(Insert, [name, email, hashedPassword, balance], (err, result) => {
    if (err) {
      return res.status(400).json({ err: 'Error occurred' });
    }
           
    db.query(profVsExp, [result.insertId, 50, 50], (err, response) => {
      if (err) throw err;
    });

    const token = jwt.sign({id: result.insertId}, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({id: result.insertId}, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    
    // Consistent cookie settings
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,     // CRUCIAL for cross-site cookies
      sameSite: 'none', // ESSENTIAL for cross-device compatibility
      maxAge: 3600000,
      path: '/'
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,     // CRUCIAL for cross-site cookies
      sameSite: 'none', // ESSENTIAL for cross-device compatibility
      maxAge: 604800000,
      path: '/'
    });

    return res.status(200).json({ 
      msg: 'User Added', 
      result 
    });
  });
});

Router.post('/LogIn', (req, res) => {
  const { logEmail, logPass } = req.body;
  
  // ... existing authentication code ...

  const token = jwt.sign({ id: user.Users_Id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user.Users_Id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  
  // Consistent cookie settings
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,     // CRUCIAL for cross-site cookies
    sameSite: 'none', // ESSENTIAL for cross-device compatibility
    maxAge: 3600000,
    path: '/'
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,     // CRUCIAL for cross-site cookies
    sameSite: 'none', // ESSENTIAL for cross-device compatibility
    maxAge: 604800000,
    path: '/'
  });

  return res.status(200).json({ msg: 'Welcome back' });
});

Router.post('/Logout',(req,res)=>{
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });
  res.json({msg:'loged out seccessfullly'})
  })
module.exports = Router;