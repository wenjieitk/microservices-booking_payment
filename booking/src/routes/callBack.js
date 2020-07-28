import express from 'express'
import { payment, refund } from "./controller/paymentCbController"

const paymentCb = () => {
  const router = express.Router()
  router.post('/payment', payment)
  router.post('/refund', refund)
  return router
}

export {
    paymentCb
}