"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const link = (path: string, label: string) => (
    <button
      onClick={() => router.push(path)}
      className={`hover:opacity-60 transition ${
        pathname === path ? "text-white" : "text-neutral-500"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-xl flex justify-between py-4 px-4 text-sm border-b border-neutral-800">
      {link("/feed", "feed")}
      {link("/music", "music")}
      {link("/profile", "profile")}
    </div>
  );
}
