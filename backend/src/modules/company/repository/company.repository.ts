import { ICompanyRepository } from "../interface/company.repository.interface";
import { CompanyModel, ICompanyDocument } from "../model/company.model";
import { Types } from "mongoose";

export class CompanyRepository implements ICompanyRepository {
  async create(userId: string, companyData: any): Promise<ICompanyDocument> {
    const company = new CompanyModel({
      ...companyData,
      userId: new Types.ObjectId(userId),
    });
    return company.save();
  }

  async findById(id: string, userId: string): Promise<ICompanyDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return CompanyModel.findOne({ _id: id, userId });
  }

  async update(id: string, userId: string, updateData: any): Promise<ICompanyDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return CompanyModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await CompanyModel.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  async findWithPagination(
    userId: string,
    filter: any,
    page: number,
    limit: number
  ): Promise<ICompanyDocument[]> {
    const skip = (page - 1) * limit;
    return CompanyModel.find({ ...filter, userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async count(userId: string, filter: any): Promise<number> {
    return CompanyModel.countDocuments({ ...filter, userId });
  }
}
