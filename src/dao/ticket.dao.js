
import ticketModel from '../models/ticketModel.js';

export default class TicketDAO {
  create(data) {
    return ticketModel.create(data);
  }
  findById(id) {
    return ticketModel.findById(id).lean();
  }
  findByCode(code) {
    return ticketModel.findOne({ code }).lean();
  }
}
