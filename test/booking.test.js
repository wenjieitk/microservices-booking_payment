import { startServer as bookingServer, db as bookingDb } from '../booking/src/server'
import { startServer as paymentServer, db as paymentDb } from '../payment/src/server'
const request = require('supertest')
import { v4 as uuidv4 } from 'uuid'

let bookingApp, paymentApp, bookingUrl, paymentUrl

beforeAll(async () => {
    bookingApp = await bookingServer()
    bookingUrl = `http://localhost:${bookingApp.address().port}/booking`
    paymentApp = await paymentServer()
    paymentUrl = `http://localhost:${paymentApp.address().port}/payment`
})

afterAll(async () => {
    bookingDb.set('bookings', []).write()
    paymentDb.set('payments', []).write()

    bookingApp.close()
    paymentApp.close()
})

describe('create and check booking', () => {
    it('should create a new booking', async () => {
        let booking
        const bookingObj = { id: uuidv4(), status: "Created"}
        await bookingDb.get('bookings').push(bookingObj).write()

        booking = await bookingDb.get('bookings').find({id: bookingObj.id}).value()
        expect(booking.id).toBe(bookingObj.id)
        expect(booking.status).toBe("Created")

        await request(paymentUrl)
            .get(`/pay?id=${bookingObj.id}`)
            .set('authentication-header', 'DummyTokenFromBooking')
            .expect(201)
        
         const paymentRes = await request(paymentUrl)
            .get(`/check?id=${bookingObj.id}`)
            .set('authentication-header', 'DummyTokenFromBooking')
            .expect(200)
                
        booking = await bookingDb.get('bookings')
            .find({ id: bookingObj.id })
            .assign({ status: 'Awaiting Payment'})
            .write()
        expect(booking.id).toBe(bookingObj.id)
        expect(booking.status).toBe("Awaiting Payment")

        booking = await bookingDb.get('bookings')
            .find({ id: bookingObj.id })
            .assign({ status: paymentRes.body.status})
            .write()

        const bookingRes = await request(bookingUrl)
            .get(`/check`)
            .expect(200)

        expect(bookingRes.body[0].id).toBe(bookingObj.id)
        expect(bookingRes.body.length).toEqual(1)
    })
})