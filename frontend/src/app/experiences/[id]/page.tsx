import ExperienceDetailsPage from "@/components/ExperienceDetailsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ExperienceDetailsPage experienceId={id} />;
}
