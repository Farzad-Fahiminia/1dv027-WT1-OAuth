/**
 * The starting point of the application.
 *
 * @author Farzad Fahiminia <ff222cb@student.lnu.se>
 * @version 1.0.0
 */

import { container } from './config/bootstrap.js'

import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import helmet from 'helmet'
import logger from 'morgan'
import createError from 'http-errors'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { router } from './routes/router.js'
import { connectDB } from './config/mongoose.js'

try {
  await connectDB(container.resolve('ConnectionString'))

  const app = express()

  app.set('container', container)

  // Get the directory name of this module's path.
  const directoryFullName = dirname(fileURLToPath(import.meta.url))
  console.log('TEST ', directoryFullName)

  // Set the base URL to use for all relative URLs in a document.
  const baseURL = process.env.BASE_URL || '/'

  // Set various HTTP headers to make the application little more secure (https://www.npmjs.com/package/helmet).
  app.use(helmet())

  // Set up a morgan logger using the dev format for log entries.
  app.use(logger('dev'))

  // Parse requests of the content type application/json.
  app.use(express.json())

  // View engine setup.
  app.set('view engine', 'ejs')
  app.set('views', join(directoryFullName, 'views'))
  app.use(expressLayouts)
  app.set('layout', join(directoryFullName, 'views', 'layouts', 'default'))

  // Parse requests of the content type application/x-www-form-urlencoded.
  // Populates the request object with a body object (req.body).
  app.use(express.urlencoded({ extended: false }))

  // Serve static files.
  app.use(express.static(join(directoryFullName, '..', 'public')))

  // Middleware to be executed before the routes.
  app.use((req, res, next) => {
    // Pass the base URL to the views.
    res.locals.baseURL = baseURL

    next()
  })

  // Register routes.
  app.use('/', router)

  // Error handler.
  app.use(function (err, req, res, next) {
    if (!err.status) {
      const cause = err
      err = createError(500)
      err.cause = cause
    }

    if (req.app.get('env') !== 'development') {
      return res
        .status(err.status)
        .json({
          status: err.status,
          message: err.message
        })
    }

    // Development only!
    // Only providing detailed error in development.
    return res
      .status(err.status)
      .json({
        status: err.status,
        message: err.message,
        cause: err.cause ? JSON.stringify(err.cause, Object.getOwnPropertyNames(err.cause)) : undefined,
        stack: err.stack
      })
  })

  // Starts the HTTP server listening for connections.
  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
