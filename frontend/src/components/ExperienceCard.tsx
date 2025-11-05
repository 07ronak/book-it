import Link from "next/link";

interface ExperienceCardProps {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  location: string;
}

export default function ExperienceCard({
  id,
  title,
  description,
  imageUrl,
  price,
  location,
}: ExperienceCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition w-full flex flex-col sm:max-w-none md:max-w-[400px] lg:max-w-[500px]">
      {/* Image*/}
      <div className="relative w-full aspect-video">
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Content - Increased height */}
      <div className="flex flex-col justify-between p-3 space-y-4 bg-gray-100 grow">
        {/* Title + Location */}
        <div className="flex justify-between items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-800 truncate">
            {title}
          </h2>
          <span className="text-xs bg-gray-200 text-black px-2 py-0.5 rounded-md whitespace-nowrap">
            {location}
          </span>
        </div>
        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
        {/* Price + Button */}
        <div className="flex justify-between items-center pt-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-700">From</span>
            <span className="text-md font-semibold text-gray-900">
              ₹{price}
            </span>
          </div>
          <Link
            href={`/experiences/${id}`}
            className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-medium text-xs px-2 py-1.5 rounded-md transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
