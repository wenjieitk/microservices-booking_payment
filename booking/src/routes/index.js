import express from 'express'
import {bookingRoutes} from './booking'
import { paymentCb } from './callBack'
import {auth} from '../middleware/auth'

const getRoutes = () => {
    const router = express.Router()
    router.use('/booking', bookingRoutes())
    router.use('/callBack', auth, paymentCb())
    
    return router
}

export {
    getRoutes
}