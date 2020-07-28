import express from 'express'
import 'express-async-errors'
import logger from 'loglevel'

function startServer({port = process.env.PORT || 3001} = {}) {
  const app = express()
  app.use(errorMiddleware)
  app.use(express.json()) 

  return new Promise(resolve => {
    const server = app.listen(port, () => {
      logger.info(`Payment listening on port ${server.address().port}`)
      const originalClose = server.close.bind(server)
      server.close = () => new Promise(resolveClose => originalClose(resolveClose))
      setupCloseOnExit(server)
      resolve(server)
    })
  })
}

// error handler for unhandle errors
const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent)
    next(error)
  else {
    logger.error(error)
    res.status(500)
    res.json({
      message: error.message,
      ...(process.env.NODE_ENV === 'production' ?null :{stack: error.stack})
    })
  }
}

// ensure the server will be closed in the event of an error
function setupCloseOnExit(server) {
  async function exitHandler(options = {}) {
    await server
      .close()
      .then(() => logger.info('Payment server successfully closed'))
      .catch(e => logger.warn('Something went wrong closing the payment server', e.stack))
    if (options.exit) process.exit()
  }

  process.on('exit', exitHandler)
  process.on('SIGINT', exitHandler.bind(null, {exit: true}))
  process.on('SIGUSR1', exitHandler.bind(null, {exit: true}))
  process.on('SIGUSR2', exitHandler.bind(null, {exit: true}))
  process.on('uncaughtException', exitHandler.bind(null, {exit: true}))
}

export {startServer}