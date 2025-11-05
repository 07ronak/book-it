import { PrismaClient, DiscountType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.slot.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.booking.deleteMany();

  //  Create promo codes (3 examples)
  await prisma.promoCode.createMany({
    data: [
      {
        code: "NEW100",
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10, // 10% off
        minAmount: 500,
        maxDiscount: 300,
        validFrom: new Date("2024-10-30"),
        validUntil: new Date("2027-12-31"),
        isActive: true,
      },
      {
        code: "GET200",
        discountType: DiscountType.FIXED,
        discountValue: 200, // ₹200 off
        minAmount: 1000,
        maxDiscount: null,
        validFrom: new Date("2025-10-25"),
        validUntil: new Date("2026-12-31"),
        isActive: true,
        usageLimit: 50,
      },
      {
        code: "FESTIVE20",
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20, // 20% off
        minAmount: 1500,
        maxDiscount: 500,
        validFrom: new Date("2024-11-01"),
        validUntil: new Date("2025-12-31"),
        isActive: true,
        usageLimit: 200,
      },
    ],
  });

  // Create 10 experiences with unique slot configurations

  // Experience 1: Scuba Diving in Goa
  await prisma.experience.create({
    data: {
      title: "Scuba Diving in Goa",
      description:
        "Explore the vibrant underwater world of the Arabian Sea with crystal-clear visibility up to 15 meters. Dive alongside colorful reef fish, sea turtles, and if you're lucky, dolphins. Our PADI-certified instructors ensure a safe and unforgettable experience for both first-timers and certified divers.",
      about:
        "Perfect for beginners and experienced divers. Minimum age: 10 years.",
      imageUrl: "https://images.unsplash.com/photo-1616690571314-555787931249",
      location: "Goa",
      price: 2500,
      slots: {
        create: [
          {
            date: new Date("2025-11-05"),
            time: "7:00 AM",
            totalSlots: 8,
            bookedSlots: 3,
          },
          {
            date: new Date("2025-11-05"),
            time: "11:00 AM",
            totalSlots: 8,
            bookedSlots: 5,
          },
          {
            date: new Date("2025-11-06"),
            time: "7:00 AM",
            totalSlots: 10,
            bookedSlots: 2,
          },
          {
            date: new Date("2025-11-06"),
            time: "2:00 PM",
            totalSlots: 6,
            bookedSlots: 1,
          },
          {
            date: new Date("2025-11-08"),
            time: "8:00 AM",
            totalSlots: 8,
            bookedSlots: 0,
          },
        ],
      },
    },
  });

  // Experience 2: Paragliding in Bir Billing
  await prisma.experience.create({
    data: {
      title: "Paragliding in Bir Billing",
      description:
        "Soar like an eagle over the breathtaking Dhauladhar ranges with flights lasting 15-30 minutes. Bir Billing is renowned as one of the world's best paragliding sites, offering panoramic views of snow-capped peaks, lush valleys, and traditional Himalayan villages. Tandem flights with experienced pilots make this accessible to everyone.",
      about:
        "Experience the thrill of flying over stunning mountain landscapes. Minimum age: 16 years.",
      imageUrl: "https://images.unsplash.com/photo-1661246474881-a92eb39f6b9d",
      location: "Himachal Pradesh",
      price: 3500,
      slots: {
        create: [
          {
            date: new Date("2025-11-10"),
            time: "9:00 AM",
            totalSlots: 5,
            bookedSlots: 4,
          },
          {
            date: new Date("2025-11-10"),
            time: "1:00 PM",
            totalSlots: 5,
            bookedSlots: 2,
          },
          {
            date: new Date("2025-11-12"),
            time: "10:00 AM",
            totalSlots: 6,
            bookedSlots: 0,
          },
          {
            date: new Date("2025-11-14"),
            time: "9:30 AM",
            totalSlots: 4,
            bookedSlots: 1,
          },
          {
            date: new Date("2025-11-15"),
            time: "11:00 AM",
            totalSlots: 5,
            bookedSlots: 3,
          },
          {
            date: new Date("2025-11-15"),
            time: "3:00 PM",
            totalSlots: 4,
            bookedSlots: 4,
          },
        ],
      },
    },
  });

  // Experience 3: White Water Rafting in Rishikesh
  await prisma.experience.create({
    data: {
      title: "White Water Rafting in Rishikesh",
      description:
        "Conquer the mighty Ganges on an exhilarating 16-26 km rafting expedition through Grade III and IV rapids. Navigate through thrilling stretches like Roller Coaster, Golf Course, and Double Trouble while surrounded by stunning mountain scenery. Perfect blend of adrenaline and natural beauty with experienced river guides.",
      about:
        "Challenge yourself with Grade III and IV rapids. Minimum age: 14 years.",
      imageUrl: "https://images.unsplash.com/photo-1603867106100-0d2039fc8757",
      location: "Rishikesh",
      price: 1800,
      slots: {
        create: [
          {
            date: new Date("2025-11-06"),
            time: "8:30 AM",
            totalSlots: 15,
            bookedSlots: 8,
          },
          {
            date: new Date("2025-11-06"),
            time: "12:30 PM",
            totalSlots: 15,
            bookedSlots: 12,
          },
          {
            date: new Date("2025-11-07"),
            time: "9:00 AM",
            totalSlots: 12,
            bookedSlots: 5,
          },
          {
            date: new Date("2025-11-09"),
            time: "10:00 AM",
            totalSlots: 15,
            bookedSlots: 0,
          },
        ],
      },
    },
  });

  // Experience 4: Hot Air Balloon Ride in Jaipur
  await prisma.experience.create({
    data: {
      title: "Hot Air Balloon Ride in Jaipur",
      description:
        "Float serenely above Jaipur's magnificent landscape as the sun paints the sky in golden hues. Marvel at the Amber Fort, City Palace, and Jal Mahal from a unique bird's-eye perspective. Each flight lasts approximately 45-60 minutes and includes a champagne breakfast upon landing, making it a truly royal experience.",
      about:
        "Witness majestic forts and palaces from above during sunrise. All ages welcome.",
      imageUrl: "https://images.unsplash.com/photo-1642700055585-341fb4949e9e",
      location: "Jaipur",
      price: 4500,
      slots: {
        create: [
          {
            date: new Date("2025-11-08"),
            time: "5:30 AM",
            totalSlots: 4,
            bookedSlots: 3,
          },
          {
            date: new Date("2025-11-09"),
            time: "5:30 AM",
            totalSlots: 4,
            bookedSlots: 4,
          },
          {
            date: new Date("2025-11-11"),
            time: "6:00 AM",
            totalSlots: 6,
            bookedSlots: 2,
          },
          {
            date: new Date("2025-11-13"),
            time: "5:45 AM",
            totalSlots: 4,
            bookedSlots: 0,
          },
          {
            date: new Date("2025-11-16"),
            time: "6:00 AM",
            totalSlots: 5,
            bookedSlots: 1,
          },
        ],
      },
    },
  });

  // Experience 5: Bungee Jumping in Lonavala
  await prisma.experience.create({
    data: {
      title: "Bungee Jumping in Lonavala",
      description:
        "Experience the ultimate adrenaline rush with India's highest fixed-platform bungee jump. Freefall for 3-4 seconds before the cord catches you, followed by multiple bounces that will make your heart race. Professional equipment imported from New Zealand and expert jump masters ensure maximum safety and minimum fear.",
      about:
        "Jump from 150 feet with professional safety equipment. Minimum age: 18 years.",
      imageUrl: "https://images.unsplash.com/photo-1595778039451-58a7c2946e7d",
      location: "Lonavala",
      price: 3000,
      slots: {
        create: [
          {
            date: new Date("2025-11-07"),
            time: "10:00 AM",
            totalSlots: 10,
            bookedSlots: 7,
          },
          {
            date: new Date("2025-11-07"),
            time: "2:00 PM",
            totalSlots: 10,
            bookedSlots: 9,
          },
          {
            date: new Date("2025-11-08"),
            time: "11:00 AM",
            totalSlots: 8,
            bookedSlots: 4,
          },
          {
            date: new Date("2025-11-10"),
            time: "1:00 PM",
            totalSlots: 10,
            bookedSlots: 2,
          },
          {
            date: new Date("2025-11-14"),
            time: "10:30 AM",
            totalSlots: 8,
            bookedSlots: 0,
          },
          {
            date: new Date("2025-11-14"),
            time: "3:00 PM",
            totalSlots: 8,
            bookedSlots: 1,
          },
        ],
      },
    },
  });

  // Experience 6: Wildlife Safari in Jim Corbett
  await prisma.experience.create({
    data: {
      title: "Wildlife Safari in Jim Corbett",
      description:
        "Embark on a thrilling jeep safari through dense sal forests and grasslands spanning over 500 square kilometers. Apart from the majestic Bengal tiger, spot elephants, leopards, sloth bears, and over 600 species of birds. Morning and evening safaris offer the best chances for wildlife sightings when animals are most active.",
      about:
        "Explore India's oldest national park with expert guides. Family-friendly experience.",
      imageUrl: "https://images.unsplash.com/photo-1656828059237-add66db82a2b",
      location: "Uttarakhand",
      price: 2200,
      slots: {
        create: [
          {
            date: new Date("2025-11-11"),
            time: "6:00 AM",
            totalSlots: 12,
            bookedSlots: 8,
          },
          {
            date: new Date("2025-11-11"),
            time: "3:30 PM",
            totalSlots: 12,
            bookedSlots: 6,
          },
          {
            date: new Date("2025-11-12"),
            time: "6:00 AM",
            totalSlots: 10,
            bookedSlots: 10,
          },
          {
            date: new Date("2025-11-13"),
            time: "6:30 AM",
            totalSlots: 12,
            bookedSlots: 3,
          },
          {
            date: new Date("2025-11-15"),
            time: "4:00 PM",
            totalSlots: 10,
            bookedSlots: 0,
          },
        ],
      },
    },
  });

  // Experience 7: Rock Climbing in Hampi
  await prisma.experience.create({
    data: {
      title: "Rock Climbing in Hampi",
      description:
        "Challenge yourself on Hampi's world-famous granite boulders that attract climbers globally. With over 200 established routes ranging from beginner to expert levels, climb amidst 14th-century ruins and surreal landscapes. All equipment provided, and professional instructors guide you through proper techniques and safety protocols for an unforgettable climbing adventure.",
      about:
        "Climb unique granite rocks with stunning historical backdrop. Minimum age: 12 years.",
      imageUrl: "https://images.unsplash.com/photo-1575119449147-ff1d840b2779",
      location: "Karnataka",
      price: 1500,
      slots: {
        create: [
          {
            date: new Date("2025-11-09"),
            time: "7:30 AM",
            totalSlots: 6,
            bookedSlots: 2,
          },
          {
            date: new Date("2025-11-09"),
            time: "4:00 PM",
            totalSlots: 6,
            bookedSlots: 4,
          },
          {
            date: new Date("2025-11-10"),
            time: "8:00 AM",
            totalSlots: 8,
            bookedSlots: 1,
          },
          {
            date: new Date("2025-11-12"),
            time: "7:00 AM",
            totalSlots: 6,
            bookedSlots: 0,
          },
          {
            date: new Date("2025-11-16"),
            time: "3:30 PM",
            totalSlots: 5,
            bookedSlots: 3,
          },
        ],
      },
    },
  });

  // Experience 8: Kayaking in Andaman Islands
  await prisma.experience.create({
    data: {
      title: "Kayaking in Andaman Islands",
      description:
        "Paddle through turquoise waters exploring hidden coves, mangrove forests, and untouched beaches of Havelock and Neil Islands. Glide over vibrant coral reefs where you can spot tropical fish, rays, and sea turtles beneath your kayak. Both single and tandem kayaks available with life jackets and waterproof bags provided for your belongings.",
      about:
        "Explore mangroves and pristine beaches by kayak. Minimum age: 10 years.",
      imageUrl: "https://images.unsplash.com/photo-1731934314669-3bd4cf307096",
      location: "Andaman and Nicobar",
      price: 2000,
      slots: {
        create: [
          {
            date: new Date("2025-11-05"),
            time: "9:00 AM",
            totalSlots: 10,
            bookedSlots: 6,
          },
          {
            date: new Date("2025-11-05"),
            time: "1:00 PM",
            totalSlots: 10,
            bookedSlots: 8,
          },
          {
            date: new Date("2025-11-07"),
            time: "10:00 AM",
            totalSlots: 8,
            bookedSlots: 3,
          },
          {
            date: new Date("2025-11-11"),
            time: "9:30 AM",
            totalSlots: 10,
            bookedSlots: 0,
          },
          {
            date: new Date("2025-11-13"),
            time: "2:00 PM",
            totalSlots: 8,
            bookedSlots: 5,
          },
          {
            date: new Date("2025-11-15"),
            time: "11:00 AM",
            totalSlots: 10,
            bookedSlots: 2,
          },
        ],
      },
    },
  });

  // Experience 9: Skydiving in Mysore
  await prisma.experience.create({
    data: {
      title: "Skydiving in Mysore",
      description:
        "Take the leap from 10,000 feet and experience 45-60 seconds of pure freefall before your parachute deploys for a peaceful 5-minute descent. Witness breathtaking aerial views of Mysore Palace, Chamundi Hills, and surrounding landscapes. All jumps are tandem with internationally certified instructors, making this bucket-list experience accessible to first-time skydivers.",
      about:
        "Experience the ultimate adrenaline rush with tandem skydiving. Minimum age: 18 years.",
      imageUrl: "https://images.unsplash.com/photo-1630879937467-4afa290b1a6b",
      location: "Mysore",
      price: 28000,
      slots: {
        create: [
          {
            date: new Date("2025-11-12"),
            time: "8:00 AM",
            totalSlots: 3,
            bookedSlots: 2,
          },
          {
            date: new Date("2025-11-14"),
            time: "9:00 AM",
            totalSlots: 4,
            bookedSlots: 1,
          },
          {
            date: new Date("2025-11-16"),
            time: "8:30 AM",
            totalSlots: 3,
            bookedSlots: 3,
          },
          {
            date: new Date("2025-11-18"),
            time: "7:30 AM",
            totalSlots: 4,
            bookedSlots: 0,
          },
        ],
      },
    },
  });

  // Experience 10: Zip Lining in Munnar
  await prisma.experience.create({
    data: {
      title: "Zip Lining in Munnar",
      description:
        "Zoom across India's longest zipline stretching over 1.8 kilometers through misty hills covered in emerald tea plantations. Reach speeds up to 80 km/h while enjoying panoramic views of the Western Ghats. Multiple ziplines of varying lengths and heights available, including a thrilling Superman-style zipline where you fly horizontally facing the ground.",
      about:
        "Glide through misty hills and lush greenery on India's longest zipline. Minimum age: 8 years.",
      imageUrl: "https://images.unsplash.com/photo-1675259113512-db50297ce326",
      location: "Kerala",
      price: 1200,
      slots: {
        create: [
          {
            date: new Date("2025-11-06"),
            time: "10:30 AM",
            totalSlots: 12,
            bookedSlots: 7,
          },
          {
            date: new Date("2025-11-06"),
            time: "2:30 PM",
            totalSlots: 12,
            bookedSlots: 10,
          },
          {
            date: new Date("2025-11-08"),
            time: "11:00 AM",
            totalSlots: 15,
            bookedSlots: 4,
          },
          {
            date: new Date("2025-11-10"),
            time: "1:30 PM",
            totalSlots: 12,
            bookedSlots: 0,
          },
          {
            date: new Date("2025-11-13"),
            time: "10:00 AM",
            totalSlots: 15,
            bookedSlots: 9,
          },
          {
            date: new Date("2025-11-17"),
            time: "3:00 PM",
            totalSlots: 10,
            bookedSlots: 1,
          },
        ],
      },
    },
  });

  console.log(
    "-------------------------------------------------------------------"
  );
  console.log(
    "Seeding completed successfully with 10 experiences and promo codes!"
  );
  console.log(
    "-------------------------------------------------------------------"
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seeding failed:", e);
    await prisma.$disconnect();
  });
