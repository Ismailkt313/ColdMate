import { IResumeDocument } from "../model/resume.model";
import { IResume } from "../types";

export interface IResumeRepository {
  findByUserId(userId: string): Promise<IResumeDocument | null>;
  findById(id: string): Promise<IResumeDocument | null>;
  upsert(userId: string, data: Partial<IResume>): Promise<IResumeDocument>;
  deleteByUserId(userId: string): Promise<boolean>;
}
