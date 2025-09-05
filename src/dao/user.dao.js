import userModel from "../models/userModel.js";

export default class UserDAO {
  findAll(filter = {}, projection = null, options = {}) {
    return userModel.find(filter, projection, options).lean();
  }
  findById(id) {
    return userModel.findById(id);
  }
  findByEmail(email) {
    return userModel.findOne({ email });
  }
  create(data) {
    return userModel.create(data);
  }
  updateById(id, data) {
    return userModel.findByIdAndUpdate(id, data, { new: true });
  }
  deleteById(id) {
    return userModel.findByIdAndDelete(id);
  }
}
