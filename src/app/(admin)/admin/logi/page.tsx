"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auditlogs`);
      const data = await res.json();
      if (data.data) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-navy-900">Logi systemowe</h1>

      <div className="bg-white rounded-md shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Użytkownik</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operacja</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Encja</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Encji</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adres IP</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-4">Ładowanie...</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(log.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.user?.email || "System"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{log.action}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{log.entityType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{log.entityId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
