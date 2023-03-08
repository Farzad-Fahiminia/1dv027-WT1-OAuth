/**
 * Module for the FetchService.
 *
 * @author Farzad Fahiminia <ff222cb@student.lnu.se>
 * @version 1.0.0
 */

import fetch from 'node-fetch'
import { GraphQLClient, gql } from 'graphql-request'

/**
 * Encapsulates a util.
 */
export class Fetch {
  /**
   * Fetches GET.
   *
   * @param {string} uri - URI to fetch from.
   * @param {string} token - Authorization token.
   * @returns {object} - Returning JSON data.
   */
  async fetchGet (uri, token) {
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    })

    return response
  }

  /**
   * Fetches POST.
   *
   * @param {string} uri - URI to fetch from.
   * @param {object} body - Object with data.
   * @returns {object} - Returning JSON data.
   */
  async fetchPost (uri, body) {
    const response = await fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    return response
  }

  /**
   * Fetches GraphQL.
   *
   * @param {string} endpoint - URI to fetch from.
   * @param {string} token - Authorization token.
   * @returns {object} - Returning JSON data.
   */
  async fetchGraphql (endpoint, token) {
    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        authorization: 'Bearer ' + token
      }
    })

    const query = gql`
    query {
      currentUser {
        groups(first: 6) {
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
              projects(first: 10, includeSubgroups: true) {
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

    const response = await graphQLClient.request(query)

    return response
  }
}
