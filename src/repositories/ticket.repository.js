export default class TicketRepository {
  constructor(dao) {
    this.dao = dao;
  }
  create(data) {
    return this.dao.create(data);
  }
  getById(id) {
    return this.dao.findById(id);
  }
  getByCode(code) {
    return this.dao.findByCode(code);
  }
}
