"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";

interface Slot {
  id: number;
  date: string;
  time: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  isSoldOut: boolean;
}

interface Experience {
  id: number;
  title: string;
  description: string;
  about: string;
  imageUrl: string;
  location: string;
  price: number;
  slots: Slot[];
}

interface GroupedSlots {
  [date: string]: Slot[];
}

export default function ExperienceDetailsPage({
  experienceId,
}: {
  experienceId: string;
}) {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [groupedSlots, setGroupedSlots] = useState<GroupedSlots>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/experiences/${experienceId}`
        );
        const data = await res.json();

        if (data.success && data.data) {
          setExperience(data.data);

          // Group slots by date
          const grouped: GroupedSlots = {};
          if (data.data.slots && Array.isArray(data.data.slots)) {
            data.data.slots.forEach((slot: Slot) => {
              const dateKey = slot.date.split("T")[0]; // Extract date part
              if (!grouped[dateKey]) {
                grouped[dateKey] = [];
              }
              grouped[dateKey].push(slot);
            });
          }
          setGroupedSlots(grouped);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [experienceId]);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!experience) {
    return <div className="p-6 text-center">Experience not found.</div>;
  }

  const dates = Object.keys(groupedSlots).sort();
  const basePrice = experience.price;
  const subtotal = basePrice * quantity;
  const taxes = subtotal * 0.18; // 18% GST
  const total = subtotal + taxes;
  const isBookingValid = selectedDate && selectedSlot;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    return { month, day };
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (
      newQuantity >= 1 &&
      selectedSlot &&
      newQuantity <= selectedSlot.availableSlots
    ) {
      setQuantity(newQuantity);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Reset time slot when date changes
    setQuantity(1); // Reset quantity
  };

  const handleTimeSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    // Reset quantity if it exceeds available slots
    if (quantity > slot.availableSlots) {
      setQuantity(1);
    }
  };

  const handleConfirm = () => {
    if (!isBookingValid || !selectedSlot || !selectedDate) return;

    // Build URL with query parameters (NO PRICING DATA)
    const params = new URLSearchParams({
      slotId: selectedSlot.id.toString(),
      date: selectedDate,
      time: selectedSlot.time,
      quantity: quantity.toString(),
    });

    // Navigate to checkout with query parameters
    window.location.href = `/experiences/${experienceId}/checkout?${params.toString()}`;
  };

  return (
    <div className="px-2 sm:px-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="max-w-7xl mx-auto py-3 flex items-center gap-2">
          <Link
            href="/experiences"
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm font-medium text-gray-900">Details</span>
        </div>
      </div>

      <div className="">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column - Experience Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={experience.imageUrl}
                alt={experience.title}
                className="w-full h-48 sm:h-60 md:h-70 lg:h-70 object-cover"
              />
            </div>

            {/* Title & Description */}
            <div className="">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {experience.title}
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed">
                {experience.description}
              </p>
            </div>

            {/* Date Selection */}
            {dates.length > 0 && (
              <div>
                <h2 className="text-sm sm:text-md font-semibold text-gray-900 mb-1">
                  Choose date
                </h2>
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                  {dates.map((date) => {
                    const { month, day } = formatDate(date);
                    const isSelected = selectedDate === date;
                    return (
                      <button
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className={`shrink-0 px-2.5 sm:px-3 py-2 rounded border transition flex items-center justify-center gap-x-1 ${
                          isSelected
                            ? "border-yellow-300 bg-yellow-300 text-black"
                            : "border-gray-200 bg-white hover:border-gray-400 text-gray-400"
                        }`}
                      >
                        <div className="text-xs uppercase">{month}</div>
                        <div className="text-xs">{day}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Time Selection */}
            {selectedDate && groupedSlots[selectedDate] && (
              <div>
                <h2 className="text-sm sm:text-md font-semibold text-gray-900 mb-1">
                  Choose time
                </h2>
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                  {groupedSlots[selectedDate].map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    const isSoldOut = slot.isSoldOut;
                    const availableSlots = slot.availableSlots;

                    // Determine slot color based on availability
                    const getSlotColor = () => {
                      if (isSoldOut) return "text-gray-400";
                      if (availableSlots <= 5) return "text-red-500";
                      if (availableSlots >= 6 && availableSlots <= 10)
                        return "text-yellow-600";
                      return "text-yellow-600"; // This won't show but keeping for consistency
                    };

                    const showSlotInfo = isSoldOut || availableSlots <= 10;

                    return (
                      <button
                        key={slot.id}
                        onClick={() => !isSoldOut && handleTimeSelect(slot)}
                        disabled={isSoldOut}
                        className={`shrink-0 px-2.5 sm:px-3 py-2 rounded border transition flex items-center justify-center gap-x-2  ${
                          isSoldOut
                            ? "border-gray-200 bg-gray-200 cursor-not-allowed opacity-50"
                            : isSelected
                            ? "border-yellow-300 bg-yellow-300 text-black"
                            : "border-gray-200 bg-white hover:border-gray-400 text-gray-400"
                        }`}
                      >
                        <div className={`text-xs`}>{slot.time}</div>
                        {showSlotInfo && (
                          <div
                            className={`text-[10px] font-semibold ${getSlotColor()}`}
                          >
                            {isSoldOut
                              ? "Sold out"
                              : `${slot.availableSlots} left`}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  All times are in IST (GMT +5:30)
                </p>
              </div>
            )}

            {/* About Section */}
            {experience.about && (
              <div className="pb-24 lg:pb-8">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  About
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-100 p-2 rounded-lg">
                  {experience.about}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            {/* Mobile: Fixed bottom bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{total.toFixed(0)}
                    </span>
                    <span className="text-xs text-gray-500">
                      for {quantity} {quantity === 1 ? "ticket" : "tickets"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Includes taxes
                  </div>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={!isBookingValid}
                  className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                    isBookingValid
                      ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Confirm
                </button>
              </div>
              {!isBookingValid && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Please select both date and time
                </p>
              )}
            </div>

            {/* Desktop: Sticky sidebar */}
            <div className="hidden lg:block bg-gray-100 rounded-lg shadow-md p-4 sticky top-20">
              <div className="space-y-3">
                {/* Starts at */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Starts at</span>
                  <span className="text-md text-gray-900">₹{basePrice}</span>
                </div>

                {/* Quantity */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quantity</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      −
                    </button>
                    <span className="text-md text-gray-900 w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={
                        !selectedSlot || quantity >= selectedSlot.availableSlots
                      }
                      className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm text-gray-900">
                    ₹{subtotal.toFixed(0)}
                  </span>
                </div>

                {/* Taxes */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxes</span>
                  <span className="text-sm  text-gray-900">
                    ₹{taxes.toFixed(0)}
                  </span>
                </div>

                <hr className="border-gray-200" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₹{total.toFixed(0)}
                  </span>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirm}
                  disabled={!isBookingValid}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    isBookingValid
                      ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Confirm
                </button>

                {!isBookingValid && (
                  <p className="text-xs text-center text-gray-500">
                    Please select both date and time
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
