import { IResumeRepository } from "../interface/resume.repository.interface";
import { IResumeDocument, ResumeModel } from "../model/resume.model";
import { IResume } from "../types";

export class ResumeRepository implements IResumeRepository {
  async findByUserId(userId: string): Promise<IResumeDocument | null> {
    return ResumeModel.findOne({ userId });
  }

  async upsert(userId: string, data: Partial<IResume>): Promise<IResumeDocument> {
    const resume = await ResumeModel.findOneAndUpdate(
      { userId },
      { $set: { ...data, userId } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return resume!;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await ResumeModel.deleteOne({ userId });
    return result.deletedCount > 0;
  }
}
