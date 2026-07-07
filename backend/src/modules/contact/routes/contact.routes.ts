import { Router } from "express";
import { ContactController } from "../controller/contact.controller";
import { ContactService } from "../service/contact.service";
import { ContactRepository } from "../repository/contact.repository";
import { ContactDiscoveryService } from "../service/contact-discovery.service";
import { ContactValidationService } from "../service/contact-validation.service";
import { validate } from "../../../middleware/validate.middleware";
import { authMiddleware } from "../../../middleware/auth.middleware";
import {
  createContactSchema,
  createContactBatchSchema,
  updateContactSchema,
  discoverContactsSchema,
} from "../validation/contact.validation";

const router = Router();

const contactRepository = new ContactRepository();
const contactDiscoveryService = new ContactDiscoveryService();
const contactValidationService = new ContactValidationService();
const contactService = new ContactService(
  contactRepository,
  contactDiscoveryService,
  contactValidationService
);
const contactController = new ContactController(contactService);

router.post("/discover", authMiddleware, validate(discoverContactsSchema), contactController.discoverContacts);
router.post("/", authMiddleware, validate(createContactSchema), contactController.createContact);
router.post("/batch", authMiddleware, validate(createContactBatchSchema), contactController.createContactsBatch);
router.get("/company/:companyId", authMiddleware, contactController.getContactsByCompany);
router.patch("/:id", authMiddleware, validate(updateContactSchema), contactController.updateContact);
router.delete("/:id", authMiddleware, contactController.deleteContact);

export default router;
