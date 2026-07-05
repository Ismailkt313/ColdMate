import { IResume } from "../types";

export interface IResumeService {
  uploadResume(userId: string, file: Express.Multer.File): Promise<IResume>;
  getResume(userId: string): Promise<IResume>;
  getResumeById(id: string): Promise<any>;
  replaceResume(userId: string, file: Express.Multer.File): Promise<IResume>;
  deleteResume(userId: string): Promise<void>;
}
