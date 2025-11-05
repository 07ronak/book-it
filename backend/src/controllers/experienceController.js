import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /experiences - Get all experiences
export const getAllExperiences = async (req, res, next) => {
  try {
    const { search } = req.query;

    const experiences = await prisma.experience.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: experiences.length,
      data: experiences,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/experiences/:id - Get single experience with slots
export const getExperienceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate before parsing
    const experienceId = parseInt(id);
    if (isNaN(experienceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience ID",
      });
    }

    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
      include: {
        slots: {
          where: {
            date: {
              gte: new Date(), // Only future slots
            },
          },
          orderBy: [{ date: "asc" }, { time: "asc" }],
        },
      },
    });

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    // Add availability info to each slot
    const experienceWithAvailability = {
      ...experience,
      slots: experience.slots.map((slot) => ({
        ...slot,
        availableSlots: slot.totalSlots - slot.bookedSlots,
        isSoldOut: slot.bookedSlots >= slot.totalSlots,
      })),
    };

    res.json({
      success: true,
      data: experienceWithAvailability,
    });
  } catch (error) {
    next(error);
  }
};
