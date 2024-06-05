const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const moviesRouter = require('./Routes/moviesRoutes');
const CustomError = require('./Utils/CustomError');
const globalErrorHandler = require('./Controllers/errorController');
const authRouter = require('./Routes/authRouter');
const userRoute = require('./Routes/userRoute');


let app = express();

app.use(helmet());

let limiter = rateLimit({
    max: 30,
    windowMs: 60 * 60 * 1000, // 1hour
    message: 'Too many requests from this IP, please try again in an hour'
})
app.use('/api', limiter);


const logger = function(req, res, next){
    console.log("custom  middleware called");
    next();
}

app.use(express.json({limit: '10kb'})); // amount of data that our apis will accept in request body

app.use(sanitize()); // prevent NoSQL query injection problem
app.use(xss())
app.use(hpp()) // prevent parameter pollution

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

app.use(express.static('./public'))
app.use(logger);
app.use((req, res, next) => {
    req.requestedAt = new Date().toISOString();
    next();
})

app.use('/api/v1/movies', moviesRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRoute);

app.all('*', (req, res, next)=>{
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server`
    // })
    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.status = 'fail';
    // err.statusCode = 404;
    const err = new CustomError(`Can't find ${req.originalUrl} on this server`, 404);
    next(err);
})

app.use(globalErrorHandler);

module.exports = app;