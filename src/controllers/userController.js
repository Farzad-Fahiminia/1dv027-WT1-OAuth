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
   * Creates an instance of UsersController.
   *
   * @memberof UsersController
   */
  constructor () {
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
    res.redirect(`https://gitlab.lnu.se/oauth/authorize?client_id=${process.env.APP_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=${process.env.REQUESTED_SCOPE}&state=${this.state}`)
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
    console.log('REQ STATE ', req.query.state)

    if (req.query.state !== this.state) {
      req.session.destroy()
      res.redirect('../')
    }

    const body = {
      client_id: process.env.APP_ID,
      client_secret: process.env.APP_SECRET,
      code: req.query.code,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    const response = await fetch('https://gitlab.lnu.se/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const accessToken = await response.json()

    if (response.status !== 200) {
      req.session.destroy()
      res.redirect('../')
    }

    req.session.accessToken = accessToken
    req.session.loggedIn = true
    res.redirect('./profile')
  }

  /**
   * Handle the redirect to profile page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async profile (req, res, next) {
    console.log('REQ ', req.session.accessToken)
    const token = req.session.accessToken?.access_token
    console.log('TOKEN ', token)
    // console.log('ACCESS ', req.session.accessToken.access_token)
    try {
      let data = await fetch('https://gitlab.lnu.se/api/v4/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      })
      data = await data.json()

      console.log('DATA ', data)

      const viewData = {
        id: data.id,
        username: data.username,
        name: data.name,
        state: data.state,
        avatar: data.avatar_url,
        bio: data.bio,
        last_activity_on: data.last_activity_on,
        email: data.email
      }

      // res.render('issues/index', { viewData })

      res.render('./users/profile', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Handle the redirect to activities page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async activities (req, res, next) {
    const token = req.session.accessToken?.access_token

    const eventUri = 'https://gitlab.lnu.se/api/v4/events'
    const activityPerPage = 60
    const pages = 2
    const activityArray = []

    try {
      for (let i = 1; i <= pages; i++) {
        const uri = `${eventUri}?per_page=${activityPerPage}&page=${i}`

        let data = await fetch(`${uri}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          }
        })
        data = await data.json()
        activityArray.push(...data)
      }

      const viewData = activityArray.map(activity => ({
        action_name: activity.action_name,
        created_at: activity.created_at,
        target_title: activity.target_title,
        target_type: activity.target_type
      }))

      console.log('VIEW ', viewData)

      res.render('./users/activities', { viewData })
      // res.render('./users/activities')
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
    console.log('LOGOUT ', req.session.accessToken)
    const accessToken = req.session.accessToken?.access_token
    console.log('LOGOUT ', accessToken)
    try {
      const body = {
        client_id: process.env.APP_ID,
        client_secret: process.env.APP_SECRET,
        token: accessToken
      }

      const response = await fetch('https://gitlab.lnu.se/oauth/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      console.log(response)

      if (response.status === 200) {
        req.session.destroy()
      }

      res.redirect('/')
    } catch (error) {
      res.redirect('/')
    }
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
