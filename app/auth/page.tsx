"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);

    if (isSignup) {
      if (!username.trim()) {
        alert("Username required");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            username: username.trim().toLowerCase(),
          },
        ]);

        if (profileError) {
          alert(profileError.message);
          setLoading(false);
          return;
        }
      }

      router.push("/feed");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      router.push("/feed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
      <h1 className="text-xl">{isSignup ? "create account" : "login"}</h1>

      {isSignup && (
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-neutral-900 p-2 w-64"
        />
      )}

      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-neutral-900 p-2 w-64"
      />

      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-neutral-900 p-2 w-64"
      />

      <button
        onClick={handleAuth}
        disabled={loading}
        className="bg-white text-black px-6 py-2"
      >
        {loading ? "processing..." : isSignup ? "sign up" : "login"}
      </button>

      <button
        onClick={() => setIsSignup(!isSignup)}
        className="text-sm text-neutral-400"
      >
        {isSignup ? "already have account? login" : "create account"}
      </button>
    </div>
  );
}
