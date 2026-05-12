import { notFound } from "next/navigation";
import { getApp } from "../../../../../apps/registry";
import UnlockForm from "./UnlockForm";

export default async function UnlockPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { slug } = await params;
  const { next, error } = await searchParams;
  const app = getApp(slug);
  if (!app || !app.private) notFound();

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 mx-auto flex items-center justify-center mb-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "2px solid rgba(0,0,0,0.08)",
              borderRadius: "14px",
              boxShadow:
                "inset 2px 2px 4px rgba(255,255,255,0.4), inset -2px -2px 4px rgba(0,0,0,0.08), 0 4px 14px rgba(0,0,0,0.1)",
            }}
          >
            <span className="text-5xl">{app.icon}</span>
          </div>
          <h1 className="text-2xl font-bold text-coal">{app.name}</h1>
          <p className="text-coal/60 text-sm mt-2">🔒 private — password required</p>
        </div>

        <UnlockForm slug={slug} next={next ?? `/apps/${slug}`} />

        {error === "1" && (
          <p className="text-red-600 text-sm text-center mt-4">
            Wrong password. Try again.
          </p>
        )}
      </div>
    </main>
  );
}
