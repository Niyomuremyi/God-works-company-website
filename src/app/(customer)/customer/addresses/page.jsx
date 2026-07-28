"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getCustomerAddresses, deleteAddress, ApiError } from "@/lib/api";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    getCustomerAddresses()
      .then(setAddresses)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load addresses"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

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
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        }
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && addresses.length === 0 ? (
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
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{address.name}</p>
                  <p>{address.line1}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  <p>{address.city}, {address.postcode}</p>
                  <p>{address.country}</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-zinc-400 hover:text-zinc-700" aria-label="Edit address">
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