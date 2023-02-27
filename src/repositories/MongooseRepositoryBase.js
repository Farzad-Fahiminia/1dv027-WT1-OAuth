/**
 * Module for MongooseRepositoryBase.
 *
 * @author Farzad Fahiminia <ff222cb@student.lnu.se>
 * @version 1.0.0
 */

import mongoose from 'mongoose'

/**
 * Encapsulates a Mongoose repository base.
 */
export class MongooseRepositoryBase {
  /**
   * The Mongoose model.
   *
   * @type {mongoose.Model}
   */
  #model

  /**
   * Initializes a new instance.
   *
   * @param {mongoose.Model} model - A Mongoose model.
   */
  constructor (model) {
    this.#model = model
  }

  /**
   * Gets documents.
   *
   * @param {object} filter - ...
   * @param {object|string|string[]} [projection] - Fields to return.
   * @param {object} [options] - See Query.prototype.setOptions().
   * @example
   * // Passing options
   * await myModelRepository.get({ name: /john/i }, null, { skip: 10 }).exec()
   * @returns {Promise<object[]>} Promise resolved with the found documents as a plain JavaScript objects.
   */
  async get (filter, projection = null, options = null) {
    return this.#model
      .find(filter, projection, options)
      .lean({ virtuals: !!this.#model.schema.virtuals })
      .exec()
  }

  /**
   * Gets a single document by its id.
   *
   * @param {object|number|string} id - Value of the document id to get.
   * @param {object|string|string[]} [projection] - Fields to return.
   * @param {object} [options] - See Query.prototype.setOptions().
   * @returns {Promise<object>} Promise resolved with the found document as a plain JavaScript object.
   */
  async getById (id, projection, options) {
    return this.#model
      .findById(id, projection, options)
      .lean({ virtuals: !!this.#model.schema.virtuals })
      .exec()
  }

  /**
   * Gets a single document by the conditions.
   *
   * @param {object} conditions - Value of the document conditions to get.
   * @param {object|string|string[]} [projection] - Fields to return.
   * @param {object} [options] - See Query.prototype.setOptions().
   * @returns {Promise<object>} Promise resolved with the found document as a plain JavaScript object.
   */
  async getOne (conditions, projection, options) {
    return this.#model
      .findOne(conditions, projection, options)
      .lean({ virtuals: !!this.#model.schema.virtuals })
      .exec()
  }

  /**
   * Inserts a document into the database.
   *
   * @param {object} doc - Document to insert.
   * @returns {Promise<object>} Promise resolved with the new document as a plain JavaScript object.
   */
  async insert (doc) {
    const createdDocument = await this.#model.create(doc)
    return createdDocument.toObject()
  }

  /**
   * Deletes a document.
   *
   * @param {object|number|string} id - Value of the documents id to delete.
   * @param {object} [options] - See Query.prototype.setOptions().
   * @returns {Promise<object>} Promise resolved with the removed document as a plain JavaScript object.
   */
  async delete (id, options) {
    return this.#model
      .findByIdAndDelete(id, options)
      .lean({ virtuals: !!this.#model.schema.virtuals })
      .exec()
  }

  /**
   * Updates a document according to the new data.
   *
   * @param {object|number|string} id - Value of the documents id to update.
   * @param {object} newData - ...
   * @param {object} [options] - See Query.prototype.setOptions().
   * @returns {Promise<object>} Promise resolved with the updated document as a plain JavaScript object.
   */
  async update (id, newData, options) {
    // // Contains newData required properties?
    // const keys = Object.keys(newData)
    // if (!this.#model.requiredPaths().every(path => keys.includes(path))) {
    //   throw new Error('Properties for all required paths not supplied.')
    // }

    return this.#model
      .findByIdAndUpdate(id, newData, { new: true, ...options })
      .lean({ virtuals: !!this.#model.schema.virtuals })
      .exec()
  }
}
