"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, MapPin, ChevronRight, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  getProductBySlug,
  createOrder,
  getCustomerProfile,
  getCustomerAddresses,
  ApiError,
} from "@/lib/api";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="h-8 w-40 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="mt-6 h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, ready, isLoggedIn } = useAuth();

  const slug = searchParams.get("slug");
  const productId = Number(searchParams.get("productId"));
  const variantId = searchParams.get("variantId") ? Number(searchParams.get("variantId")) : null;
  const qty = Number(searchParams.get("qty")) || 1;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [checkingOutAsGuest, setCheckingOutAsGuest] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    paymentMethod: "cod",
  });

  // Load product
  useEffect(() => {
    if (!slug) {
      setError("Missing product — please go back and try again.");
      setLoading(false);
      return;
    }
    getProductBySlug(slug)
      .then(setProduct)
      .catch(() => setError("Could not load this product."))
      .finally(() => setLoading(false));
  }, [slug]);

  // If logged in, pull profile + saved addresses to prefill the form.
  // ASSUMPTION — adjust field names if your API returns different shapes:
  //   getCustomerProfile()  -> { name, email, phone }
  //   getCustomerAddresses() -> [{ id, label, address, isDefault }]
  useEffect(() => {
    if (!ready || !isLoggedIn) return;

    getCustomerProfile()
      .then((profile) => {
        setForm((f) => ({
          ...f,
          customerName: profile?.name ?? user?.name ?? "",
          customerEmail: profile?.email ?? user?.email ?? "",
          customerPhone: profile?.phone ?? "",
        }));
      })
      .catch(() => {
        setForm((f) => ({ ...f, customerName: user?.name ?? "", customerEmail: user?.email ?? "" }));
      });

    getCustomerAddresses()
      .then((list) => {
        setAddresses(list || []);
        const defaultAddr = list?.find((a) => a.isDefault) ?? list?.[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setForm((f) => ({ ...f, shippingAddress: defaultAddr.address }));
        } else {
          setUseNewAddress(true);
        }
      })
      .catch(() => setUseNewAddress(true));
  }, [ready, isLoggedIn, user]);

  const variant = product?.variants?.find((v) => v.id === variantId);
  const subtotal = product ? Number(product.price) * qty : 0;
  const total = subtotal; // add shipping/tax lines here if/when they exist

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    setUseNewAddress(false);
    const addr = addresses.find((a) => a.id === addressId);
    if (addr) setForm((f) => ({ ...f, shippingAddress: addr.address }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const order = await createOrder({
        ...form,
        items: [{ productId, variantId, quantity: qty }],
      });
      router.push(`/order-confirmation/${order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong placing your order.");
      setSubmitting(false);
    }
  };

  if (loading) return <CheckoutSkeleton />;

  if (error && !product) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const showAccountPrompt = ready && !isLoggedIn && !checkingOutAsGuest;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">Checkout</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column — account state + form */}
        <div className="space-y-6">
          {showAccountPrompt && (
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-zinc-100 p-2 dark:bg-zinc-800">
                  <LogIn className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    Sign in to check out faster
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Save your address and track this order from your account.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      onClick={() => router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                    >
                      Sign in
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/register")}>
                      Create account
                    </Button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckingOutAsGuest(true)}
                className="mt-4 flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Continue as guest
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {isLoggedIn && (
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-zinc-100 p-1.5 dark:bg-zinc-800">
                  <User className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  Checking out as <span className="font-medium">{user?.name}</span>
                </span>
              </div>
            </div>
          )}

          {(!showAccountPrompt) && (
            <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <input
                    required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Email">
                  <input
                    required
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Phone (optional)">
                <input
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Shipping address</label>
                  {isLoggedIn && addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUseNewAddress((v) => !v)}
                      className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      {useNewAddress ? "Use a saved address" : "Enter a different address"}
                    </button>
                  )}
                </div>

                {isLoggedIn && addresses.length > 0 && !useNewAddress ? (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${
                          selectedAddressId === addr.id
                            ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800"
                            : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          className="mt-1"
                          checked={selectedAddressId === addr.id}
                          onChange={() => handleAddressSelect(addr.id)}
                        />
                        <div>
                          {addr.label && <p className="font-medium text-zinc-900 dark:text-zinc-100">{addr.label}</p>}
                          <p className="text-zinc-500 dark:text-zinc-400">{addr.address}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    required
                    rows={3}
                    placeholder="Street address, city, region, postal code"
                    value={form.shippingAddress}
                    onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                    className={inputClass}
                  />
                )}
              </div>

              <Field label="Payment method">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "cod", label: "Cash on delivery" },
                    { value: "card", label: "Card" },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setForm({ ...form, paymentMethod: opt.value })}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                        form.paymentMethod === opt.value
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                          : "border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Placing order..." : `Place order — $${total.toFixed(2)}`}
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Your information is only shared with the seller fulfilling this order
              </p>
            </form>
          )}
        </div>

        {/* Right column — order summary */}
        <div className="h-fit space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-6">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Order summary</h2>
          {product && (
            <div className="flex gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <img
                src={product.image}
                alt={product.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">{product.name}</p>
                {variant && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {variant.color} · {variant.size}
                  </p>
                )}
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Qty: {qty}</p>
              </div>
              <p className="whitespace-nowrap font-medium text-zinc-900 dark:text-zinc-100">
                ${subtotal.toFixed(2)}
              </p>
            </div>
          )}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Shipping</span>
              <span>Calculated at delivery</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-zinc-100 pt-3 font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-800";