"use client";

export default function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="mt-4 rounded-full border border-red-300 px-4 py-2 text-sm font-semibold transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
    >
      Réessayer
    </button>
  );
}
