import { IUserRepository } from "../interface/user.repository.interface";
import { UserModel, IUserDocument } from "../model/user.model";
import { IUser } from "../types";

export class UserRepository implements IUserRepository {
  async create(userData: Partial<IUser>): Promise<IUserDocument> {
    const user = new UserModel(userData);
    return user.save();
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email });
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return UserModel.findById(id);
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }
}
