const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const moviesRouter = require('./Routes/moviesRoutes');
const CustomError = require('./Utils/CustomError');
const globalErrorHandler = require('./Controllers/errorController');
const authRouter = require('./Routes/authRouter');


let app = express();

const logger = function(req, res, next){
    console.log("custom  middleware called");
    next();
}

app.use(express.json());

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
app.use('/api/v1/users', authRouter);

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