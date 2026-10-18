import { Schema, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [false, 'Name is not required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,           
      lowercase: true,        
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
      match: [
        /^[a-z0-9_.]+$/,
        'Username can only contain lowercase letters, numbers, underscore and dot',
      ],
      index: true,           
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,          // doubt: queries me by default password nahi aayega
    },

    profileUrl: {
      type: String,
      default: '',            // optional field
      trim: true,
    },
  },
  {
    timestamps: true,         // createdAt + updatedAt automatically
  }
);

/* ---------- Password hashing (pre-save hook) ---------- */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
});

/* ----------  Password compare method ---------- */
userSchema.methods.comparePassword = async function (plainPassword) {
  return compare(plainPassword, this.password);
};



export default model('User', userSchema);