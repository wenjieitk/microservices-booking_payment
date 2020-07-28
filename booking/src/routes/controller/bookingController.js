import { db } from "../../data/lowdb"
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import axios from 'axios'
import logger from 'loglevel'

const create = async(req, res) => {
    try {
        const bookingObj = { id: uuidv4(), status: "Created"}
        await db.get('bookings').push(bookingObj).write()

        const booking = db.get('bookings').find({id: bookingObj.id}).value()
        logger.info({'Booking created' : booking})
        res.status(201).send(booking)
        await new Promise(resolve => setTimeout(resolve, 10000))

        await axios.get(`http://localhost:3001/payment/pay?id=${bookingObj.id}`, {
            headers: {'authentication-header': 'DummyTokenFromBooking'}
        })
        const paymentRes = await db.get('bookings')
            .find({ id: bookingObj.id })
            .assign({ status: 'Awaiting Payment'})
            .write()
        logger.info({'Awaiting Payment' : paymentRes})

        return
    } catch (error) {
        return res.send(400).send(`${JSON.stringify(error, null, 2)}`)
    }
}

const cancel = async(req, res) => {
    try {
        if(!req.query.id)
            return res.status(400).send('ID cannot be empty!')

        const booking = db.get('bookings').find({id: req.query.id}).value()

        if(!booking)
            return res.status(401).send('Booking not found!')
        else if(booking.status !== 'Confirmed')
            return res.status(401).send('Invalid operation. You are not able to cancel the booking!')

        await axios.get(`http://localhost:3001/payment/refund?id=${booking.id}`, {
            headers: {'authentication-header': 'DummyTokenFromBooking'}
        })

        const cancelledBooking = db.get('bookings')
            .find({ id: booking.id })
            .assign({ status: 'Awaiting Refund'})
            .write()
        logger.info({'Awaiting Refund' : cancelledBooking})
        
        return
    } catch (error) {
        return res.send(400).send(`${JSON.stringify(error, null, 2)}`)
    }
}

const check = async(req, res) => {
    let bookings
    try {
        if(!req.query.id) 
            bookings = await db.get('bookings').value()
        else {
            bookings = await db.get('bookings').find({id: req.query.id}).value()
            if(!bookings)
                return res.status(401).send('Booking not existed!')

            const paymentHistory = await axios.get(`http://localhost:3001/payment/check?id=${bookings.id}`, {
                headers: {'authentication-header': 'DummyTokenFromBooking'}
            })
            bookings['paymentHistory'] = paymentHistory.data
        }

        return res.status(200).send(bookings)
    } catch (error) {
        return res.send(400).send(`${JSON.stringify(error, null, 2)}`)
    }
}

const retry = async(req, res) => {
    try {
        if(!req.query.id)
            return res.status(400).send('ID cannot be empty!')
        
        const booking = db.get('bookings').find({id: req.query.id}).value()

        if(!booking)
            return res.status(401).send('Booking not found!')
        else if(booking.status !== 'Cancelled')
            return res.status(401).send('Invalid operation. You are not able to re-try the booking!')

        await axios.get(`http://localhost:3001/payment/pay?id=${booking.id}`, {
            headers: {'authentication-header': 'DummyTokenFromBooking'}
        })
        const paymentRes = await db.get('bookings')
            .find({ id: booking.id })
            .assign({ status: 'Awaiting Payment'})
            .write()
        logger.info({'Awaiting Payment' : paymentRes})

        return
    } catch (error) {
        return res.send(400).send(`${JSON.stringify(error, null, 2)}`)
    }
}

export {
    create,
    cancel,
    check,
    retry
}