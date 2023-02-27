/**
 * Mongoose model User.
 *
 * @author Farzad Fahiminia <ff222cb@student.lnu.se>
 * @version 1.0.0
 */

import mongoose from 'mongoose'

// Create a schema.
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    minlength: [8, 'The password must be of minimum length 8 characters.'],
    maxlength: [500, 'The password must be of maximum length 500 characters.'],
    required: true
  }
}, {
  timestamps: true
})

// Create a model using the schema.
export const User = mongoose.model('User', userSchema)
