export default class ProductRepository {
  constructor(dao) {
    this.dao = dao;
  }
  list(filter = {}, projection = null, options = {}) {
    return this.dao.findAll(filter, projection, options);
  }
  getById(id) {
    return this.dao.findById(id);
  }
  create(data) {
    return this.dao.create(data);
  }
  update(id, data) {
    return this.dao.updateById(id, data);
  }
  delete(id) {
    return this.dao.deleteById(id);
  }
  decrementStock(id, qty) {
    return this.dao.decrementStock(id, qty);
  }
}
