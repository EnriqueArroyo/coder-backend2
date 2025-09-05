
import cartModel from '../models/cartModel.js';

export default class CartDAO {
  findById(cartId) {
    return cartModel.findById(cartId);
  }
  findByIdPopulated(cartId) {
    return cartModel.findById(cartId).populate('products.product');
  }
  createForUser(userId) {
    return cartModel.create({ user: userId, products: [] });
  }
  async addItem(cartId, productId, quantity = 1) {
    return cartModel.updateOne(
      { _id: cartId, 'products.product': { $ne: productId } },
      { $push: { products: { product: productId, quantity } } }
    ).then(async (res) => {
      if (res.modifiedCount === 0) {
        return cartModel.updateOne(
          { _id: cartId, 'products.product': productId },
          { $inc: { 'products.$.quantity': quantity } }
        );
      }
      return res;
    });
  }
  updateItemQuantity(cartId, productId, quantity) {
    return cartModel.updateOne(
      { _id: cartId, 'products.product': productId },
      { $set: { 'products.$.quantity': quantity } }
    );
  }
  removeItem(cartId, productId) {
    return cartModel.updateOne(
      { _id: cartId },
      { $pull: { products: { product: productId } } }
    );
  }
  setItems(cartId, productsArray) {
    return cartModel.updateOne(
      { _id: cartId },
      { $set: { products: productsArray } }
    );
  }
  clear(cartId) {
    return cartModel.updateOne({ _id: cartId }, { $set: { products: [] } });
  }
}
