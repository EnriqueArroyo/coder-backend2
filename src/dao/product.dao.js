
import productModel from '../models/productModel.js';

export default class ProductDAO {
  findAll(filter = {}, projection = null, options = {}) {
    return productModel.find(filter, projection, options).lean();
  }
  findById(id) {
    return productModel.findById(id);
  }
  create(data) {
    return productModel.create(data);
  }
  updateById(id, data) {
    return productModel.findByIdAndUpdate(id, data, { new: true });
  }
  deleteById(id) {
    return productModel.findByIdAndDelete(id);
  }

  async decrementStock(id, quantity) {
    return productModel.updateOne(
      { _id: id, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } }
    );
  }
}
