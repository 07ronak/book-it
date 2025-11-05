// Validation utility functions

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const validateBookingInput = (data) => {
  const errors = [];

  // Required fields
  if (!data.userName || data.userName.trim().length === 0) {
    errors.push("User name is required");
  }

  if (!data.email) {
    errors.push("Email is required");
  } else if (!validateEmail(data.email)) {
    errors.push("Invalid email format");
  }

  if (!data.experienceId) {
    errors.push("Experience ID is required");
  }

  if (!data.slotId) {
    errors.push("Slot ID is required");
  }

  if (!data.quantity || data.quantity < 1) {
    errors.push("Quantity must be at least 1");
  }

  if (data.quantity > 10) {
    errors.push("Maximum quantity is 10 persons per booking");
  }

  // Optional phone validation
  if (data.phone && !validatePhone(data.phone)) {
    errors.push("Invalid phone number format (must be 10 digits)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
