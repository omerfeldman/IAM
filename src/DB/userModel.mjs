import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  organization_id: {
    type: String,
    required: true,
    trim: true, 
  },
  mfaEnable: {
    type: Boolean,
    default: false,
  },
  secret: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model('User', userSchema);