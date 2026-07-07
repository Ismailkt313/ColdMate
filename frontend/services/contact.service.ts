import api from "../lib/axios";
import { StandardResponse } from "../types/auth";
import { IContact } from "../types/contact";

export class ContactService {
  static async discoverContacts(companyId: string, mode?: "standard" | "deep"): Promise<StandardResponse<IContact[]>> {
    const res = await api.post<StandardResponse<IContact[]>>("/contact/discover", { companyId, mode });
    return res.data;
  }

  static async saveBatchContacts(companyId: string, contacts: Partial<IContact>[]): Promise<StandardResponse<IContact[]>> {
    const res = await api.post<StandardResponse<IContact[]>>("/contact/batch", { companyId, contacts });
    return res.data;
  }

  static async createContact(contact: Partial<IContact>): Promise<StandardResponse<IContact>> {
    const res = await api.post<StandardResponse<IContact>>("/contact", contact);
    return res.data;
  }

  static async getContacts(companyId: string): Promise<StandardResponse<IContact[]>> {
    const res = await api.get<StandardResponse<IContact[]>>(`/contact/company/${companyId}`);
    return res.data;
  }

  static async updateContact(id: string, updates: Partial<IContact>): Promise<StandardResponse<IContact>> {
    const res = await api.patch<StandardResponse<IContact>>(`/contact/${id}`, updates);
    return res.data;
  }

  static async deleteContact(id: string): Promise<StandardResponse<null>> {
    const res = await api.delete<StandardResponse<null>>(`/contact/${id}`);
    return res.data;
  }
}
