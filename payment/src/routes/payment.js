import express from 'express'
import { pay, check, refund } from "./controller/paymentController"

const bookingRoutes = () => {
  const router = express.Router()
  router.get('/pay', pay)
  router.get('/refund', refund)
  router.get('/check', check)
  return router
}

export {
    bookingRoutes
}