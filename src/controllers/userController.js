/**
 * Module for the UsersController.
 *
 * @author Farzad Fahiminia <ff222cb@student.lnu.se>
 * @version 1.0.0
 */

// import { User } from '../models/user.js'
import fetch from 'node-fetch'
import cryptoRandomString from 'crypto-random-string'

/**
 * Encapsulates a controller.
 */
export class UsersController {
  /**
   * Handle the redirect.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  login (req, res, next) {
    res.redirect(`https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.APP_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=${process.env.REQUESTED_SCOPE}`)
  }

  /**
   * Handle the callback.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async callback (req, res, next) {
    console.log('TEST CALLBACK')
    console.log(req.query.code)
    const codeVerifier = cryptoRandomString({ length: 128 })

    const body = {
      client_id: process.env.APP_ID,
      client_secret: process.env.APP_SECRET,
      code: req.query.code,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    console.log(body)

    // console.log('code ', codeVerifier)

    let accessToken = await fetch('https://gitlab.lnu.se/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    accessToken = await accessToken.json()

    console.log(accessToken)

    // res.render('./users/account')
    res.redirect('/')
  }

  // /**
  //  * Displays the login page.
  //  *
  //  * @param {object} req - Express request object.
  //  * @param {object} res - Express response object.
  //  * @param {Function} next - Express next middleware function.
  //  */
  // async index (req, res, next) {
  //   res.render('users/login')
  // }

  // /**
  //  * Displays the register page.
  //  *
  //  * @param {object} req - Express request object.
  //  * @param {object} res - Express response object.
  //  */
  // async register (req, res) {
  //   res.render('users/register')
  // }

  // /**
  //  * Creates a new user.
  //  *
  //  * @param {object} req - Express request object.
  //  * @param {object} res - Express response object.
  //  */
  // async registerUser (req, res) {
  //   console.log(req.body)
  //   try {
  //     const user = new User({
  //       username: req.body.username,
  //       password: req.body.password
  //     })

  //     await user.save()

  //     req.session.flash = { type: 'success', text: 'The user was created successfully.' }
  //     res.redirect('./register')
  //   } catch (error) {
  //     req.session.flash = { type: 'danger', text: error.message }
  //     res.redirect('./register')
  //   }
  // }

  // /**
  //  * Logs in the user.
  //  *
  //  * @param {object} req - Express request object.
  //  * @param {object} res - Express response object.
  //  * @param {Function} next - Express next middleware function.
  //  */
  // async loginUser (req, res, next) {
  //   try {
  //     const user = await User.authenticate(req.body.username, req.body.password)
  //     req.session.regenerate((error) => {
  //       if (error) {
  //         throw new Error('Failed to re-generate session.')
  //       }
  //     })

  //     req.session.username = user.username
  //     // req.session.flash = { type: 'success', text: 'You are successfully logged in!' }
  //     res.redirect('./account')
  //   } catch (error) {
  //     req.session.flash = { type: 'danger', text: error.message }
  //     res.redirect('./login')
  //   }
  // }

  // /**
  //  * Displays the users account page.
  //  *
  //  * @param {object} req - Express request object.
  //  * @param {object} res - Express response object.
  //  */
  // async account (req, res) {
  //   res.render('users/account')
  // }

  // /**
  //  * Destroys the user session and logs out.
  //  *
  //  * @param {object} req - Express request object.
  //  * @param {object} res - Express response object.
  //  */
  // async logout (req, res) {
  //   try {
  //     req.session.destroy()
  //     res.redirect('./login')
  //   } catch (error) {
  //     res.redirect('./login')
  //   }
  // }
}
