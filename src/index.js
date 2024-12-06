const express = require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config()
const api = require('./Routers/ApiCalls')
const Auth = require('./Routers/Auth')
const Balance = require('./Routers/Balance')
const app = express();
const port = process.env.PORT;
app.use(cors({
    origin:'https://budgewisee.vercel.app',
    credentials:true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Origin', 'Host']
}))
app.use(express.json())
app.use(cookieParser())
app.use('/users',api)
api.use(Balance)
api.use('/auth',Auth)
app.listen(port,()=>{
    console.log(server is running in port ${port})
})