import { Router } from "express";
import router from "./auth.routes";
import { createCompany } from "../controllers/companies.controller";


const companyRoutes = Router();

router.post("/company",createCompany);
export default router;