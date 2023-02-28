/**
 * Snippets routes.
 *
 * @author Farzad Fahiminia <ff222cb@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import { UsersController } from '../../../controllers/userController.js'

export const router = express.Router()

const controller = new UsersController()

/**
 * Resolves a TasksController object from the IoC container.
 *
 * @param {object} req - Express request object.
 * @returns {object} An object that can act as a TasksController object.
 */
// const resolveUsersController = (req) => req.app.get('container').resolve('UsersController')

router.get('/login', (req, res, next) => controller.login(req, res, next))
router.get('/callback', (req, res, next) => controller.callback(req, res, next))

// Map HTTP verbs and route paths to controller action methods.
// router.get('/login', (req, res, next) => controller.index(req, res, next))

// router.get('/register', (req, res, next) => controller.register(req, res, next))
// router.post('/register', (req, res, next) => controller.registerUser(req, res, next))

// router.get('/login', (req, res, next) => controller.login(req, res, next))
// router.post('/login', (req, res, next) => controller.loginUser(req, res, next))

// router.get('/account', (req, res, next) => controller.account(req, res, next))

// router.get('/logout', (req, res, next) => controller.logout(req, res, next))
