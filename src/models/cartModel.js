import mongoose from 'mongoose';

const cartsCollection = 'Carts';
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  products: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
    quantity: { type: Number, required: true, min: 1 }
  }]
}, { timestamps: true });

export default mongoose.model(cartsCollection, cartSchema);
