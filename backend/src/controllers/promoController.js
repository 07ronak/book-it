import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /promo/validate - Validate promo code
export const validatePromoCode = async (req, res, next) => {
  try {
    const { code, amount: rawAmount } = req.body;

    // Validation
    if (!code || !rawAmount) {
      return res.status(400).json({
        success: false,
        message: "Promo code and amount are required",
      });
    }

    // Convert amount to number (handles both string and number inputs)
    const amount = parseFloat(rawAmount);

    // Check if amount is valid after conversion
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    // Find promo code
    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    // Check if promo exists
    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Invalid promo code",
      });
    }

    // Check if promo is active
    if (!promo.isActive) {
      return res.status(400).json({
        success: false,
        message: "This promo code is no longer active",
      });
    }

    const now = new Date();

    // Check validity period
    if (now < promo.validFrom) {
      return res.status(400).json({
        success: false,
        message: "This promo code is not yet valid",
      });
    }

    if (now > promo.validUntil) {
      return res.status(400).json({
        success: false,
        message: "This promo code has expired",
      });
    }

    // Check usage limit
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "This promo code has reached its usage limit",
      });
    }

    // Check minimum amount
    if (promo.minAmount && amount < promo.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum booking amount of ₹${promo.minAmount} required to use this promo code`,
      });
    }

    // Calculate discount
    let discountAmount = 0;

    if (promo.discountType === "PERCENTAGE") {
      discountAmount = (amount * promo.discountValue) / 100;

      // Apply max discount cap if exists
      if (promo.maxDiscount) {
        discountAmount = Math.min(discountAmount, promo.maxDiscount);
      }
    } else {
      // FIXED discount
      discountAmount = promo.discountValue;
    }

    // Discount cannot exceed the amount
    discountAmount = Math.min(discountAmount, amount);

    const finalAmount = amount - discountAmount;

    res.json({
      success: true,
      message: "Promo code is valid",
      data: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        originalAmount: amount,
        finalAmount: parseFloat(finalAmount.toFixed(2)),
        savings: parseFloat(discountAmount.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};
