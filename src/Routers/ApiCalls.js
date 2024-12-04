const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

const Router = express.Router();
const db = require('../db')

Router.post('/SignUp', (req, res) => {

  const { email, name, password ,balance } = req.body;

  const Insert = 'INSERT INTO Users (UserName, email, passwords, Balance) VALUES (?, ?, ?, ?)';
  const profVsExp = 'INSERT INTO ProfVsExp(users_Id,profit,expenses) VALUES(?,?,?)'
  const check = 'SELECT * FROM Users WHERE email = ?';

  if (!email || !name || !password) {
    return res.json({ msg: 'All fields required' })
  }


  db.query(check, [email], async (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      return res.json({ err: 'User exists' });
    }

    const SaltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, SaltRounds);

    db.query(Insert, [name, email, hashedPassword,balance], (err, result) => {
      if (err) {

        return res.status(400).json({ err: 'Error occurred' });
      }
           
      db.query(profVsExp,[result.insertId,50,50],(err,response)=>{
       
        if (err) throw err;
          })

      const token = jwt.sign({id:result.insertId}, process.env.JWT_SECRET, { expiresIn: '1h' })
      const refreshToken = jwt.sign({id:result.insertId}, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

      res.cookie('token', token, {
        httpOnly: true,
        secure:process.env.NODE_ENV === 'production',
        sameSite: 'None',
        secure: true,
        maxAge: 3600000,
        path: '/'
      })

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure:process.env.NODE_ENV === 'production',
        sameSite: 'None',
        secure: true,
        maxAge: 604800000,
        path: '/'
      })

      return res.status(200).json({ msg: 'User Added', result });
    });
  });
});


Router.post('/LogIn', (req, res) => {
  const { logEmail, logPass } = req.body;

  const check = 'SELECT * FROM Users WHERE email = ?';

  db.query(check, [logEmail], async (err, respons) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ msg: 'Server error' });
      }

      if (respons.length === 0) {
          return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const user = respons[0];

      try {
          const Match = await bcrypt.compare(logPass, user.Passwords);

          if (!Match) {
              return res.status(400).json({ msg: 'Invalid credentials' });
          }

          // Generate tokens
          const token = jwt.sign({ id: user.Users_Id }, process.env.JWT_SECRET, { expiresIn: '1h' });
          const refreshToken = jwt.sign({ id: user.Users_Id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

          // Set cookies
          res.cookie('token', token, {
              httpOnly: true,
              secure: true,
              sameSite: 'None',
              maxAge: 3600000,
              path: '/'
          });

          res.cookie('refreshToken', refreshToken, {
              httpOnly: true,
              secure: true,
              sameSite: 'None',
              maxAge: 604800000,
              path: '/'
          });

          return res.status(200).json({ msg: 'Welcome back' });
      } catch (compareErr) {
          console.error('Error comparing passwords:', compareErr);
          return res.status(500).json({ msg: 'Server error' });
      }
  });
});


Router.post('/Logout',(req,res)=>{
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'None' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'None' });
  res.json({msg:'loged out seccessfullly'})
  })
module.exports = Router;