import { IContactService, IContactDiscoveryService, IContactValidationService } from "../interface/contact.service.interface";
import { IContactRepository } from "../interface/contact.repository.interface";
import { IContactDocument } from "../model/contact.model";
import { IContact } from "../types";
import { NotFoundError, BadRequestError } from "../../../errors";
import { CompanyRepository } from "../../company/repository/company.repository";

export class ContactService implements IContactService {
  private companyRepository = new CompanyRepository();

  constructor(
    private contactRepository: IContactRepository,
    private contactDiscoveryService: IContactDiscoveryService,
    private contactValidationService: IContactValidationService
  ) {}

  async discoverContacts(userId: string, companyId: string, mode?: "standard" | "deep"): Promise<IContact[]> {
    const company = await this.companyRepository.findById(companyId, userId);
    if (!company) {
      throw new NotFoundError("Company not found or unauthorized.");
    }

    const discovered = await this.contactDiscoveryService.discover(
      company.manualData.name,
      company.manualData.website,
      company.aiResearch,
      mode
    );

    // Validate each discovered contact via AI
    const validatedContacts: IContact[] = [];
    for (const c of discovered) {
      const validation = await this.contactValidationService.validateContact(c);
      validatedContacts.push({
        ...c,
        companyId,
        userId,
        confidenceScore: validation.confidence,
        validationStatus: validation.isValid ? "AI_VALIDATED" : "UNVERIFIED",
        aiNotes: validation.reason,
      });
    }

    return validatedContacts;
  }

  async createContact(userId: string, contactData: any): Promise<IContactDocument> {
    const { companyId, email, linkedin, phone, fullName } = contactData;

    // Duplicate Check
    const duplicates = await this.contactRepository.findDuplicates(userId, companyId, {
      email,
      linkedin,
      phone,
      fullName,
    });

    if (duplicates.length > 0) {
      throw new BadRequestError(
        "A duplicate contact with this name, email, phone, or LinkedIn profile already exists."
      );
    }

    return this.contactRepository.create(userId, {
      ...contactData,
      validationStatus: "USER_VERIFIED",
    });
  }

  async createContactsBatch(userId: string, companyId: string, contacts: any[]): Promise<IContactDocument[]> {
    const savedDocs: IContactDocument[] = [];
    const uniqueEmails = new Set<string>();
    const uniqueLinkedins = new Set<string>();
    const uniquePhones = new Set<string>();
    const uniqueNames = new Set<string>();

    for (const c of contacts) {
      const email = c.email?.trim();
      const linkedin = c.linkedin?.trim();
      const phone = c.phone?.trim();
      const fullName = c.fullName?.trim();

      // Check duplicates inside the batch list itself
      if (email && uniqueEmails.has(email)) continue;
      if (linkedin && uniqueLinkedins.has(linkedin)) continue;
      if (phone && uniquePhones.has(phone)) continue;
      if (fullName && uniqueNames.has(fullName.toLowerCase())) continue;

      if (email) uniqueEmails.add(email);
      if (linkedin) uniqueLinkedins.add(linkedin);
      if (phone) uniquePhones.add(phone);
      if (fullName) uniqueNames.add(fullName.toLowerCase());

      // Check duplicate against existing database contacts
      const duplicates = await this.contactRepository.findDuplicates(userId, companyId, {
        email,
        linkedin,
        phone,
        fullName,
      });

      if (duplicates.length > 0) {
        continue; // Skip duplicates silently during batch save
      }

      const doc = await this.contactRepository.create(userId, {
        ...c,
        companyId,
        validationStatus: c.validationStatus || "USER_VERIFIED",
      });
      savedDocs.push(doc);
    }

    return savedDocs;
  }

  async getContactsByCompany(userId: string, companyId: string): Promise<IContactDocument[]> {
    return this.contactRepository.findByCompany(userId, companyId);
  }

  async updateContact(id: string, userId: string, updateData: any): Promise<IContactDocument> {
    const contact = await this.contactRepository.findById(id, userId);
    if (!contact) {
      throw new NotFoundError("Contact not found or unauthorized.");
    }

    // Verify duplicate checks if changing email/linkedin/phone/name
    const { email, linkedin, phone, fullName, isPreferred, ...rest } = updateData;
    const checks: any = {};
    if (email && email.trim() !== contact.email) checks.email = email;
    if (linkedin && linkedin.trim() !== contact.linkedin) checks.linkedin = linkedin;
    if (phone && phone.trim() !== contact.phone) checks.phone = phone;
    if (fullName && fullName.trim().toLowerCase() !== contact.fullName.toLowerCase()) checks.fullName = fullName;

    if (Object.keys(checks).length > 0) {
      const duplicates = await this.contactRepository.findDuplicates(userId, contact.companyId.toString(), checks);
      const otherDuplicates = duplicates.filter((d) => d._id.toString() !== id);
      if (otherDuplicates.length > 0) {
        throw new BadRequestError(
          "Cannot update: Another contact already exists with these updated parameters."
        );
      }
    }

    // If making this contact preferred, remove preferred from all other contacts of this company
    if (isPreferred === true) {
      const companyContacts = await this.contactRepository.findByCompany(userId, contact.companyId.toString());
      for (const cc of companyContacts) {
        if (cc._id.toString() !== id && cc.isPreferred) {
          await this.contactRepository.update(cc._id.toString(), userId, { isPreferred: false });
        }
      }
    }

    const updated = await this.contactRepository.update(id, userId, {
      email,
      linkedin,
      phone,
      fullName,
      isPreferred,
      ...rest,
      verifiedAt: updateData.validationStatus === "USER_VERIFIED" ? new Date() : contact.verifiedAt,
    });

    if (!updated) {
      throw new BadRequestError("Failed to update contact.");
    }

    return updated;
  }

  async deleteContact(id: string, userId: string): Promise<boolean> {
    const contact = await this.contactRepository.findById(id, userId);
    if (!contact) {
      throw new NotFoundError("Contact not found or unauthorized.");
    }
    return this.contactRepository.delete(id, userId);
  }
}
