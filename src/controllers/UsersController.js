/**
 * Module for the UsersController.
 *
 * @author Farzad Fahiminia <ff222cb@student.lnu.se>
 * @version 1.0.0
 */

import cryptoRandomString from 'crypto-random-string'
import { UsersService } from '../services/UsersService.js'

/**
 * Encapsulates a controller.
 */
export class UsersController {
  /**
   * The service.
   *
   * @type {UsersService}
   */
  #service

  /**
   * Initializes a new instance.
   *
   * @param {UsersService} service - A service instantiated from a class with the same capabilities as UsersService.
   */
  constructor (service = new UsersService()) {
    this.#service = service
    this.state = cryptoRandomString({ length: 128 })
  }

  /**
   * Handle the redirect.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  login (req, res, next) {
    try {
      res.redirect(`https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.APP_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=${process.env.REQUESTED_SCOPE}&state=${this.state}`)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Handles the callback.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async callback (req, res, next) {
    try {
      if (req.query.state !== this.state) {
        req.session.destroy()
        res.redirect('../')
      }

      const response = await this.#service.callback(req)
      const data = await response.json()

      if (response.status !== 200) {
        req.session.destroy()
        res.redirect('../')
      }

      req.session.accessToken = data.access_token
      req.session.refreshToken = data.refresh_token
      req.session.loggedIn = true

      res.redirect('./profile')
    } catch (error) {
      next(error)
    }
  }

  /**
   * Handles the renewing of the access token.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async renewAccessToken (req, res, next) {
    try {
      if (!req.session.loggedIn) {
        req.session.destroy()
        const err = new Error('Forbidden')
        err.status = 403
        next(err)
      }

      const response = await this.#service.renewAccessToken(req)
      const data = await response.json()

      req.session.accessToken = data.access_token
      req.session.refreshToken = data.refresh_token
      req.session.loggedIn = true

      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Handles the redirect to profile page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async profile (req, res, next) {
    try {
      const token = req.session?.accessToken
      const viewData = await this.#service.profile(token)

      res.render('./users/profile', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Handles the redirect to activities page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async activities (req, res, next) {
    try {
      const token = req.session?.accessToken
      const viewData = await this.#service.activities(token)

      res.render('./users/activities', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Handles the redirect to activities page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async groupProjects (req, res, next) {
    try {
      const token = req.session?.accessToken
      const data = await this.#service.groupProjects(token)

      res.render('./users/group-projects', { data })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Destroys the user session and logs out.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async logout (req, res) {
    try {
      const accessToken = req.session?.accessToken
      const response = await this.#service.logout(accessToken)

      if (response.status === 200) {
        req.session.destroy()
      }

      res.redirect('/')
    } catch (error) {
      res.redirect('/')
    }
  }
}
