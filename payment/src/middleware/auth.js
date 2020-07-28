const auth = (req, res, next) => {
    if(!req.headers["authentication-header"]
        || req.headers["authentication-header"] !== "DummyTokenFromBooking") 
            return res.status(403).send('Invalid authentication')
    next()
}

export {
    auth
}