import express from "express";
import {
  createBooking,
  verifyBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

// POST /bookings - Create a new booking
router.post("/", createBooking);

// GET /bookings/verify - Verify a booking by reference ID
router.get("/verify", verifyBooking);

export default router;
