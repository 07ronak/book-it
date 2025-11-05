import { PrismaClient } from "@prisma/client";
import { validateBookingInput } from "../utils/validators.js";

const prisma = new PrismaClient();

// POST /bookings - Create a new booking
export const createBooking = async (req, res, next) => {
  try {
    const {
      userName,
      email,
      phone,
      experienceId,
      slotId,
      quantity,
      promoCode,
    } = req.body;

    // Validate input
    const validation = validateBookingInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Check if experience exists (outside transaction for early validation)
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
    });

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    // Pre-fetch slot to verify it exists and belongs to experience (early validation)
    const slotPreCheck = await prisma.slot.findUnique({
      where: { id: slotId },
    });

    if (!slotPreCheck) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }

    // Check if slot belongs to the experience
    if (slotPreCheck.experienceId !== experienceId) {
      return res.status(400).json({
        success: false,
        message: "Slot does not belong to this experience",
      });
    }

    // Calculate base pricing (using experience price from DB - trusted source)
    const basePrice = experience.price;
    const subtotal = basePrice * quantity;
    const taxRate = 0.18; // 18% GST
    const taxAmount = subtotal * taxRate;

    let discountAmount = 0;
    let validPromo = null;

    // Validate promo code with COMPLETE checks including usage limit
    if (promoCode) {
      validPromo = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase() },
      });

      if (validPromo && validPromo.isActive) {
        const now = new Date();

        // Check validity period
        if (now >= validPromo.validFrom && now <= validPromo.validUntil) {
          // CRITICAL: Check usage limit BEFORE applying discount
          if (
            validPromo.usageLimit &&
            validPromo.usageCount >= validPromo.usageLimit
          ) {
            // Promo has reached its usage limit - don't apply discount
            // But don't fail the booking, just ignore the promo
            validPromo = null;
          } else if (
            !validPromo.minAmount ||
            subtotal >= validPromo.minAmount
          ) {
            // All checks passed - calculate discount
            if (validPromo.discountType === "PERCENTAGE") {
              discountAmount = (subtotal * validPromo.discountValue) / 100;
              // Apply max discount cap if exists
              if (validPromo.maxDiscount) {
                discountAmount = Math.min(
                  discountAmount,
                  validPromo.maxDiscount
                );
              }
            } else {
              // FIXED discount
              discountAmount = validPromo.discountValue;
            }
            // Discount cannot exceed subtotal
            discountAmount = Math.min(discountAmount, subtotal);
          }
        }
      }
    }

    const totalAmount = subtotal + taxAmount - discountAmount;

    //Create booking with availability check INSIDE transaction
    // This prevents race conditions and overbooking
    const booking = await prisma.$transaction(async (tx) => {
      // Re-fetch slot INSIDE transaction to get current state
      // This creates an implicit lock and prevents race conditions
      const currentSlot = await tx.slot.findUnique({
        where: { id: slotId },
      });

      // Verify slot still exists (defensive check)
      if (!currentSlot) {
        throw new Error("Slot not found");
      }

      //Check availability with CURRENT data inside transaction
      const availableSlots = currentSlot.totalSlots - currentSlot.bookedSlots;
      if (availableSlots < quantity) {
        throw new Error(
          `Not enough slots available. Only ${availableSlots} slot(s) remaining.`
        );
      }

      // Verify increment won't exceed total slots (defense-in-depth)
      if (currentSlot.bookedSlots + quantity > currentSlot.totalSlots) {
        throw new Error("Booking would exceed slot capacity");
      }

      // Update slot's booked count
      const updatedSlot = await tx.slot.update({
        where: { id: slotId },
        data: {
          bookedSlots: {
            increment: quantity,
          },
        },
      });

      //Final verification after update (extra safety layer)
      if (updatedSlot.bookedSlots > updatedSlot.totalSlots) {
        throw new Error("Slot capacity exceeded after update");
      }

      // Update promo code usage count if used
      if (validPromo) {
        await tx.promoCode.update({
          where: { id: validPromo.id },
          data: {
            usageCount: {
              increment: 1,
            },
          },
        });
      }

      // Create the booking
      return await tx.booking.create({
        data: {
          userName,
          email,
          phone,
          experienceId,
          slotId,
          quantity,
          basePrice,
          taxAmount,
          discountAmount,
          totalAmount,
          promoCode: promoCode?.toUpperCase() || null,
          status: "CONFIRMED",
        },
        include: {
          experience: true,
          slot: true,
        },
      });
    });

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully",
      data: {
        refId: booking.refId,
        userName: booking.userName,
        email: booking.email,
        experience: booking.experience.title,
        date: booking.slot.date,
        time: booking.slot.time,
        quantity: booking.quantity,
        pricing: {
          basePrice: booking.basePrice,
          subtotal: subtotal,
          taxAmount: booking.taxAmount,
          discountAmount: booking.discountAmount,
          totalAmount: booking.totalAmount,
        },
        status: booking.status,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    // Enhanced error logging for debugging
    console.error("Booking creation failed:", {
      error: error.message,
      stack: error.stack,
      experienceId: req.body.experienceId,
      slotId: req.body.slotId,
      quantity: req.body.quantity,
      timestamp: new Date().toISOString(),
    });

    // Handle specific error messages from transaction
    if (error.message.includes("Not enough slots")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("capacity")) {
      return res.status(400).json({
        success: false,
        message: "Unable to complete booking. Slot may be fully booked.",
      });
    }

    // Pass to error handler middleware
    next(error);
  }
};

export const verifyBooking = async (req, res) => {
  try {
    const { refId } = req.query;

    // Check if refId was provided
    if (!refId) {
      return res.status(400).json({
        error: "Booking reference is required",
      });
    }

    // Look up booking in database
    const booking = await prisma.booking.findUnique({
      where: {
        refId: refId,
      },
      select: {
        refId: true,
        status: true,
        userName: true,
        createdAt: true,
      },
    });

    // If booking doesn't exist
    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    // Only show success page for CONFIRMED bookings
    if (booking.status !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        error: "Booking is not confirmed",
      });
    }

    // Success! Booking is valid
    return res.status(200).json({
      success: true,
      booking: {
        refId: booking.refId,
        status: booking.status,
        userName: booking.userName,
      },
    });
  } catch (error) {
    console.error("Booking verification error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
