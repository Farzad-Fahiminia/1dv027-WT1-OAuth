/**
 * Module for the TasksController.
 *
 * @author Farzad Fahiminia <ff222cb@student.lnu.se>
 * @version 1.0.0
 */

import createError from 'http-errors'
import { TasksService } from '../services/TasksService.js'

/**
 * Encapsulates a controller.
 */
export class TasksController {
  /**
   * The service.
   *
   * @type {TasksService}
   */
  #service

  /**
   * Initializes a new instance.
   *
   * @param {TasksService} service - A service instantiated from a class with the same capabilities as TasksService.
   */
  constructor (service = new TasksService()) {
    this.#service = service
  }

  /**
   * Provide req.task to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the task to load.
   */
  async loadTask (req, res, next, id) {
    try {
      // Get the task.
      const task = await this.#service.getById(id)

      // If no task found send a 404 (Not Found).
      if (!task) {
        next(createError(404, 'The requested resource was not found.'))
        return
      }

      // Provide the task to req.
      req.task = task

      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing a task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async find (req, res, next) {
    res.json(req.task)
  }

  /**
   * Sends a JSON response containing all tasks.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findAll (req, res, next) {
    try {
      const tasks = await this.#service.get()

      res.json(tasks)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create (req, res, next) {
    try {
      const task = await this.#service.insert({
        description: req.body.description,
        done: req.body.done
      })

      const location = new URL(
        `${req.protocol}://${req.get('host')}${req.baseUrl}/${task._id}`
      )

      res
        .location(location.href)
        .status(201)
        .json(task)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Updates a specific task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async update (req, res, next) {
    try {
      const { description, done } = req.body

      if (description === undefined || done === undefined) {
        next(createError(400, 'All required parameters not supplied.'))
        return
      }

      await this.#service.update(req.params.id, { description, done })

      res
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes the specified task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      await this.#service.delete(req.params.id)

      res
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }
}
