/**
 * Module for bootstrapping.
 *
 * @author Farzad Fahiminia <ff222cb@student.lnu.se>
 * @version 1.0.0
 */

import { IoCContainer } from '../util/IoCContainer.js'
import { HomeController } from '../controllers/homeController.js'
import { UsersController } from '../controllers/userController.js'

const iocContainer = new IoCContainer()

iocContainer.register('HomeController', HomeController, {
  singleton: true
})

iocContainer.register('UsersController', UsersController, {
  singleton: true
})

export const container = Object.freeze(iocContainer)
