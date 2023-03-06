/**
 * Module for the UsersController.
 *
 * @author Farzad Fahiminia <ff222cb@student.lnu.se>
 * @version 1.0.0
 */

import fetch from 'node-fetch'
import cryptoRandomString from 'crypto-random-string'
import { GraphQLClient, gql } from 'graphql-request'

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

    // const response = await this.fetch('https://gitlab.lnu.se/oauth/token', 'POST', body)

    const accessToken = await response.json()

    console.log(accessToken)

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
    const token = req.session.accessToken?.access_token

    try {
      let data = await fetch('https://gitlab.lnu.se/api/v4/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      })

      // const response = await this.fetch('https://gitlab.lnu.se/api/v4/user', 'GET', body)
      data = await data.json()

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
        created_at: activity.created_at.substring(0, 19).replace('T', ' '),
        target_title: activity.target_title,
        target_type: activity.target_type
      }))

      res.render('./users/activities', { viewData })
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
  async groupProjects (req, res, next) {
    const token = req.session.accessToken?.access_token

    try {
      const endpoint = 'https://gitlab.lnu.se/api/graphql'

      const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
          authorization: 'Bearer ' + token
        }
      })

      const query = gql`
      query {
        currentUser {
          groups {
            pageInfo {
              endCursor
              hasNextPage
            }
            nodes {
              id
              name
              fullPath
              avatarUrl
              path
                projects(includeSubgroups: true) {
                  nodes {
                      id
                      name
                      fullPath
                      avatarUrl
                      path
                      repository {tree {lastCommit {authoredDate author {name username avatarUrl}}}}
                    projectMembers {       
                      nodes {
                        createdBy {
                          name
                          avatarUrl
                          username
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `

      const data = await graphQLClient.request(query)
      // console.log(JSON.stringify(data, undefined, 2))

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
    const accessToken = req.session.accessToken?.access_token
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
  //  * Fetch.
  //  *
  //  * @param {string} uri - URI to fetch from.
  //  * @param {string} method - GET, POST etc.
  //  * @param {object} body - Body to send with fetch.
  //  * @returns {object} - Returning JSON data.
  //  * @memberof UsersController
  //  */
  // async fetch (uri, method, body) {
  //   const response = await fetch(uri, {
  //     method: `${method}`,
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify(body)
  //   })

  //   return response
  // }
}
