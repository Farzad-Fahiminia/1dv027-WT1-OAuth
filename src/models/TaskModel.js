/**
 * Mongoose model Task.
 *
 * @author Farzad Fahiminia <ff222cb@student.lnu.se>
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

// Create a schema.
const schema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  done: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true,
  toObject: {
    virtuals: true, // ensure virtual fields are serialized
    /**
     * Performs a transformation of the resulting object to remove sensitive information.
     *
     * @param {object} doc - The mongoose document which is being converted.
     * @param {object} ret - The plain object representation which has been converted.
     */
    transform: function (doc, ret) {
      delete ret.__v
      delete ret._id
    }
  }
})

schema.virtual('id').get(function () {
  return this._id.toHexString()
})

schema.plugin(mongooseLeanVirtuals)

schema.post(['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete'], function (res) {
  if (!res || !this.mongooseOptions().lean) {
    return
  }

  /**
   * Performs a transformation of the resulting lean object.
   *
   * @param {object} obj - The object to transform.
   */
  const transformLeanObject = (obj) => {
    delete obj._id
    delete obj.__v
  }

  if (Array.isArray(res)) {
    res.forEach(transformLeanObject)
  } else {
    transformLeanObject(res)
  }
})

// Create a model using the schema.
export const TaskModel = mongoose.model('Task', schema)
