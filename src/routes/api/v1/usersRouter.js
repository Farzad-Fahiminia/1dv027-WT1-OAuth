/**
 * Users routes.
 *
 * @author Farzad Fahiminia <ff222cb@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import { UsersController } from '../../../controllers/UsersController.js'

export const router = express.Router()

const usersController = new UsersController()

/**
 * Resolves a UsersController object from the IoC container.
 *
 * @param {object} req - Express request object.
 * @returns {object} An object that can act as a TasksController object.
 */
const resolveUsersController = (req) => req.app.get('container').resolve('UsersController')

// Map HTTP verbs and route paths to controller action methods.
router.get('/login',
  (req, res, next) => resolveUsersController(req).login(req, res, next)
)

router.get('/callback',
  (req, res, next) => resolveUsersController(req).callback(req, res, next)
)

router.get('/profile',
  (req, res, next) => usersController.renewAccessToken(req, res, next),
  (req, res, next) => resolveUsersController(req).profile(req, res, next)
)

router.get('/activities',
  (req, res, next) => usersController.renewAccessToken(req, res, next),
  (req, res, next) => resolveUsersController(req).activities(req, res, next)
)

router.get('/group-projects',
  (req, res, next) => usersController.renewAccessToken(req, res, next),
  (req, res, next) => resolveUsersController(req).groupProjects(req, res, next)
)

router.get('/logout',
  (req, res, next) => resolveUsersController(req).logout(req, res, next)
)
