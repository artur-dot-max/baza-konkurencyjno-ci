"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/organizations${query}`);
      const data = await res.json();
      if (data.data) {
        setOrgs(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/organizations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrgs();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-navy-900">Zarządzanie organizacjami</h1>

      <div className="flex gap-4">
        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Wszystkie statusy</option>
          <option value="ACTIVE">Aktywne</option>
          <option value="PENDING">Oczekujące</option>
          <option value="BLOCKED">Zablokowane</option>
        </select>
      </div>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nazwa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Województwo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rejestracja</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcje</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-4">Ładowanie...</td></tr>
            ) : orgs.map((org) => (
              <tr key={org.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{org.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{org.nip}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{org.voivodeship}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    org.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                    org.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {org.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(org.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  {org.status === "PENDING" && (
                    <Button variant="outline" size="sm" onClick={() => updateStatus(org.id, "ACTIVE")}>
                      Akceptuj
                    </Button>
                  )}
                  {org.status === "ACTIVE" && (
                    <Button variant="outline" size="sm" onClick={() => updateStatus(org.id, "BLOCKED")}>
                      Zablokuj
                    </Button>
                  )}
                  {org.status === "BLOCKED" && (
                    <Button variant="outline" size="sm" onClick={() => updateStatus(org.id, "ACTIVE")}>
                      Odblokuj
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
