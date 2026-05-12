"use client";

export default function UnlockForm({
  slug,
  next,
}: {
  slug: string;
  next: string;
}) {
  return (
    <form action="/api/apps/unlock" method="POST" className="space-y-3">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="next" value={next} />
      <input
        type="password"
        name="password"
        autoFocus
        placeholder="Password"
        className="w-full px-4 py-3 border-2 border-coal/10 rounded-sm bg-white text-coal focus:outline-none focus:border-grass"
        style={{ fontSize: "16px" }}
      />
      <button
        type="submit"
        className="w-full bg-grass text-white font-semibold py-3 rounded-sm border-2 border-coal/10 hover:bg-grass-light transition-colors"
      >
        Unlock
      </button>
    </form>
  );
}
