const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

process.on('uncaughtException', (err)=>{ // this will handle all unhandled rejected promise in application
    console.log(err.name, err.message);

    console.log("Uncaught Exception occured! Shutting down...");

    process.exit(1)
    
})

const app = require('./app');
//console.log(process.env)

mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn)=>{
    //console.log(conn);
    console.log("DB connection successful...");
})

const port = process.env.PORT || 3000;
const server = app.listen(port, ()=>{
    console.log("server has started...");
})

process.on('unhandledRejection', (err)=>{ // this will handle all unhandled rejected promise in application
    console.log(err.name, err.message);

    console.log("Unhandled rejection occured! Shutting down...");

    server.close(()=>{
        process.exit(1) // 0 stands for success, 1 stands for uncaught exception
    })
    
})
