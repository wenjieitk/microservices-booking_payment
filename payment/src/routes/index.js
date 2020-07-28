import express from 'express'
import {bookingRoutes} from './payment'

const getRoutes = () => {
    const router = express.Router()
    router.use('/payment', bookingRoutes())
    
    return router
}

export {
    getRoutes
}