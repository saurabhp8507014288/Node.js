// this script is completely independent of rest of our express app and we are going to run it independently
// we are going to run from command line

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

const Movie = require('./../Models/movieModel');

dotenv.config({path: './config.env'});

// CONNECT TO MONGODB
mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn)=>{
    console.log("DB connection successful...");
}).catch((error)=>{
    console.log("Some error has occured");
});

// READ MOVIES.JSON
const movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf-8'));

//  DELETE EXISTING MOVIE DOCUMENT FROM COLLECTION
const deleteMovies = async ()=>{
    try{
        await Movie.deleteMany();
        console.log("Data deleted successfully...");
    }catch(err){
        console.log(err.message);
    }
    process.exit();
}

// IMPORT DATA INTO DB
const importMovies = async() => {
    try{
        await Movie.create(movies); 
        console.log("Data imported successfully...");
    }catch(err){
        console.log(err.message);
    }
    process.exit();
}

if(process.argv[2]==='--import'){
    importMovies();
}
if(process.argv[2]==='--delete'){
    deleteMovies();
}
