/**
 * Module for the TasksService.
 *
 * @author Farzad Fahiminia <ff222cb@student.lnu.se>
 * @version 1.0.0
 */

import { MongooseServiceBase } from './MongooseServiceBase.js'
import { TaskRepository } from '../repositories/TaskRepository.js'

/**
 * Encapsulates a task service.
 */
export class TasksService extends MongooseServiceBase {
  /**
   * Initializes a new instance.
   *
   * @param {TaskRepository} [repository=new TaskRepository()] - A repository instantiated from a class with the same capabilities as TaskRepository.
   */
  constructor (repository = new TaskRepository()) {
    super(repository)
  }
}
