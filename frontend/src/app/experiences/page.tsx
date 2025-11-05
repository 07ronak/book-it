import ExperienceCard from "@/components/ExperienceCard";

export const dynamic = "force-dynamic"; // ensures fresh data every time

async function getExperiences(search?: string) {
  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/experiences`);
  if (search) url.searchParams.set("search", search);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch experiences");

  const data = await res.json();
  return data.data;
}

export default async function ExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  // await the Promise before using it
  const params = await searchParams;
  const search = params?.search || "";

  const experiences = await getExperiences(search);

  return (
    <section className="p-4">
      {experiences.length === 0 ? (
        <p className="text-center text-gray-500">No experiences found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))] justify-items-center">
          {experiences.map((exp: any) => (
            <ExperienceCard
              key={exp.id}
              id={exp.id}
              title={exp.title}
              description={exp.description}
              imageUrl={exp.imageUrl || "/placeholder.jpg"}
              price={exp.price}
              location={exp.location}
            />
          ))}
        </div>
      )}
    </section>
  );
}
