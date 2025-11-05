"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Slot {
  id: number;
  date: string;
  time: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  isSoldOut: boolean;
}

interface BookingData {
  experienceId: number;
  slotId: number;
  quantity: number;
  date: string;
  time: string;
  // Fetched from backend (trusted source)
  experienceTitle: string;
  basePrice: number;
  // ✅ Added for validation
  slot: Slot;
}

export default function CheckoutPage({
  experienceId,
}: {
  experienceId: string;
}) {
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadBookingData() {
      try {
        // ✅ STEP 1: Get and validate URL parameters
        const slotId = searchParams.get("slotId");
        const date = searchParams.get("date");
        const time = searchParams.get("time");
        const quantity = searchParams.get("quantity");

        console.log("URL Params:", { slotId, date, time, quantity });

        // Validate that all required parameters are present
        if (!slotId || !date || !time || !quantity) {
          setError("Missing booking information in URL");
          setLoading(false);
          return;
        }

        // Validate parameter types
        const parsedSlotId = parseInt(slotId);
        const parsedQuantity = parseInt(quantity);

        if (isNaN(parsedSlotId) || parsedSlotId <= 0) {
          setError("Invalid slot ID");
          setLoading(false);
          return;
        }

        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
          setError("Invalid quantity");
          setLoading(false);
          return;
        }

        // ✅ STEP 2: Fetch experience details from backend with slots
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/experiences/${experienceId}`
        );

        if (!res.ok) {
          setError("Failed to load experience details");
          setLoading(false);
          return;
        }

        const result = await res.json();

        console.log("Backend Response:", result);

        if (!result.success || !result.data) {
          setError("Experience not found");
          setLoading(false);
          return;
        }

        const experience = result.data;

        // ✅ STEP 3: Verify slot exists and belongs to this experience
        if (!experience.slots || !Array.isArray(experience.slots)) {
          setError("No slots available for this experience");
          setLoading(false);
          return;
        }

        const slot = experience.slots.find((s: Slot) => s.id === parsedSlotId);

        if (!slot) {
          setError(
            "Selected slot not found. It may have been removed or is no longer available."
          );
          setLoading(false);
          return;
        }

        console.log("Found Slot:", slot);

        // ✅ STEP 4: Verify date matches the slot's date
        const slotDate = slot.date.split("T")[0]; // Extract YYYY-MM-DD
        if (slotDate !== date) {
          setError(
            `Date mismatch. Expected ${slotDate} but got ${date}. Please select again.`
          );
          setLoading(false);
          return;
        }

        // ✅ STEP 5: Verify time matches the slot's time
        if (slot.time !== time) {
          setError(
            `Time mismatch. Expected ${slot.time} but got ${time}. Please select again.`
          );
          setLoading(false);
          return;
        }

        // ✅ STEP 6: Check if slot is sold out
        if (slot.isSoldOut) {
          setError("This slot is sold out. Please select another time.");
          setLoading(false);
          return;
        }

        // ✅ STEP 7: Verify quantity doesn't exceed available slots
        if (parsedQuantity > slot.availableSlots) {
          setError(
            `Only ${slot.availableSlots} slot(s) available. You requested ${parsedQuantity}.`
          );
          setLoading(false);
          return;
        }

        // ✅ STEP 8: All validations passed - set booking data
        const data: BookingData = {
          experienceId: parseInt(experienceId),
          slotId: parsedSlotId,
          quantity: parsedQuantity,
          date,
          time,
          experienceTitle: experience.title,
          basePrice: experience.price, // ALWAYS from backend
          slot, // Store full slot data for reference
        };

        console.log("✅ Validated Booking Data:", data);
        setBookingData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading booking data:", error);
        setError("Failed to load booking information. Please try again.");
        setLoading(false);
      }
    }

    loadBookingData();
  }, [experienceId, searchParams]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !bookingData) return;

    setPromoLoading(true);
    setPromoMessage(null);

    try {
      const subtotal = bookingData.basePrice * bookingData.quantity;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/promo/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: promoCode.toUpperCase(),
            amount: subtotal,
          }),
        }
      );

      const data = await res.json();

      if (data.success && data.data) {
        setAppliedPromo(promoCode.toUpperCase());
        setDiscountAmount(data.data.discountAmount);
        setPromoMessage({
          type: "success",
          text: `Promo code applied! You saved ₹${data.data.discountAmount}`,
        });
      } else {
        setPromoMessage({
          type: "error",
          text: data.message || "Invalid promo code",
        });
        setAppliedPromo(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error("Error applying promo:", error);
      setPromoMessage({
        type: "error",
        text: "Failed to apply promo code. Please try again.",
      });
      setAppliedPromo(null);
      setDiscountAmount(0);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData || !agreedToTerms) return;

    // ✅ Prevent duplicate submissions (idempotency)
    if (bookingId) {
      alert("Booking already submitted! Redirecting...");
      window.location.href = `/booking-success?refId=${bookingId}`;
      return;
    }

    // ✅ Validate required fields with better validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      alert("Please enter your full name (at least 2 characters)");
      return;
    }

    // ✅ Better email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      alert("Please enter a valid email address");
      return;
    }

    // ✅ Phone validation (if provided)
    if (phone.trim() && !/^\+?[\d\s\-()]+$/.test(phone.trim())) {
      alert("Please enter a valid phone number");
      return;
    }

    // ✅ Final availability check warning (user might be on page for a while)
    if (bookingData.quantity > bookingData.slot.availableSlots) {
      alert(
        `Only ${bookingData.slot.availableSlots} slots available now. Please refresh and try again.`
      );
      window.location.reload();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          experienceId: bookingData.experienceId,
          slotId: bookingData.slotId,
          quantity: bookingData.quantity,
          promoCode: appliedPromo || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // ✅ Store booking ID to prevent duplicate submissions
        setBookingId(data.data.refId);

        // Redirect to success page with booking reference
        window.location.href = `/booking-success?refId=${data.data.refId}`;
      } else {
        // Show specific error message from backend
        alert(data.message || "Booking failed. Please try again.");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert(
        "Failed to complete booking. Please check your connection and try again."
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mb-4"></div>
          <div className="text-lg font-medium text-gray-900">
            Loading checkout...
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Validating booking details
          </div>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="">
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
            <Link
              href={`/experiences/${experienceId}`}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <span className="text-sm font-medium text-gray-900">Checkout</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || "No booking information found"}
            </h2>
            <p className="text-gray-600 mb-6">
              {error?.includes("mismatch") || error?.includes("sold out")
                ? "The slot you selected may have been booked by someone else."
                : "Please go back and select your booking details again."}
            </p>
            <Link
              href={`/experiences/${experienceId}`}
              className="inline-block px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition"
            >
              Back to Experience
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = bookingData.basePrice * bookingData.quantity;
  const taxes = subtotal * 0.18; // 18% GST
  const total = subtotal + taxes - discountAmount;

  return (
    <div className="">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link
            href={`/experiences/${experienceId}`}
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm font-medium text-gray-900">Checkout</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Checkout Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-gray-100 rounded-lg p-5 space-y-4"
            >
              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1.5">
                      Full name *
                    </label>
                    <input
                      name="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your Name"
                      required
                      minLength={2}
                      maxLength={100}
                      className="w-full px-4 py-2.5 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1.5">
                      Email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      required
                      className="w-full px-4 py-2.5 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1.5">
                      Phone (optional)
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contact number"
                      className="w-full px-4 py-2.5 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  {/* Promo Code */}
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1.5">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter code"
                        disabled={!!appliedPromo}
                        className="flex-1 px-4 py-2.5 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={
                          !promoCode.trim() || !!appliedPromo || promoLoading
                        }
                        className="px-5 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
                      >
                        {promoLoading ? "..." : appliedPromo ? "✓" : "Apply"}
                      </button>
                    </div>
                    {promoMessage && (
                      <p
                        className={`text-xs mt-1.5 ${
                          promoMessage.type === "success"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {promoMessage.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the terms and safety policy *
                </label>
              </div>

              {/* Mobile Pay Button - Only visible on mobile */}
              <div className="block lg:hidden">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={
                    !agreedToTerms ||
                    submitting ||
                    !fullName.trim() ||
                    !email.trim() ||
                    !!bookingId
                  }
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    agreedToTerms &&
                    !submitting &&
                    fullName.trim() &&
                    email.trim() &&
                    !bookingId
                      ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {submitting
                    ? "Processing..."
                    : bookingId
                    ? "Booking Confirmed"
                    : `Pay ₹${total.toFixed(0)}`}
                </button>
                {!agreedToTerms && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Please agree to terms to continue
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-5 space-y-3 lg:sticky lg:top-4">
              {/* Experience Details */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-medium text-gray-900 text-right max-w-[180px]">
                    {bookingData.experienceTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-900">
                    {bookingData.date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium text-gray-900">
                    {bookingData.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium text-gray-900">
                    {bookingData.quantity}{" "}
                    {bookingData.quantity === 1 ? "person" : "people"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Available slots</span>
                  <span className="text-yellow-600 font-medium">
                    {bookingData.slot.availableSlots} remaining
                  </span>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Pricing */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ₹{subtotal.toFixed(0)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-semibold text-green-600">
                      -₹{discountAmount.toFixed(0)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes (18% GST)</span>
                  <span className="font-semibold text-gray-900">
                    ₹{taxes.toFixed(0)}
                  </span>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Total */}
              <div className="flex justify-between items-center py-1">
                <span className="text-base font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-xl font-bold text-gray-900">
                  ₹{total.toFixed(0)}
                </span>
              </div>

              {/* Desktop Pay Button - Hidden on mobile */}
              <div className="hidden lg:block">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={
                    !agreedToTerms ||
                    submitting ||
                    !fullName.trim() ||
                    !email.trim() ||
                    !!bookingId
                  }
                  className={`w-full py-2.5 rounded-lg font-semibold transition ${
                    agreedToTerms &&
                    !submitting &&
                    fullName.trim() &&
                    email.trim() &&
                    !bookingId
                      ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {submitting
                    ? "Processing..."
                    : bookingId
                    ? "Booking Confirmed"
                    : "Pay and Confirm"}
                </button>

                {!agreedToTerms && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Please agree to terms to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
