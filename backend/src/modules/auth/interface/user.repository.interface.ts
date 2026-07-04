import { IUserDocument } from "../model/user.model";
import { IUser } from "../types";

export interface IUserRepository {
  create(userData: Partial<IUser>): Promise<IUserDocument>;
  findByEmail(email: string): Promise<IUserDocument | null>;
  findById(id: string): Promise<IUserDocument | null>;
  update(id: string, updateData: Partial<IUser>): Promise<IUserDocument | null>;
}
