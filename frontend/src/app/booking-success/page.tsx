"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const [refId, setRefId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyBooking = async () => {
      const id = searchParams.get("refId");
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/bookings/verify?refId=${id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Booking not found");
        }

        setRefId(data.booking.refId);
      } catch (err) {
        setError("Invalid or expired booking reference");
      } finally {
        setLoading(false);
      }
    };

    verifyBooking();
  }, [searchParams]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 mt-10">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">
            Verifying booking...
          </p>
        </div>
      </div>
    );
  }

  // Error state (invalid refId or no refId)
  if (!refId || error) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <svg
              className="w-12 h-12 sm:w-14 sm:h-14 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3 sm:mb-4 px-4">
            Invalid Booking
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-8 sm:mb-12 px-4">
            {error || "No booking reference found. Please try booking again."}
          </p>
          <Link
            href="/experiences"
            className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-md transition text-sm sm:text-base"
          >
            Browse Experiences
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 sm:p-6">
      <div className="text-center max-w-md">
        {/* Green Circle with Checkmark */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-600 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 sm:w-14 sm:h-14 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Booking Confirmed Text */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4 sm:mb-6 px-4">
          Booking Confirmed
        </h1>

        {/* Reference ID */}
        <p className="text-sm sm:text-base text-gray-600 mb-8 sm:mb-10 px-4 break-all">
          Ref ID: {refId}
        </p>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="inline-block px-4 sm:px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition text-sm sm:text-base"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-4 mt-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading...</p>
          </div>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
