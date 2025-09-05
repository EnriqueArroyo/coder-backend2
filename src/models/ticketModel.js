import mongoose from 'mongoose';

const ticketsCollection = 'Tickets';
const ticketSchema = new mongoose.Schema({
  code:              { type: String, unique: true, required: true },
  purchase_datetime: { type: Date, default: Date.now },
  amount:            { type: Number, required: true },
  purchaser:         { type: String, required: true }, // email del comprador
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
    quantity: Number,
    price:    Number
  }],
  status: { type: String, enum: ['completed', 'partial'], default: 'completed' }
}, { timestamps: true });

export default mongoose.model(ticketsCollection, ticketSchema);
