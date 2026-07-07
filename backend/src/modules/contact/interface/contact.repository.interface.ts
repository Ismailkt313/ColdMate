import { IContactDocument } from "../model/contact.model";

export interface IContactRepository {
  create(userId: string, contactData: any): Promise<IContactDocument>;
  findById(id: string, userId: string): Promise<IContactDocument | null>;
  update(id: string, userId: string, updateData: any): Promise<IContactDocument | null>;
  delete(id: string, userId: string): Promise<boolean>;
  findByCompany(userId: string, companyId: string): Promise<IContactDocument[]>;
  count(userId: string, filter: any): Promise<number>;
  findDuplicates(
    userId: string,
    companyId: string,
    check: { email?: string; linkedin?: string; phone?: string; fullName?: string }
  ): Promise<IContactDocument[]>;
}
