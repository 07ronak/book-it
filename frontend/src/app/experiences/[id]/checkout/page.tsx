// app/experiences/[id]/checkout/page.tsx
import CheckoutPage from "@/components/CheckoutPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CheckoutPage experienceId={id} />;
}
