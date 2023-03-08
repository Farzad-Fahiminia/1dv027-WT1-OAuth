/**
 * Module for the UsersService.
 *
 * @author Farzad Fahiminia <ff222cb@student.lnu.se>
 * @version 1.0.0
 */

import { Fetch } from '../util/Fetch.js'

const fetchData = new Fetch()

/**
 * Encapsulates a service.
 */
export class UsersService {
  /**
   * Handles the callback.
   *
   * @param {object} req - Express request object.
   * @returns {object} - Returns the response object.
   */
  async callback (req) {
    const body = {
      client_id: process.env.APP_ID,
      client_secret: process.env.APP_SECRET,
      code: req.query.code,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    const response = await fetchData.fetchPost('https://gitlab.lnu.se/oauth/token', body)

    return response
  }

  /**
   * Handles the renewing of the access token.
   *
   * @param {object} req - Express request object.
   * @returns {object} - Returns the response object.
   */
  async renewAccessToken (req) {
    const body = {
      client_id: process.env.APP_ID,
      client_secret: process.env.APP_SECRET,
      refresh_token: req.session.refreshToken,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'refresh_token'
    }

    const response = await fetchData.fetchPost('https://gitlab.lnu.se/oauth/token?', body)

    return response
  }

  /**
   * Handles the viewData for profile page.
   *
   * @param {object} token - Access token.
   * @returns {object} - Returns the viewData object.
   */
  async profile (token) {
    const response = await fetchData.fetchGet('https://gitlab.lnu.se/api/v4/user', token)
    const data = await response.json()

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

    return viewData
  }

  /**
   * Handles the viewData for activities page.
   *
   * @param {object} token - Access token.
   * @returns {object} - Returns the viewData object.
   */
  async activities (token) {
    const eventUri = 'https://gitlab.lnu.se/api/v4/events'
    const activityPerPage = 60
    const pages = 2
    const activityArray = []

    for (let i = 1; i <= pages; i++) {
      const uri = `${eventUri}?per_page=${activityPerPage}&page=${i}`

      const response = await fetchData.fetchGet(uri, token)

      const data = await response.json()
      activityArray.push(...data)
    }

    const viewData = activityArray.map(activity => ({
      action_name: activity.action_name,
      created_at: activity.created_at.substring(0, 19).replace('T', ' '),
      target_title: activity.target_title,
      target_type: activity.target_type
    }))

    return viewData
  }

  /**
   * Handles the data for groupProjects page.
   *
   * @param {object} token - Access token.
   * @returns {object} - Returns the data object.
   */
  async groupProjects (token) {
    const endpoint = 'https://gitlab.lnu.se/api/graphql'

    const data = await fetchData.fetchGraphql(endpoint, token)

    return data
  }

  /**
   * Revokes the token and logs out.
   *
   * @param {object} accessToken - Access token.
   * @returns {object} - Returns the response object.
   */
  async logout (accessToken) {
    const body = {
      client_id: process.env.APP_ID,
      client_secret: process.env.APP_SECRET,
      token: accessToken
    }

    const response = await fetchData.fetchPost('https://gitlab.lnu.se/oauth/revoke', body)

    return response
  }
}
