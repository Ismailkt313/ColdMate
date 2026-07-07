import { ICompanyDocument } from "../model/company.model";

export interface ICompanyRepository {
  create(userId: string, companyData: any): Promise<ICompanyDocument>;
  findById(id: string, userId: string): Promise<ICompanyDocument | null>;
  update(id: string, userId: string, updateData: any): Promise<ICompanyDocument | null>;
  delete(id: string, userId: string): Promise<boolean>;
  findWithPagination(
    userId: string,
    filter: any,
    page: number,
    limit: number
  ): Promise<ICompanyDocument[]>;
  count(userId: string, filter: any): Promise<number>;
}
