import { IContactRepository } from "../interface/contact.repository.interface";
import { ContactModel, IContactDocument } from "../model/contact.model";
import { Types } from "mongoose";

export class ContactRepository implements IContactRepository {
  async create(userId: string, contactData: any): Promise<IContactDocument> {
    const contact = new ContactModel({
      ...contactData,
      userId: new Types.ObjectId(userId),
      companyId: new Types.ObjectId(contactData.companyId),
    });
    return contact.save();
  }

  async findById(id: string, userId: string): Promise<IContactDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return ContactModel.findOne({ _id: id, userId });
  }

  async update(id: string, userId: string, updateData: any): Promise<IContactDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return ContactModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await ContactModel.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  async findByCompany(userId: string, companyId: string): Promise<IContactDocument[]> {
    if (!Types.ObjectId.isValid(companyId)) return [];
    return ContactModel.find({
      userId: new Types.ObjectId(userId),
      companyId: new Types.ObjectId(companyId),
    }).sort({ isPreferred: -1, confidenceScore: -1, createdAt: -1 });
  }

  async count(userId: string, filter: any): Promise<number> {
    return ContactModel.countDocuments({ ...filter, userId: new Types.ObjectId(userId) });
  }

  async findDuplicates(
    userId: string,
    companyId: string,
    check: { email?: string; linkedin?: string; phone?: string; fullName?: string }
  ): Promise<IContactDocument[]> {
    const conditions: any[] = [];
    const uid = new Types.ObjectId(userId);
    const cid = new Types.ObjectId(companyId);

    if (check.email && check.email.trim().length > 0) {
      conditions.push({ email: check.email.trim() });
    }
    if (check.linkedin && check.linkedin.trim().length > 0) {
      conditions.push({ linkedin: check.linkedin.trim() });
    }
    if (check.phone && check.phone.trim().length > 0) {
      conditions.push({ phone: check.phone.trim() });
    }
    if (check.fullName && check.fullName.trim().length > 0) {
      conditions.push({
        companyId: cid,
        fullName: { $regex: new RegExp(`^${check.fullName.trim()}$`, "i") },
      });
    }

    if (conditions.length === 0) return [];

    return ContactModel.find({
      userId: uid,
      $or: conditions,
    });
  }
}
