export default class UserRepository {
  constructor(dao) {
    this.dao = dao;
  }
  list(filter = {}, projection = null, options = {}) {
    return this.dao.findAll(filter, projection, options);
  }
  getById(id) {
    return this.dao.findById(id);
  }
  getByEmail(email) {
    return this.dao.findByEmail(email);
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
}
