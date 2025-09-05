import mongoose from 'mongoose';

const productsCollection = 'Products';
const productSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  description:{ type: String, default: '' },
  code:       { type: String, unique: true, sparse: true },
  price:      { type: Number, required: true, min: 0 },
  stock:      { type: Number, required: true, min: 0 },
  category:   { type: String, default: 'general' }
}, { timestamps: true });

export default mongoose.model(productsCollection, productSchema);
