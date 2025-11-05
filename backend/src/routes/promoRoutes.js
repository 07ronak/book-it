import express from "express";
import { validatePromoCode } from "../controllers/promoController.js";

const router = express.Router();

// POST /promo/validate - Validate promo code
router.post("/validate", validatePromoCode);

export default router;
