import { redirect } from 'next/navigation';

export default async function StudentBuyPagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Redirect to top-up page
  redirect(`/${locale}/student/top-up`);
}
