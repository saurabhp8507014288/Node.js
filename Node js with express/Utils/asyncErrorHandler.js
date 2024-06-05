module.exports = (func)=>{
    return (req, res, next)=>{ // called by Express
        func(req, res, next).catch(err => next(err));
    }
}
