import { IContactDocument } from "../model/contact.model";
import { IContact } from "../types";

export interface IContactDiscoveryService {
  discover(companyName: string, website?: string, aiResearchContext?: any, mode?: "standard" | "deep"): Promise<IContact[]>;
}

export interface IContactValidationService {
  validateContact(contact: Partial<IContact>): Promise<{ isValid: boolean; confidence: number; reason: string }>;
}

export interface IContactService {
  discoverContacts(userId: string, companyId: string, mode?: "standard" | "deep"): Promise<IContact[]>;
  createContact(userId: string, contactData: any): Promise<IContactDocument>;
  createContactsBatch(userId: string, companyId: string, contacts: any[]): Promise<IContactDocument[]>;
  getContactsByCompany(userId: string, companyId: string): Promise<IContactDocument[]>;
  updateContact(id: string, userId: string, updateData: any): Promise<IContactDocument>;
  deleteContact(id: string, userId: string): Promise<boolean>;
}
