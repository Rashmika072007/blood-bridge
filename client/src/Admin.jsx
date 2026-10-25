

import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:3000/api/admin";
const TOKEN_KEY = "bb_admin_token";

function Admin() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem(TOKEN_KEY) || ""
  );
  const [username, setUsername] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);

  const [donors, setDonors] = useState([]);
  const [total, setTotal] = useState(0);
  const [available, setAvailable] = useState(0);
  const [search, setSearch] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [dashboardError, setDashboardError] = useState("");

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUsername("");
    setDonors([]);
    setPassword("");
  }, []);

  const loadDonors = useCallback(async () => {
    if (!token) return;

    setDashboardError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (bloodGroup) params.set("bloodGroup", bloodGroup);
      if (availabilityFilter !== "") {
        params.set("available", availabilityFilter);
      }

      const response = await fetch(
        `${API_URL}/donors?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logout();
        setLoginError("Your session expired. Please log in again.");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load donors.");
      }

      setDonors(data.donors || []);
      setTotal(data.total ?? data.counts?.total ?? 0);
      setAvailable(data.available ?? data.counts?.available ?? 0);
    } catch (error) {
      setDashboardError(
        error.message || "Could not connect to the server."
      );
    }
  }, [token, search, bloodGroup, availabilityFilter, logout]);

  useEffect(() => {
    if (token) loadDonors();
  }, [token, loadDonors]);

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setLoginError("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.message || "Invalid username or password.");
      }

      sessionStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUsername(data.username || loginUsername.trim());
      setPassword("");
    } catch (error) {
      setLoginError(
        error.message || "Unable to log in. Check your backend."
      );
    } finally {
      setBusy(false);
    }
  }

  async function updateAvailability(donor) {
  try {
    const response = await fetch(
      `${API_URL}/donors/${donor._id}/availability`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          available: !donor.available,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not update availability.");
    }

    await loadDonors();
  } catch (error) {
    setDashboardError(error.message);
  }
}


  async function deleteDonor(donor) {
    const confirmed = window.confirm(
      `Delete the donor record for ${donor.name}? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/donors/${donor._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete donor.");
      }

      await loadDonors();
    } catch (error) {
      setDashboardError(error.message);
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl"
        >
          <a href="/" className="text-sm font-semibold text-red-600">
            ← Back to Blood Bridge
          </a>

          <div className="mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-3xl text-white">
            ♥
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-slate-900">
            Admin login
          </h1>
          <p className="mt-2 text-slate-500">
            Sign in to manage Blood Bridge donor records.
          </p>

          <label className="mt-7 block text-sm font-bold text-slate-700">
            Username
          </label>
          <input
            value={loginUsername}
            onChange={(event) => setLoginUsername(event.target.value)}
            required
            autoComplete="username"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-red-500"
            placeholder="Admin username"
          />

          <label className="mt-5 block text-sm font-bold text-slate-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-red-500"
            placeholder="Admin password"
          />

          {loginError && (
            <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-xl bg-red-600 px-5 py-4 font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Sign in →"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <a href="/" className="text-sm font-semibold text-red-600">
              ← Blood Bridge homepage
            </a>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
              Admin dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {username ? `Signed in as ${username}` : "Manage donor records"}
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total donors" value={total} />
          <StatCard title="Available donors" value={available} />
          <StatCard title="Not available" value={Math.max(0, total - available)} />
        </div>

        <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Donor management
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search, update availability, or remove a donor record.
              </p>
            </div>
            <button
              onClick={loadDonors}
              className="rounded-xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
            >
              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or city"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-red-500"
            />

            <select
              value={bloodGroup}
              onChange={(event) => setBloodGroup(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="">All blood groups</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>

            <select
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="">All availability</option>
              <option value="true">Available</option>
              <option value="false">Not available</option>
            </select>
          </div>

          {dashboardError && (
            <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {dashboardError}
            </p>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-4 font-semibold">Donor</th>
                  <th className="px-3 py-4 font-semibold">Blood group</th>
                  <th className="px-3 py-4 font-semibold">City</th>
                  <th className="px-3 py-4 font-semibold">Contact</th>
                  <th className="px-3 py-4 font-semibold">Status</th>
                  <th className="px-3 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor) => (
                  <tr key={donor._id} className="border-b border-slate-100">
                    <td className="px-3 py-4 font-semibold text-slate-800">
                      {donor.name}
                    </td>
                    <td className="px-3 py-4">
                      <span className="rounded-lg bg-red-50 px-3 py-2 font-bold text-red-600">
                        {donor.bloodGroup}
                      </span>
                    </td>
                    <td className="px-3 py-4">{donor.city}</td>
                    <td className="px-3 py-4">{donor.contact || "—"}</td>
                    <td className="px-3 py-4">
                      <span className={donor.available ? "font-semibold text-green-700" : "font-semibold text-slate-500"}>
                        {donor.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateAvailability(donor)}
                          className="rounded-lg border border-slate-200 px-3 py-2 font-semibold hover:bg-slate-50"
                        >
                          Toggle
                        </button>
                        <button
                          onClick={() => deleteDonor(donor)}
                          className="rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {donors.length === 0 && (
              <p className="py-10 text-center text-slate-500">
                No donors found for these filters.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ title, value }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-3 text-4xl font-extrabold text-slate-900">{value}</p>
    </article>
  );
}

export default Admin;
