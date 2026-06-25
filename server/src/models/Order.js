import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, title: String, image: String, price: Number, quantity: Number }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['placed', 'processing', 'shipped', 'delivered'], default: 'placed' }
}, { timestamps: true });
export default mongoose.model('Order', orderSchema);
