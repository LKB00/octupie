import { redirect } from "next/navigation";

export default async function CreatorHome({ params }: PageProps<"/c/[creatorId]">) {
  const { creatorId } = await params;
  redirect(`/c/${creatorId}/home`);
}
