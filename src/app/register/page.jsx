"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { ready, isLoggedIn, user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
    shopName: "",
    phone: "",
    address: "",
    tin: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (isLoggedIn) {
      router.replace(user.role === "seller" ? "/admin" : "/");
    }
  }, [ready, isLoggedIn, user]);

  const isSeller = form.role === "seller";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      router.push("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!ready || isLoggedIn) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold">Create an account</h1>

      <div className="flex rounded-md border border-zinc-300 p-1">
        <button
          type="button"
          onClick={() => setForm({ ...form, role: "buyer" })}
          className={`flex-1 rounded py-2 text-sm font-medium ${
            !isSeller ? "bg-zinc-900 text-white" : "text-zinc-600"
          }`}
        >
          Buyer
        </button>
        <button
          type="button"
          onClick={() => setForm({ ...form, role: "seller" })}
          className={`flex-1 rounded py-2 text-sm font-medium ${
            isSeller ? "bg-zinc-900 text-white" : "text-zinc-600"
          }`}
        >
          Seller
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>

        {isSeller && (
          <>
            <div>
              <Label htmlFor="shopName">Shop / Business Name</Label>
              <Input id="shopName" name="shopName" value={form.shopName} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="address">Business Address</Label>
              <Input id="address" name="address" value={form.address} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="tin">TIN</Label>
              <Input id="tin" name="tin" value={form.tin} onChange={handleChange} required />
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </Button>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-zinc-900 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}