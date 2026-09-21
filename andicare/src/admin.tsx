import { useEffect, useMemo, useState } from "react";
import type { Booking } from "@workspace/api-client-react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { Link } from "wouter";

type AdminSession = { authenticated: boolean; email?: string | null };
type AdminStatus = "Booking requested" | "Confirmed" | "Collection scheduled" | "Completed" | "Cancelled";
const statuses: AdminStatus[] = ["Booking requested", "Confirmed", "Collection scheduled", "Completed", "Cancelled"];

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { credentials: "include", ...init });
  const data = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}

function statusClass(status: string) {
  if (status === "Cancelled") return "bg-[#ffe8e8] text-[#b42318]";
  if (status === "Completed") return "bg-[#e8f7d8] text-[#267000]";
  if (status === "Confirmed" || status === "Collection scheduled") return "bg-[#e5f7ed] text-[#008A45]";
  return "bg-[#fff5d8] text-[#956500]";
}

function AdminLogin({ onLogin }: { onLogin: (session: AdminSession) => void }) {
  const [email, setEmail] = useState("admin@andicare.local");
  const [password, setPassword] = useState("andicare-admin");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const session = await readJson<AdminSession>("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      onLogin(session);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#eaf7fb] px-4 py-12">
      <div className="w-full max-w-md rounded-[1.75rem] border border-[#d7e9ee] bg-white p-7 shadow-[0_18px_40px_rgba(0,43,115,.1)] md:p-9">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#0066D6]">
          <ArrowLeft className="h-4 w-4" /> Back to AnDiCare
        </Link>
        <div className="mt-9 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#002B73] text-white">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#008a9d]">Operations</p>
            <h1 className="font-display text-2xl font-bold text-[#002B73]">Admin sign in</h1>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-[#68859c]">
          Manage customer bookings, appointment timing, service areas and fulfilment status.
        </p>
        <form onSubmit={submit} className="mt-7 grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-[#315271]">
            Admin email
            <input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="rounded-xl border border-[#cfe3eb] p-3 font-normal outline-none focus:border-[#0066D6]" data-testid="input-admin-email" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#315271]">
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" className="rounded-xl border border-[#cfe3eb] p-3 font-normal outline-none focus:border-[#0066D6]" data-testid="input-admin-password" />
          </label>
          {error && <p className="rounded-xl bg-[#ffe8e8] p-3 text-sm text-[#b42318]" role="alert">{error}</p>}
          <button disabled={submitting} className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0066D6] px-5 text-sm font-bold text-white disabled:opacity-50" data-testid="button-admin-login">
            {submitting ? "Signing in…" : "Open admin panel"} <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        </form>
        <p className="mt-6 text-xs leading-5 text-[#8ba0ae]">
          This workspace uses demo admin credentials until production credentials are configured.
        </p>
      </div>
    </main>
  );
}

function BookingDetail({ booking, onClose, onUpdated }: { booking: Booking; onClose: () => void; onUpdated: (booking: Booking) => void }) {
  const [status, setStatus] = useState(booking.status);
  const [partner, setPartner] = useState(booking.partner);
  const [address, setAddress] = useState(booking.address);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStatus(booking.status);
    setPartner(booking.partner);
    setAddress(booking.address);
    setError("");
  }, [booking]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await readJson<Booking>(`/api/admin/bookings/${encodeURIComponent(booking.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, partner, address }),
      });
      onUpdated(updated);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save booking");
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="rounded-[1.5rem] border border-[#d7e9ee] bg-white p-6 shadow-[0_10px_28px_rgba(0,43,115,.08)] lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.15em] text-[#008a9d]">Booking detail</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-[#002B73]">{booking.title}</h2>
        </div>
        <button onClick={onClose} className="rounded-xl p-2 text-[#68859c] hover:bg-[#eaf6ff]" aria-label="Close booking detail"><X className="h-5 w-5" /></button>
      </div>
      <div className="mt-6 grid gap-3 text-sm">
        <div className="flex gap-3 rounded-xl bg-[#eff8fb] p-4"><UserRound className="h-4 w-4 shrink-0 text-[#0066D6]" /><span><strong className="block text-[#002B73]">{booking.customerName}</strong><span className="text-[#68859c]">{booking.customerPhone}</span></span></div>
        <div className="flex gap-3 rounded-xl bg-[#eff8fb] p-4"><CalendarDays className="h-4 w-4 shrink-0 text-[#0066D6]" /><span className="text-[#52718c]">{booking.date} · {booking.time}</span></div>
        <div className="flex gap-3 rounded-xl bg-[#eff8fb] p-4"><MapPin className="h-4 w-4 shrink-0 text-[#0066D6]" /><span className="text-[#52718c]">{booking.area} · {booking.method}</span></div>
      </div>
      <div className="mt-6 grid gap-4 border-t border-[#e5eff2] pt-6">
        <label className="grid gap-2 text-sm font-bold text-[#315271]">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-[#cfe3eb] bg-white p-3 font-normal outline-none focus:border-[#0066D6]" data-testid="select-admin-booking-status">{statuses.map((option) => <option key={option}>{option}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-bold text-[#315271]">Partner<input value={partner} onChange={(event) => setPartner(event.target.value)} className="rounded-xl border border-[#cfe3eb] p-3 font-normal outline-none focus:border-[#0066D6]" data-testid="input-admin-partner" /></label>
        <label className="grid gap-2 text-sm font-bold text-[#315271]">Address<textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={3} className="resize-none rounded-xl border border-[#cfe3eb] p-3 font-normal outline-none focus:border-[#0066D6]" data-testid="textarea-admin-address" /></label>
        {error && <p className="rounded-xl bg-[#ffe8e8] p-3 text-sm text-[#b42318]">{error}</p>}
        <button onClick={save} disabled={saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0066D6] px-5 text-sm font-bold text-white disabled:opacity-50" data-testid="button-save-admin-booking">
          {saving ? "Saving…" : "Save booking"} <Check className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}

function AdminDashboard({ session, onLogout }: { session: AdminSession; onLogout: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (status) params.set("status", status);
      const data = await readJson<Booking[]>(`/api/admin/bookings${params.size ? `?${params}` : ""}`);
      setBookings(data);
      setSelected((current) => current ? data.find((booking) => booking.id === current.id) ?? null : null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadBookings(), 180);
    return () => window.clearTimeout(timer);
  }, [query, status]);

  const counts = useMemo(() => ({
    total: bookings.length,
    requested: bookings.filter((booking) => booking.status === "Booking requested").length,
    confirmed: bookings.filter((booking) => booking.status === "Confirmed" || booking.status === "Collection scheduled").length,
    completed: bookings.filter((booking) => booking.status === "Completed").length,
  }), [bookings]);

  const handleUpdated = (updated: Booking) => {
    setBookings((current) => current.map((booking) => booking.id === updated.id ? updated : booking));
    setSelected(updated);
  };

  return (
    <main className="min-h-[100dvh] bg-[#f4fafc]">
      <header className="border-b border-[#dcecf1] bg-white">
        <div className="mx-auto flex min-h-20 w-[min(1280px,calc(100%-2rem))] items-center justify-between gap-4">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#002B73] text-white"><ShieldCheck className="h-5 w-5" /></span><div><p className="font-display font-bold text-[#002B73]">AnDiCare Operations</p><p className="text-xs text-[#68859c]">{session.email}</p></div></div>
          <div className="flex items-center gap-2"><button onClick={() => void loadBookings()} className="rounded-xl p-2.5 text-[#52718c] hover:bg-[#eaf6ff]" aria-label="Refresh bookings"><RefreshCw className="h-4 w-4" /></button><button onClick={onLogout} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#b9d8e8] px-3 text-sm font-bold text-[#002B73] hover:bg-[#edf8ff]" data-testid="button-admin-logout"><LogOut className="h-4 w-4" /> Sign out</button></div>
        </div>
      </header>
      <div className="mx-auto w-[min(1280px,calc(100%-2rem))] py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#008a9d]"><span className="h-2 w-2 rounded-full bg-[#7ACB00]" /> Daily view</p><h1 className="font-display text-4xl font-bold tracking-[-.05em] text-[#002B73] md:text-5xl">Booking operations.</h1><p className="mt-3 text-[#52718c]">Review every customer request and keep the next step clear.</p></div><Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#0066D6]"><ArrowLeft className="h-4 w-4" /> Customer app</Link></div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl bg-[#002B73] p-5 text-white"><p className="text-xs font-bold uppercase tracking-[.13em] text-[#71dbe5]">Visible bookings</p><p className="mt-4 font-display text-3xl font-bold">{counts.total}</p></div><div className="rounded-2xl border border-[#dcecf1] bg-white p-5"><p className="text-xs font-bold uppercase tracking-[.13em] text-[#956500]">Needs review</p><p className="mt-4 font-display text-3xl font-bold text-[#002B73]">{counts.requested}</p></div><div className="rounded-2xl border border-[#dcecf1] bg-white p-5"><p className="text-xs font-bold uppercase tracking-[.13em] text-[#008A45]">In progress</p><p className="mt-4 font-display text-3xl font-bold text-[#002B73]">{counts.confirmed}</p></div><div className="rounded-2xl border border-[#dcecf1] bg-white p-5"><p className="text-xs font-bold uppercase tracking-[.13em] text-[#0066D6]">Completed</p><p className="mt-4 font-display text-3xl font-bold text-[#002B73]">{counts.completed}</p></div></div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_24rem]">
          <section className="min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row"><label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-[#b9d9e8] bg-white px-4"><Search className="h-4 w-4 text-[#0066D6]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, booking or area" className="min-w-0 flex-1 bg-transparent text-sm outline-none" data-testid="input-admin-search" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-12 rounded-xl border border-[#b9d9e8] bg-white px-4 text-sm font-bold text-[#315271] outline-none" data-testid="select-admin-status-filter"><option value="">All statuses</option>{statuses.map((option) => <option key={option}>{option}</option>)}</select></div>
            {error && <p className="mt-4 rounded-xl bg-[#ffe8e8] p-4 text-sm text-[#b42318]">{error}</p>}
            <div className="mt-4 grid gap-3">{loading ? <div className="rounded-2xl border border-dashed border-[#b9d9e8] bg-white p-10 text-center text-sm text-[#68859c]">Loading bookings…</div> : bookings.length ? bookings.map((booking) => <button key={booking.id} onClick={() => setSelected(booking)} className={`w-full rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#9bc6e6] ${selected?.id === booking.id ? "border-[#0066D6] shadow-[0_10px_26px_rgba(0,102,214,.12)]" : "border-[#dcecf1]"}`} data-testid={`button-admin-booking-${booking.id}`}><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-[#002B73]">{booking.title}</h2><span className={`rounded-full px-2.5 py-1 text-[.68rem] font-bold ${statusClass(booking.status)}`}>{booking.status}</span></div><p className="mt-2 text-sm text-[#52718c]">{booking.customerName} · {booking.customerPhone}</p><p className="mt-2 flex items-center gap-2 text-xs text-[#68859c]"><CalendarDays className="h-3.5 w-3.5 text-[#0066D6]" />{booking.date} · {booking.time}<span className="text-[#b9d8e8]">•</span><MapPin className="h-3.5 w-3.5 text-[#00AFC5]" />{booking.area}</p></div><span className="font-display text-lg font-bold text-[#002B73]">₹{booking.price.toLocaleString("en-IN")}</span></div></button>) : <div className="rounded-2xl border border-dashed border-[#b9d9e8] bg-white p-10 text-center"><Clock3 className="mx-auto h-7 w-7 text-[#00AFC5]" /><p className="mt-4 font-bold text-[#002B73]">No bookings found</p><p className="mt-1 text-sm text-[#68859c]">New customer bookings will appear here.</p></div>}</div>
          </section>
          {selected ? <BookingDetail booking={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} /> : <div className="hidden rounded-[1.5rem] border border-dashed border-[#b9d9e8] bg-white p-8 text-center lg:block"><CalendarDays className="mx-auto h-8 w-8 text-[#00AFC5]" /><p className="mt-4 font-bold text-[#002B73]">Select a booking</p><p className="mt-2 text-sm leading-6 text-[#68859c]">Review the customer, timing, address and fulfilment details here.</p></div>}
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void readJson<AdminSession>("/api/admin/session")
      .then(setSession)
      .catch(() => setSession({ authenticated: false }))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <main className="grid min-h-[100dvh] place-items-center bg-[#eaf7fb] text-sm text-[#68859c]">Checking admin access…</main>;
  if (!session?.authenticated) return <AdminLogin onLogin={setSession} />;

  return <AdminDashboard session={session} onLogout={async () => { await fetch("/api/admin/logout", { method: "POST", credentials: "include" }); setSession({ authenticated: false }); }} />;
}