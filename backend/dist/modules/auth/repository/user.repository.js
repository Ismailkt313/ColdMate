"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const user_model_1 = require("../model/user.model");
class UserRepository {
    async create(userData) {
        const user = new user_model_1.UserModel(userData);
        return user.save();
    }
    async findByEmail(email) {
        return user_model_1.UserModel.findOne({ email });
    }
    async findById(id) {
        return user_model_1.UserModel.findById(id);
    }
    async update(id, updateData) {
        return user_model_1.UserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    }
}
exports.UserRepository = UserRepository;
