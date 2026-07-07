import { Request, Response, NextFunction } from "express";
import { IContactController } from "../interface/contact.controller.interface";
import { IContactService } from "../interface/contact.service.interface";
import { ApiResponse } from "../../../utils/api-response.utils";
import { UnauthorizedError, BadRequestError } from "../../../errors";

export class ContactController implements IContactController {
  constructor(private contactService: IContactService) {}

  discoverContacts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Authentication required.");
      }
      const { companyId, mode } = req.body;
      if (!companyId) {
        throw new BadRequestError("Company ID is required.");
      }

      const contacts = await this.contactService.discoverContacts(req.user.id, companyId, mode);
      return ApiResponse.success(res, "Contacts discovered successfully", contacts);
    } catch (error) {
      next(error);
    }
  };

  createContact = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Authentication required.");
      }
      const contact = await this.contactService.createContact(req.user.id, req.body);
      return ApiResponse.success(res, "Contact created successfully", contact);
    } catch (error) {
      next(error);
    }
  };

  createContactsBatch = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Authentication required.");
      }
      const { companyId, contacts } = req.body;
      if (!companyId) {
        throw new BadRequestError("Company ID is required.");
      }
      if (!Array.isArray(contacts)) {
        throw new BadRequestError("Contacts list must be an array.");
      }

      const saved = await this.contactService.createContactsBatch(req.user.id, companyId, contacts);
      return ApiResponse.success(res, "Contacts saved in batch successfully", saved);
    } catch (error) {
      next(error);
    }
  };

  getContactsByCompany = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Authentication required.");
      }
      const contacts = await this.contactService.getContactsByCompany(req.user.id, req.params.companyId);
      return ApiResponse.success(res, "Contacts retrieved successfully", contacts);
    } catch (error) {
      next(error);
    }
  };

  updateContact = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Authentication required.");
      }
      const updated = await this.contactService.updateContact(req.params.id, req.user.id, req.body);
      return ApiResponse.success(res, "Contact updated successfully", updated);
    } catch (error) {
      next(error);
    }
  };

  deleteContact = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedError("Authentication required.");
      }
      await this.contactService.deleteContact(req.params.id, req.user.id);
      return ApiResponse.success(res, "Contact deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}
