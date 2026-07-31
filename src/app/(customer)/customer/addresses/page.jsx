"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Pencil, Trash2, Star, X } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { getCustomerAddresses, createAddress, updateAddress, deleteAddress, ApiError } from "@/lib/api";

const emptyForm = {
  label: "Home",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  postcode: "",
  country: "",
  isDefault: false,
};

export default function AddressesPage() {
  const router = useRouter();
  const { ready, isLoggedIn } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getCustomerAddresses()
      .then(setAddresses)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load addresses"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn) {
      router.push("/login?redirect=/customer/addresses");
      return;
    }
    load();
  }, [ready, isLoggedIn]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (address) => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      name: address.name,
      phone: address.phone || "",
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      postcode: address.postcode || "",
      country: address.country,
      isDefault: address.isDefault,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateAddress(editingId, form);
      } else {
        await createAddress(form);
      }
      closeForm();
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const previous = addresses;
    setAddresses((current) => current.filter((a) => a.id !== id));
    try {
      await deleteAddress(id);
    } catch (err) {
      setAddresses(previous);
      alert(err instanceof ApiError ? err.message : "Failed to delete address");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Addresses"
        subtitle="Manage your saved shipping addresses"
        action={
          <Button className="w-full sm:w-auto" onClick={openAddForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        }
      />

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {editingId ? "Edit Address" : "New Address"}
            </h2>
            <button type="button" onClick={closeForm} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Label (e.g. Home, Work)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
            <Input className="sm:col-span-2" placeholder="Address line 1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
            <Input className="sm:col-span-2" placeholder="Address line 2 (optional)" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
            <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <Input placeholder="Postcode" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} />
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300"
            />
            Set as default address
          </label>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Address"}</Button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && addresses.length === 0 && !formOpen ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Add an address to speed up checkout next time."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
            >
              <div className="flex items-start justify-between">
                <div className="text-sm text-zinc-700 dark:text-zinc-300">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {address.label}
                    </span>
                    {address.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <Star className="h-3 w-3 fill-current" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{address.name}</p>
                  <p>{address.line1}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  <p>{address.city}{address.postcode ? `, ${address.postcode}` : ""}</p>
                  <p>{address.country}</p>
                  {address.phone && <p className="mt-1 text-zinc-500 dark:text-zinc-400">{address.phone}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    aria-label="Edit address"
                    onClick={() => openEditForm(address)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="text-zinc-400 hover:text-red-600"
                    aria-label="Delete address"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}