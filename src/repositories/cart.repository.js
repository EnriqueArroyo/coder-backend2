export default class CartRepository {
  constructor(dao) {
    this.dao = dao;
  }
  getById(id) {
    return this.dao.findById(id);
  }
  getByIdPopulated(id) {
    return this.dao.findByIdPopulated(id);
  }
  createForUser(userId) {
    return this.dao.createForUser(userId);
  }
  addItem(cartId, productId, qty) {
    return this.dao.addItem(cartId, productId, qty);
  }
  updateItemQuantity(cartId, productId, qty) {
    return this.dao.updateItemQuantity(cartId, productId, qty);
  }
  removeItem(cartId, productId) {
    return this.dao.removeItem(cartId, productId);
  }
  setItems(cartId, productsArray) {
    return this.dao.setItems(cartId, productsArray);
  }
  clear(cartId) {
    return this.dao.clear(cartId);
  }
}
