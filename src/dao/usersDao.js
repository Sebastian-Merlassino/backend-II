import userModel from "../models/userModel.js";

export class UsersDAO {
    create(user) { return userModel.create(user); }
    findById(id) { return userModel.findById(id); }
    findByEmail(email) { return userModel.findOne({ email }); }
    updateById(id, data) { return userModel.findByIdAndUpdate(id, data, { new: true }); }
    deleteById(id) { return userModel.findByIdAndDelete(id); }
    findAll() { return userModel.find(); }
}
export default UsersDAO;
