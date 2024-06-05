const Movie = require('./../Models/movieModel');
const ApiFeatures = require('./../Utils/ApiFeatures');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler')
const CustomError = require('./../Utils/CustomError');

// ROUTE HANDLER FUNCTIONS:

exports.getHighestRated = (req, res, next) => {
    req.query.limit = '2';
    req.query.sort = '-ratings';

    next();
}

exports.getAllMovies = asyncErrorHandler(async (req, res, next)=>{
    
    const features = new ApiFeatures(Movie.find(), req.query).sort().filter().limitFields().paginate();
    let movies = await features.query;

    res.status(200).json({
        status: 'success',
        length: movies.length,
        data: {
            movies
        }
    })
})

exports.getMovie = asyncErrorHandler(async (req, res, next)=>{
    
    //const movie = await Movie.find({_id:req.params.id}); same as:
    const movie = await Movie.findById(req.params.id);

    // console.log(x)

    if(!movie){
        const error = new CustomError("movie with that id is not found", 404);
        return next(error);
    }
    res.status(200).json({
        status: 'success',
        data: {
            movie
        }
    })
})



exports.createMovie = asyncErrorHandler(async (req, res, next)=>{
    const movie = await Movie.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            movie
        }
    });
})

exports.updateMovie = asyncErrorHandler(async (req, res, next) => {

    //const movie = await Movie.find({_id:req.params.id}); same as:
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true});

    if(!updatedMovie){
        const error = new CustomError("movie with that id is not found", 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: {
            movie: updatedMovie
        }
    })  
})

exports.deleteMovie = asyncErrorHandler(async (req, res, next) =>{

    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

    if(!deletedMovie){
        const error = new CustomError("movie with that id is not found", 404);
        return next(error);
    }

    res.status(204).json({
        status: 'success',
        data: null
    })

})

exports.getMovieStats = asyncErrorHandler(async (req, res, next)=>{

    const stats = await Movie.aggregate([
        //{ $match: {releaseDate: {$lte: new Date()}}},
        { $match: {ratings: {$gte: 4.5}}},
        { $group: {
            _id: '$releaseYear',
                avgRating: {$avg: '$ratings'},
                avgprice: {$avg: '$price'},
                minprice: {$min: '$price'},
                maxprice: {$max: '$price'},
                pricetotal: {$sum: '$price'},
                movieCount: {$sum: 1},
        }},
        { $sort: {minprice: 1}},
        //{ $match: {maxprice: {$gte: 10}}} 
    ]);

    res.status(200).json({
        status: 'success',
        count: stats.length,
        data: stats
    })
})

exports.getMoviesByGenre = asyncErrorHandler(async (req, res, next)=>{

    const genre = req.params.genre;
    const movies = await Movie.aggregate([
        //{ $match: {releaseDate: {$lte: new Date()}}},
        { $unwind: '$genres'},
        { $group: {
            _id: "$genres",
            movieCount: {$sum: 1},
            movies: {$push: '$name'},
        }},
        {$addFields: {genre: '$_id'}},
        {$project: {_id:0}},
        {$sort: {movieCount: -1}},
        {$limit: 4},
        {$match: {genre:genre}}
    ])

    res.status(200).json({
        status: 'success',
        count: movies.length,
        data: movies
    })
})