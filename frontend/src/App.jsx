import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "./api";
import AuthPage from "./AuthPage";
import "./App.css";
import {
  addRequest,
  deleteRequest,
  setRequests,
  updateStatus,
} from "./redux/requestSlice";

const categoryIcons = {
  Electrical: "⚡",
  Plumbing: "💧",
  Internet: "📶",
  Furniture: "🪑",
  Cleaning: "🧹",
  Other: "🔧",
};
const requestStatuses = ["Pending", "In Progress", "Resolved"];

function normalizeRequest(request) {
  return {
    ...request,
    id: request._id,
    icon: categoryIcons[request.category] || categoryIcons.Other,
    date: request.createdAt ? new Date(request.createdAt).toLocaleString() : "Just now",
  };
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("fixflow_token"));
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem("fixflow_token")));
  const [apiError, setApiError] = useState("");
  const dispatch = useDispatch();

  // Getting requests from Redux Store
  const requests = useSelector(
    (state) => state.requests.requests
  );

  const [showForm, setShowForm] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [searchText, setSearchText] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() =>
    JSON.parse(localStorage.getItem("fixflow_read_notifications") || "[]")
  );
  const [compactMode, setCompactMode] = useState(() =>
    localStorage.getItem("fixflow_compact") === "true"
  );
  const [emailUpdates, setEmailUpdates] = useState(() =>
    localStorage.getItem("fixflow_email_updates") !== "false"
  );
  const [profileName, setProfileName] = useState("");
  const [profileRoom, setProfileRoom] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electrical");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    api("/auth/me", { token })
      .then(({ user: currentUser }) => {
        if (!active) return;
        setUser(currentUser);
        setProfileName(currentUser.name);
        setProfileRoom(currentUser.room || "");
        return api("/requests", { token });
      })
      .then((result) => {
        if (active && result) dispatch(setRequests(result.requests.map(normalizeRequest)));
      })
      .catch((error) => {
        if (!active) return;
        if (error.message.includes("session") || error.message.includes("sign in")) {
          localStorage.removeItem("fixflow_token");
          setToken(null);
        }
        setApiError(error.message);
      })
      .finally(() => { if (active) setAuthLoading(false); });

    return () => { active = false; };
  }, [token, dispatch]);

  // Statistics
  const totalRequests = requests.length;

  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const progressRequests = requests.filter(
    (request) => request.status === "In Progress"
  ).length;
  const resolvedRequests = requests.filter(
    (request) => request.status === "Resolved"
  ).length;

  const resolutionRate =
    totalRequests > 0
      ? Math.round((resolvedRequests / totalRequests) * 100)
      : 0;

  // Submit Request
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setApiError("Please enter an issue title and description.");
      return;
    }

    try {
      const { request } = await api("/requests", {
        method: "POST",
        token,
        body: JSON.stringify({ title, category, priority, description }),
      });
      dispatch(addRequest(normalizeRequest(request)));
      setTitle("");
      setCategory("Electrical");
      setPriority("Medium");
      setDescription("");
      setShowForm(false);
      setApiError("");
    } catch (error) {
      setApiError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this request? This cannot be undone.")) return;
    try {
      await api(`/requests/${id}`, { method: "DELETE", token });
      dispatch(deleteRequest(id));
      setApiError("");
    } catch (error) {
      setApiError(error.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api(`/requests/${id}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status }),
      });
      dispatch(updateStatus({ id, status }));
      setApiError("");
    } catch (error) {
      setApiError(error.message);
    }
  };

  const handleAuthenticated = ({ user: currentUser, token: sessionToken }) => {
    localStorage.setItem("fixflow_token", sessionToken);
    setUser(currentUser);
    setProfileName(currentUser.name);
    setProfileRoom(currentUser.room || "");
    setActiveView("dashboard");
    setAuthLoading(true);
    setToken(sessionToken);
  };

  const handleSignOut = async () => {
    try { await api("/auth/logout", { method: "POST", token }); } catch { /* Clear local session even if the server is unavailable. */ }
    localStorage.removeItem("fixflow_token");
    setToken(null);
    setUser(null);
    setActiveView("dashboard");
    dispatch(setRequests([]));
  };

  const navigateTo = (view) => {
    setActiveView(view);
    setNotificationOpen(false);
    if (view === "notifications") {
      const nextRead = requests.filter((request) => request.status === "Pending").map((request) => request.id);
      const allRead = [...new Set([...readNotifications, ...nextRead])];
      setReadNotifications(allRead);
      localStorage.setItem("fixflow_read_notifications", JSON.stringify(allRead));
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      const { user: updatedUser } = await api("/auth/me", {
        method: "PATCH",
        token,
        body: JSON.stringify({ name: profileName, room: profileRoom }),
      });
      setUser(updatedUser);
      setApiError("");
    } catch (error) {
      setApiError(error.message);
    }
  };

  const markAllNotificationsRead = () => {
    const nextRead = requests.filter((request) => request.status === "Pending").map((request) => request.id);
    const allRead = [...new Set([...readNotifications, ...nextRead])];
    setReadNotifications(allRead);
    localStorage.setItem("fixflow_read_notifications", JSON.stringify(allRead));
  };

  if (authLoading) {
    return <div className="loading-screen">Loading your FixFlow workspace…</div>;
  }

  if (!token || !user) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className={`min-h-screen bg-slate-100 flex ${compactMode ? "compact-mode" : ""}`}>

      {/* ================= SIDEBAR ================= */}

      <aside className="hidden md:flex w-64 bg-slate-950 text-white flex-col fixed h-screen overflow-y-auto">

        <div className="px-6 py-7 border-b border-slate-800">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xl shadow-lg">
              ⚡
            </div>

            <div>
              <h1 className="text-xl font-bold">
                FixFlow
              </h1>

              <p className="text-xs text-slate-400">
                Hostel Management
              </p>
            </div>

          </div>

        </div>

        <div className="px-4 py-6 flex-1">

          <p className="text-xs uppercase tracking-wider text-slate-500 px-3 mb-3">
            Main Menu
          </p>

          <nav className="space-y-2">

            <button onClick={() => navigateTo("dashboard")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeView === "dashboard" ? "bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}>
              <span>🏠</span>
              Dashboard
            </button>

            <button onClick={() => navigateTo("requests")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeView === "requests" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white transition"}`}>
              <span>🎫</span>
              My Requests

              <span className="ml-auto bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                {totalRequests}
              </span>
            </button>

            <button onClick={() => navigateTo("analytics")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeView === "analytics" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white transition"}`}>
              <span>📊</span>
              Analytics
            </button>

            <button onClick={() => navigateTo("notifications")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeView === "notifications" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white transition"}`}>
              <span>🔔</span>
              Notifications

              {requests.some((request) => request.status === "Pending" && !readNotifications.includes(request.id)) && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>

          </nav>

          <p className="text-xs uppercase tracking-wider text-slate-500 px-3 mb-3 mt-10">
            Account
          </p>

          <nav className="space-y-2">

            <button onClick={() => navigateTo("profile")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeView === "profile" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white transition"}`}>
              <span>👤</span>
              Profile
            </button>

            <button onClick={() => navigateTo("settings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeView === "settings" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white transition"}`}>
              <span>⚙️</span>
              Settings
            </button>

          </nav>

        </div>

        <div className="p-4 border-t border-slate-800">

          <div className="flex items-center gap-3 p-3 rounded-xl">

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="font-medium">
                {user.name}
              </p>

              <p className="text-xs text-slate-500">
                Student{user.room ? ` • Room ${user.room}` : ""}
              </p>
            </div>

          </div>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="min-w-0 flex-1 md:ml-64">

        {/* TOP BAR */}

        <header className="bg-white border-b border-slate-200 px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">

          <div>

            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>

            <h2 className="text-xl font-bold text-slate-800">
              {activeView === "dashboard" ? `Welcome back, ${user.name.split(" ")[0]}` : ({ requests: "My Requests", analytics: "Analytics", notifications: "Notifications", profile: "Profile", settings: "Settings" }[activeView] || "Dashboard")}
            </h2>

          </div>

          <div className="flex items-center gap-4">

            <button onClick={() => setNotificationOpen((open) => !open)} aria-label="Open notifications" aria-expanded={notificationOpen} className="relative w-10 h-10 rounded-xl bg-slate-100">
              🔔
              {requests.some((request) => request.status === "Pending" && !readNotifications.includes(request.id)) && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>

            <button type="button" onClick={() => navigateTo("profile")} className="hidden sm:flex items-center gap-3 border-0 bg-transparent text-left cursor-pointer">

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  {user.name}
                </p>

                <p className="text-xs text-slate-500">
                  Resident
                </p>

              </div>

            </button>

          </div>

        </header>

        {notificationOpen && (
          <div className="notification-menu" role="dialog" aria-label="Recent notifications">
            <div className="notification-menu-heading"><strong>Notifications</strong><button type="button" onClick={() => { markAllNotificationsRead(); navigateTo("notifications"); }}>View all</button></div>
            {requests.filter((request) => request.status === "Pending" && !readNotifications.includes(request.id)).slice(0, 3).map((request) => (
              <button type="button" className="notification-menu-item" key={request.id} onClick={() => { setStatusFilter("Pending"); navigateTo("requests"); }}>
                <span className="notification-dot" /><span><strong>{request.title}</strong><small>Waiting for attention</small></span>
              </button>
            ))}
            {!requests.some((request) => request.status === "Pending" && !readNotifications.includes(request.id)) && <p className="notification-empty">You’re all caught up.</p>}
          </div>
        )}

        <nav className="mobile-nav" aria-label="Quick navigation">
          {[["dashboard", "Home"], ["requests", "Requests"], ["analytics", "Insights"], ["notifications", "Updates"], ["profile", "Profile"], ["settings", "Settings"]].map(([view, label]) => (
            <button type="button" key={view} className={activeView === view ? "active" : ""} onClick={() => navigateTo(view)}>{label}</button>
          ))}
        </nav>

        {/* CONTENT */}

        {apiError && <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert"><span>{apiError}</span><button className="ml-4 font-bold" type="button" onClick={() => setApiError("")} aria-label="Dismiss error">×</button></div>}

        {activeView !== "dashboard" && (
          <section className="p-6 md:p-8 view-content">
            {activeView === "requests" && <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-semibold tracking-wider text-blue-600">TRACK & MANAGE</p><h2 className="text-2xl font-bold text-slate-800 mt-1">My requests</h2></div><button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700" type="button" onClick={() => setShowForm(true)}>＋ New request</button></div>
              <div className="p-5 flex flex-wrap gap-3 border-b border-slate-100"><label className="search-control"><span aria-hidden="true">⌕</span><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search requests" /></label><select className="filter-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status"><option>All statuses</option>{requestStatuses.map((status) => <option key={status}>{status}</option>)}</select></div>
              <div className="divide-y divide-slate-100">{requests.filter((request) => `${request.title} ${request.category} ${request.description}`.toLowerCase().includes(searchText.toLowerCase()) && (statusFilter === "All statuses" || request.status === statusFilter)).map((request) => <div className="p-5 flex flex-wrap items-center gap-4" key={request.id}><span className="request-category-icon">{request.icon}</span><div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-800">{request.title}</h3><p className="text-sm text-slate-500 mt-1">{request.category} · {request.date} · {request.priority} priority</p><p className="text-sm text-slate-600 mt-2">{request.description}</p></div><div className="flex items-center gap-2"><select className="filter-control" value={request.status} onChange={(event) => handleStatusChange(request.id, event.target.value)} aria-label={`Change status for ${request.title}`}>{requestStatuses.map((status) => <option key={status}>{status}</option>)}</select><button className="delete-control" type="button" onClick={() => handleDelete(request.id)} aria-label={`Delete ${request.title}`}>×</button></div></div>)}{requests.length === 0 && <div className="p-10 text-center text-slate-500">No requests yet. Create one to get started.</div>}</div>
            </div>}

            {activeView === "analytics" && <div className="grid gap-6 lg:grid-cols-2"><div className="bg-white rounded-2xl border border-slate-200 p-6"><p className="text-xs font-semibold tracking-wider text-blue-600">YOUR CAMPUS IMPACT</p><h2 className="text-2xl font-bold text-slate-800 mt-1">Request insights</h2><div className="grid grid-cols-2 gap-4 mt-7">{[["All requests", totalRequests], ["Waiting", pendingRequests], ["In progress", progressRequests], ["Resolved", resolvedRequests]].map(([label, value]) => <div className="analytics-total" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></div><div className="bg-white rounded-2xl border border-slate-200 p-6"><p className="text-xs font-semibold tracking-wider text-blue-600">BY STATUS</p><h2 className="text-xl font-bold text-slate-800 mt-1">Resolution breakdown</h2><div className="mt-7 space-y-5">{requestStatuses.map((status) => { const count = requests.filter((request) => request.status === status).length; const percent = totalRequests ? Math.round(count / totalRequests * 100) : 0; return <div key={status}><div className="flex justify-between text-sm mb-2"><span>{status}</span><strong>{count}</strong></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${percent}%` }} /></div></div>; })}</div><p className="text-sm text-slate-500 mt-6">{resolutionRate}% of your requests are resolved.</p></div></div>}

            {activeView === "notifications" && <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden"><div className="p-6 border-b border-slate-200 flex items-center justify-between"><div><p className="text-xs font-semibold tracking-wider text-blue-600">UPDATES</p><h2 className="text-2xl font-bold text-slate-800 mt-1">Notifications</h2></div><button type="button" className="text-sm font-semibold text-blue-600" onClick={markAllNotificationsRead}>Mark all as read</button></div>{requests.length ? <div className="divide-y divide-slate-100">{[...requests].sort((a, b) => new Date(b.date) - new Date(a.date)).map((request) => <div className="p-5 flex items-center gap-4" key={request.id}><span className="request-category-icon">{request.status === "Resolved" ? "✓" : request.status === "Pending" ? "◷" : "↗"}</span><div className="flex-1"><p className="font-semibold text-slate-800">{request.title}</p><p className="text-sm text-slate-500 mt-1">{request.status === "Pending" ? "Request submitted and waiting for attention" : `Status updated to ${request.status}`} · {request.date}</p></div><span className="text-xs font-semibold text-slate-600">{request.status}</span></div>)}</div> : <div className="p-10 text-center text-slate-500">Updates about your requests will appear here.</div>}</div>}

            {activeView === "profile" && <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 max-w-2xl"><p className="text-xs font-semibold tracking-wider text-blue-600">ACCOUNT DETAILS</p><h2 className="text-2xl font-bold text-slate-800 mt-1 mb-6">Your profile</h2><form className="space-y-5" onSubmit={saveProfile}><label className="form-field">Full name<input value={profileName} onChange={(event) => setProfileName(event.target.value)} required maxLength={80} /></label><label className="form-field">Email address<input value={user.email} type="email" disabled /></label><label className="form-field">Room or unit<input value={profileRoom} onChange={(event) => setProfileRoom(event.target.value)} maxLength={40} placeholder="e.g. A-204" /></label><div className="flex justify-end"><button className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700" type="submit">Save profile</button></div></form></div>}

            {activeView === "settings" && <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 max-w-2xl"><p className="text-xs font-semibold tracking-wider text-blue-600">PREFERENCES</p><h2 className="text-2xl font-bold text-slate-800 mt-1">Settings</h2><div className="divide-y divide-slate-100 mt-5"><div className="setting-row"><span><strong>Compact request list</strong><small>Use less space for each request</small></span><input type="checkbox" checked={compactMode} onChange={(event) => { setCompactMode(event.target.checked); localStorage.setItem("fixflow_compact", String(event.target.checked)); }} aria-label="Compact request list" /></div><div className="setting-row"><span><strong>Email updates</strong><small>Preference for request status emails</small></span><input type="checkbox" checked={emailUpdates} onChange={(event) => { setEmailUpdates(event.target.checked); localStorage.setItem("fixflow_email_updates", String(event.target.checked)); }} aria-label="Email updates" /></div></div><div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between gap-4"><div><strong className="text-slate-800">Sign out</strong><p className="text-sm text-slate-500 mt-1">End this session on this device.</p></div><button type="button" className="px-4 py-2.5 rounded-lg border border-slate-300 font-semibold hover:bg-slate-50" onClick={handleSignOut}>Sign out</button></div></div>}
          </section>
        )}

        <section className={`p-6 md:p-8 ${activeView !== "dashboard" ? "hidden" : ""}`}>

          {/* HERO */}

          <div className="bg-[#17413d] rounded-2xl p-7 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">

            <div className="relative z-10 max-w-xl">

              <p className="text-emerald-100 text-sm mb-2">
                CAMPUS MAINTENANCE
              </p>

              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {totalRequests ? "Everything is under control." : "A better way to get things fixed."}
              </h1>

              <p className="text-emerald-100 mb-6">
                Raise a request, track its progress and get your hostel issues resolved faster.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="bg-white text-emerald-900 font-semibold px-6 py-3 rounded-lg hover:bg-emerald-50 transition shadow-lg"
              >
                + Create New Request
              </button>

            </div>

            <div className="hidden xl:flex absolute right-10 top-1/2 -translate-y-1/2 gap-8 border-l border-white/20 pl-8">
              <div><p className="text-xs uppercase tracking-wider text-emerald-100">Open</p><strong className="mt-2 block text-4xl">{pendingRequests + progressRequests}</strong><span className="text-sm text-emerald-100">needs attention</span></div>
              <div><p className="text-xs uppercase tracking-wider text-emerald-100">Resolved</p><strong className="mt-2 block text-4xl">{resolvedRequests}</strong><span className="text-sm text-emerald-100">closed requests</span></div>
            </div>

          </div>

          {/* STATISTICS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            {/* Total */}

            <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition">

              <div className="flex justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Total Requests
                  </p>

                  <h3 className="text-3xl font-bold text-slate-800 mt-2">
                    {totalRequests}
                  </h3>

                </div>

                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl">
                  🎫
                </div>

              </div>

              <p className="text-xs text-green-600 mt-4">
                Saved to your account
              </p>

            </div>

            {/* Pending */}

            <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition">

              <div className="flex justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Pending
                  </p>

                  <h3 className="text-3xl font-bold text-slate-800 mt-2">
                    {pendingRequests}
                  </h3>

                </div>

                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
                  ⏳
                </div>

              </div>

              <p className="text-xs text-amber-600 mt-4">
                Needs attention
              </p>

            </div>

            {/* Progress */}

            <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition">

              <div className="flex justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    In Progress
                  </p>

                  <h3 className="text-3xl font-bold text-slate-800 mt-2">
                    {progressRequests}
                  </h3>

                </div>

                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-xl">
                  🔧
                </div>

              </div>

              <p className="text-xs text-violet-600 mt-4">
                Being resolved
              </p>

            </div>

            {/* Resolved */}

            <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition">

              <div className="flex justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    Resolved
                  </p>

                  <h3 className="text-3xl font-bold text-slate-800 mt-2">
                    {resolvedRequests}
                  </h3>

                </div>

                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
                  ✓
                </div>

              </div>

              <p className="text-xs text-emerald-600 mt-4">
                {resolutionRate}% resolution rate
              </p>

            </div>

          </div>

          {/* REQUESTS */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">

              <div className="p-6 flex justify-between border-b border-slate-200">

                <div>

                  <h3 className="text-lg font-bold text-slate-800">
                    Recent Requests
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Track each repair from report to resolution
                  </p>

                </div>

                <span className="text-sm text-blue-600 font-semibold">
                  {totalRequests} Total
                </span>

              </div>

              <div className="divide-y divide-slate-100">

                {requests.length === 0 && (
                  <div className="px-6 py-10 text-center">
                    <p className="font-semibold text-slate-700">Nothing to repair yet</p>
                    <p className="mt-1 text-sm text-slate-500">Your submitted requests and their updates will appear here.</p>
                    <button type="button" onClick={() => setShowForm(true)} className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-900">Create your first request →</button>
                  </div>
                )}

                {requests.map((request) => (

                  <div
                    key={request.id}
                    className="p-5 hover:bg-slate-50 transition"
                  >

                    <div className="flex items-center gap-4">

                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                        {request.icon}
                      </div>

                      <div className="flex-1">

                        <h4 className="font-semibold text-slate-800">
                          {request.title}
                        </h4>

                        <p className="text-sm text-slate-500 mt-1">
                          {request.category} • {request.date}
                        </p>

                      </div>

                      <div className="text-right">

                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            request.status === "Resolved"
                              ? "bg-emerald-100 text-emerald-700"
                              : request.status === "Pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {request.status}
                        </span>

                        <p className="text-xs text-red-500 mt-2">
                          {request.priority} Priority
                        </p>

                      </div>

                    </div>

                    {/* Request Controls */}

                    <div className="flex gap-2 mt-4 ml-14">

                      <button
                        onClick={() =>
                          handleStatusChange(
                            request.id,
                            "In Progress"
                          )
                        }
                        className="text-xs px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        Mark In Progress
                      </button>

                      <button
                        onClick={() =>
                          handleStatusChange(
                            request.id,
                            "Resolved"
                          )
                        }
                        className="text-xs px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      >
                        Resolve
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(request.id)
                        }
                        className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* RIGHT */}

            <div className="space-y-6">

              <div className="bg-white rounded-2xl border border-slate-200 p-6">

                <h3 className="font-bold text-slate-800">
                  Resolution Overview
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Current resolution rate
                </p>

                <div className="flex justify-center py-7">

                  <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 p-3">

                    <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">

                      <span className="text-3xl font-bold text-slate-800">
                        {resolutionRate}%
                      </span>

                      <span className="text-xs text-slate-500">
                        Resolved
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              <div className="bg-slate-950 rounded-2xl p-6 text-white">

                <div className="text-3xl mb-4">
                  🛠️
                </div>

                <h3 className="text-lg font-bold">
                  Facing a new issue?
                </h3>

                <p className="text-sm text-slate-400 mt-2 mb-5">
                  Report it now and let FixFlow handle the rest.
                </p>

                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-violet-600 py-3 rounded-xl font-semibold"
                >
                  Report an Issue
                </button>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* ================= CREATE REQUEST MODAL ================= */}

      {showForm && (

        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <div className="request-modal bg-white rounded-3xl w-full max-w-lg shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="request-form-title">

            <div className="p-6 border-b border-slate-200 flex justify-between">

              <div>

                <h2 id="request-form-title" className="text-xl font-bold text-slate-800">
                  Create New Request
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Report your hostel issue
                </p>

              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-9 h-9 rounded-full bg-slate-100"
                aria-label="Close request form"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              <div>

                <label htmlFor="request-title" className="block text-sm font-semibold text-slate-700 mb-2">
                  Issue Title
                </label>

                <input
                  type="text"
                  id="request-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Example: Fan not working"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label htmlFor="request-category" className="block text-sm font-semibold text-slate-700 mb-2">
                    Category
                  </label>

                  <select
                    id="request-category"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                  >
                    <option>Electrical</option>
                    <option>Plumbing</option>
                    <option>Internet</option>
                    <option>Furniture</option>
                    <option>Cleaning</option>
                    <option>Other</option>
                  </select>

                </div>

                <div>

                  <label htmlFor="request-priority" className="block text-sm font-semibold text-slate-700 mb-2">
                    Priority
                  </label>

                  <select
                    id="request-priority"
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>

                </div>

              </div>

              <div>

                <label htmlFor="request-description" className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>

                <textarea
                  id="request-description"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows="4"
                  placeholder="Describe your issue..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>

              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white py-3.5 rounded-xl font-semibold shadow-lg"
              >
                Submit Request 🚀
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;