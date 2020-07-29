import { db } from "../../data/lowdb"
import _ from 'lodash'
import logger from 'loglevel'

const payment = async(req, res) => {
    try {
        if(_.isEmpty(req.body))
            return res.status(400).send('Empty request!')

        const {id, status} = req.body, booking = db.get('bookings').find({id}).value()
        if(!booking)
            return res.status(401).send('Booking not found!')

        res.status(201).send('Received from booking!')

        const bookingRes = await db.get('bookings')
            .find({ id })
            .assign({ status: (status === 'Success') ?'Confirmed' :'Cancelled' })
            .write()
        logger.info({"Payment Result": bookingRes})
        return
    } catch (error) {
        return res.send(400).send(`${JSON.stringify(error, null, 2)}`)
    }
}

const refund = async(req, res) => {
    try {
        if(_.isEmpty(req.body))
            return res.status(400).send('Empty request!')

        const {id} = req.body, booking = db.get('bookings').find({id}).value()
        if(!booking)
            return res.status(401).send('Booking not found!')

        res.status(201).send('Received from booking!')

        const bookingRes = await db.get('bookings')
            .find({ id })
            .assign({ status: 'Refunded' })
            .write()
        logger.info({"Payment Result": bookingRes})
        return
    } catch (error) {
        return res.send(400).send(`${JSON.stringify(error, null, 2)}`)
    }
}


export {
    payment,
    refund
}