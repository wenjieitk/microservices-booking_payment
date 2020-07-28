import express from 'express'
import { cancel,check,create,retry } from "./controller/bookingController"

const bookingRoutes = () => {
  const router = express.Router()
  router.get('/create', create)
  router.get('/cancel', cancel)
  router.get('/check', check)
  router.get('/retry', retry)
  return router
}

export {
    bookingRoutes
}