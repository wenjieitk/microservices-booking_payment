import { db } from "../../data/lowdb"
import _ from 'lodash'
import axios from 'axios'

const paymentStatus = ['Success', 'Fail']

const sendPaymentResult = async(id, api, status = paymentStatus[_.random(0,1)]) => {
    await db.get('payments').push({ id, status: status }).write()
    await new Promise(resolve => setTimeout(resolve, 10000))
    await axios.post(`http://localhost:3000/callBack/${api}`, 
        { id, status: status}, 
        { headers: {'authentication-header': 'DummyTokenFromPayment'} }
    )
}

const pay = async(req, res) => {
    try {
        if(!req.query.id)
            return res.status(400).send('Booking Id cannot be empty!')
        
        res.status(201).send({ id: req.query.id, status: 'Payment in process' })

        return sendPaymentResult(req.query.id, 'payment')
    } catch (error) {
        return res.send(400).send(`${JSON.stringify(error, null, 2)}`)
    }
}

const refund = async(req, res) => {
    try {
        if(!req.query.id)
            return res.status(400).send('Booking Id cannot be empty!')

        res.status(201).send({ id: req.query.id, status: 'Refund in process' })

        return sendPaymentResult(req.query.id, 'refund' ,'Refund')
    } catch (error) {
        return res.send(400).send(`${JSON.stringify(error, null, 2)}`)
    }
}

const check = async(req, res) => {
    try {
        if(!req.query.id)
            return res.status(400).send('Booking Id cannot be empty!')

        const paymentHistory = await db.get('payments').filter({ id: req.query.id}).value()

        return res.status(200).send(paymentHistory)
    } catch (error) {
        return res.send(400).send(`${JSON.stringify(error, null, 2)}`)
    }
}


export {
    pay,
    refund,
    check
}