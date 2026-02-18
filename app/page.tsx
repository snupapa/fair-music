"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const quotes = [
  "no algorithm decides what you hear.",
  "rate the music. not the ego.",
  "chronological. like it’s 2008.",
  "sound over clout.",
  "listen first.",
  "no boosts. just drops.",
  "mid is allowed. be honest.",
  "press play."
];

export default function Home() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const random =
      quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(random);
  }, []);

  const handleEnter = () => {
    setVisible(false);
    setTimeout(() => {
      router.push("/feed");
    }, 400);
  };

  return (
    <div
      className={`min-h-screen bg-black text-white flex flex-col items-center justify-center transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <p className="text-2xl text-center px-6">
        {quote}
      </p>

      <button
        onClick={handleEnter}
        className="mt-8 text-sm underline hover:opacity-70 transition"
      >
        enter
      </button>
    </div>
  );
}
