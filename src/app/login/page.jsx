"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/api";
import { setSession, useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { ready, isLoggedIn, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (isLoggedIn) {
      router.replace(user.role === "seller" ? "/admin" : "/");
    }
  }, [ready, isLoggedIn, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(form);
      setSession(data.token, data.user);
      router.push(data.user.role === "seller" ? "/admin" : "/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Avoid a flash of the login form before we know the auth state,
  // and avoid rendering it at all once we know a redirect is happening.
  if (!ready || isLoggedIn) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold">Log in</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-zinc-500 hover:text-zinc-700">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>

        <p className="text-center text-sm text-zinc-500">
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-zinc-900 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}