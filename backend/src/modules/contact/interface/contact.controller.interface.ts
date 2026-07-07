import { Request, Response, NextFunction } from "express";

export interface IContactController {
  discoverContacts(req: Request, res: Response, next: NextFunction): Promise<any>;
  createContact(req: Request, res: Response, next: NextFunction): Promise<any>;
  createContactsBatch(req: Request, res: Response, next: NextFunction): Promise<any>;
  getContactsByCompany(req: Request, res: Response, next: NextFunction): Promise<any>;
  updateContact(req: Request, res: Response, next: NextFunction): Promise<any>;
  deleteContact(req: Request, res: Response, next: NextFunction): Promise<any>;
}
