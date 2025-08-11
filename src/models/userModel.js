import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userCollection = 'users';

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name:  { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    age:        { type: Number, required: true, min: 0 },
    password:   { type: String, required: true },
    cart:       { type: mongoose.Schema.Types.ObjectId, ref: 'Carts', default: null },
    role:       { type: String, enum: ['user', 'admin', 'user_premium'], default: 'user' }
  },
  { timestamps: true }
);


userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  const saltRounds = 10;
  this.password = bcrypt.hashSync(this.password, saltRounds);
  next();
});


userSchema.methods.isValidPassword = function(plain) {
  return bcrypt.compareSync(plain, this.password);
};

const userModel = mongoose.model(userCollection, userSchema);
export default userModel;
