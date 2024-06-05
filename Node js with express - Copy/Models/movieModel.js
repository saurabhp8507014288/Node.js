const mongoose = require('mongoose');
const fs = require('fs');
const validator = require('validator');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        unique: true, 
        maxLength: [100, "Movie must not have characters more than 100"],
        minLength: [4, "Must have atleast 4 characters"], 
        trim: true,
        validate: [validator.isAlpha, "Movie name must only contain characters"]
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, "Duration is required"]
    },
    ratings: {
        type: Number,
        validate: {
            validator: function(value){
                return value >=1 && value <= 10;
            },
            message: "ratings value {VALUE} should between 1 and 10"
        }
    },
    totalRating: {
        type: Number
    },
    releaseYear: {
        type: Number,
        required: [true, "Release year is required"]
    },
    releaseDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    genres: {
        type: [String],
        required: [true, "Genres is required"],
        // enum: {
        //     values: ["action","thriller","sci-fy","drama","romance","comedy","biography","crime","adventure"],
        //     message: "This genre does not exist"
        // }
    },
    directors: {
        type: [String],
        required: [true, "Directors is required"]
    },
    coverImage: {
        type: String,
        required: [true, "Cover image is required"]
    },
    actors: {
        type: [String],
        required: [true, "Actors is required"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"]
    },
    createdBy: String
},{
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    
});

movieSchema.virtual('durationInHours').get(function(){
    return this.duration/60; 
})

movieSchema.pre('save', function(next){
    this.createdBy = "Saurabh";
    next();
})
movieSchema.post('save', function(doc, next){
    const content = `A new movie document with name ${doc.name} has been created by ${doc.createdBy}\n`;
    fs.writeFileSync('./Log/log.txt', content, {flag: 'a'}, (err)=>{
        console.log(err);
    })
    next();
})

movieSchema.pre(/^find/, function(next){
    this.find({releaseDate: {$lte: Date.now()}});
    this.startTime = Date.now();
    next();
})
movieSchema.post(/^find/, function(docs, next){
    this.find({releaseDate: {$lte: Date.now()}});
    this.endTime = Date.now();

    const content = `Query took ${this.endTime - this.startTime} millisecond to fetch the documents\n`;
    fs.writeFileSync('./Log/log.txt', content, {flag: 'a'}, (err)=>{
        console.log(err);
    })

    next();
})

movieSchema.pre('aggregate', function(next){
    this.pipeline().unshift({$match: {releaseDate: {$lte: new Date()}}});
    next();
})

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;