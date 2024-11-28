const express = require('express')
const jwt = require('jsonwebtoken')
const Router = express.Router();
const db = require('../db')
const Authentication = require('../midleware/userAuth')


Router.get('/me', Authentication, (req, res) => {

    const check = 'SELECT * FROM Users WHERE Users_Id = ?'


    db.query(check, [req.users.id], (err, result) => {
        if (err) {
            console.log(err)
        }

        if (result.length === 0) {
            return res.status(400).json({ msg: 'user not found' })
        }
        return res.status(200).json({ User: result[0] })

    })
})



module.exports = Router