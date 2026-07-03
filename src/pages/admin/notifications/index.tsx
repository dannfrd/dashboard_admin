import React, { useState, useMemo } from "react";
import Link from "next/link";
import { listNotifications, NotificationItem, sendStoredNotification, deleteNotification } from "@/lib/dermifyApi";

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingId, setSendingId] = useState<number | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    listNotifications()
      .then((res) => setItems(res.items || []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleSend(id: number) {
    if (!confirm("Send this notification to target users now?")) return;
    setSendingId(id);
    try {
      await sendStoredNotification(id);
      load();
    } catch (err: any) {
      alert(err?.message || "Failed to send notification");
    } finally {
      setSendingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this notification permanently from the system?")) return;
    try {
      await deleteNotification(id);
      load();
    } catch (err: any) {
      alert(err?.message || "Failed to delete notification");
    }
  }

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.body && item.body.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  // Calculate statistics from current items
  const stats = useMemo(() => {
    const counts = { sent: 0, scheduled: 0, draft: 0, failed: 0 };
    items.forEach((item) => {
      const status = (item.status || "draft").toLowerCase() as keyof typeof counts;
      if (status in counts) {
        counts[status]++;
      } else {
        counts.draft++;
      }
    });
    return counts;
  }, [items]);

  function formatDate(dateString?: string | null) {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            Notification Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create, manage, and send push notifications to your mobile app users.</p>
        </div>
        <Link
          href="/admin/notifications/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Notification
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sent */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sent</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.sent}</h3>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500" />
        </div>

        {/* Scheduled */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Scheduled</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.scheduled}</h3>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-500" />
        </div>

        {/* Drafts */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Draft</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.draft}</h3>
            </div>
            <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-400" />
        </div>

        {/* Failed */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Failed</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.failed}</h3>
            </div>
            <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-rose-500" />
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or message..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-white text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Notifications Table */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error loading notifications: {error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/50 bg-white p-20 shadow-sm text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-slate-500 font-medium">Loading notification data...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">Notification</th>
                  <th className="px-6 py-4">Target</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Schedule / Send</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                      {searchQuery ? "No matching results found." : "No notification history available."}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((it, index) => {
                    const statusClass = 
                      it.status === "sent" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      it.status === "scheduled" ? "bg-blue-50 text-blue-700 border-blue-100" :
                      it.status === "failed" ? "bg-rose-50 text-rose-700 border-rose-100" :
                      "bg-slate-100 text-slate-700 border-slate-200";

                    const statusDot = 
                      it.status === "sent" ? "bg-emerald-500 animate-pulse" :
                      it.status === "scheduled" ? "bg-blue-500 animate-pulse" :
                      it.status === "failed" ? "bg-rose-500" :
                      "bg-slate-400";

                    return (
                      <tr key={it.id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{index + 1}</td>
                        <td className="px-6 py-4 max-w-xs sm:max-w-md">
                          <div className="font-semibold text-slate-900 truncate">{it.title}</div>
                          {it.body && <div className="text-xs text-slate-400 line-clamp-2 mt-0.5">{it.body}</div>}
                        </td>
                        <td className="px-6 py-4">
                          {it.topic ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 border border-teal-100/50">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 20l4-16m2 16l4-16" />
                              </svg>
                              Topic: {it.topic}
                            </span>
                          ) : it.tokens && it.tokens.length > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              {it.tokens.length} Devices
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${statusClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                            {it.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs space-y-0.5">
                          {it.status === "sent" ? (
                            <div>
                              <span className="text-slate-400">Sent:</span>
                              <div className="font-semibold text-slate-700">{formatDate(it.sent_at)}</div>
                            </div>
                          ) : it.scheduled_at ? (
                            <div>
                              <span className="text-slate-400">Scheduled:</span>
                              <div className="font-semibold text-slate-700">{formatDate(it.scheduled_at)}</div>
                            </div>
                          ) : (
                            <div>
                              <span className="text-slate-400">Created:</span>
                              <div className="font-semibold text-slate-700">{formatDate(it.created_at)}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Link
                              href={`/admin/notifications/${it.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            {it.status !== "sent" && (
                              <>
                                <Link
                                  href={`/admin/notifications/${it.id}/edit`}
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </Link>
                                <button
                                  onClick={() => handleSend(it.id)}
                                  disabled={sendingId === it.id}
                                  className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                                    sendingId === it.id 
                                      ? "text-slate-400 cursor-not-allowed" 
                                      : "text-indigo-600 hover:text-indigo-700"
                                  }`}
                                >
                                  {sendingId === it.id ? (
                                    <>
                                      <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                                      Send...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                      </svg>
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(it.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

