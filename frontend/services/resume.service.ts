import api from "../lib/axios";
import { IResume } from "../types/resume";
import { StandardResponse } from "../types/auth";

export class ResumeService {
  static async upload(file: File): Promise<StandardResponse<{ resume: IResume }>> {
    const formData = new FormData();
    formData.append("resume", file);
    const res = await api.post<StandardResponse<{ resume: IResume }>>("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  static async get(): Promise<StandardResponse<{ resume: IResume }>> {
    const res = await api.get<StandardResponse<{ resume: IResume }>>("/resume");
    return res.data;
  }

  static async replace(file: File): Promise<StandardResponse<{ resume: IResume }>> {
    const formData = new FormData();
    formData.append("resume", file);
    const res = await api.patch<StandardResponse<{ resume: IResume }>>("/resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  static async remove(): Promise<StandardResponse<any>> {
    const res = await api.delete<StandardResponse<any>>("/resume");
    return res.data;
  }
}
