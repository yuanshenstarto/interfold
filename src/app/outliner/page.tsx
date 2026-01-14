/**
 * Outliner page - main outline editor interface
 * Requires authentication (redirects to home if not logged in)
 */

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "~/server/better-auth";
import { OutlineEditor } from "./_components/OutlineEditor";

export default async function OutlinerPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to home if not authenticated
  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Interfold Outliner</h1>
          <p className="mt-2 text-gray-600">
            Your knowledge, infinite perspectives
          </p>
        </header>

        <OutlineEditor />
      </div>
    </main>
  );
}
