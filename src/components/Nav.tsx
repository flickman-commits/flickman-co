"use client";

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <a href="#" className="font-[family-name:var(--font-pixel)] text-sm text-coal hover:text-grass transition-colors">
          Flickman &amp; Co.
        </a>
      </div>
    </nav>
  );
}
