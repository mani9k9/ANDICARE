import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowRight, ArrowUpRight, Award, Baby, BarChart3, Bell, CalendarDays, Check,
  ChevronDown, ChevronRight, ClipboardList, Clock3, FileText, Filter, Heart,
  Home as HomeIcon, Info, KeyRound, LayoutDashboard, LifeBuoy, LineChart,
  ListFilter, LockKeyhole, Mail, MapPin, Menu, MessageCircle, Minus, Phone,
  Plus, Search, ShieldCheck, ShoppingBag, Sparkles, Stethoscope, TestTube2,
  UserRound, Users, X, Zap,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import AdminPage from './admin';

const queryClient = new QueryClient();

type IconType = typeof Search;
type Test = { slug: string; name: string; category: string; description: string; price: number; oldPrice?: number; sample: string; report: string; popular?: boolean; tags: string[] };
type Package = { slug: string; name: string; eyebrow: string; description: string; price: number; oldPrice: number; tests: number; ideal: string; tone: string; includes: string[] };
type BookingRecord = {
  id: string;
  customerKey?: string;
  customerName?: string;
  customerPhone?: string;
  title: string;
  detail: string;
  status: string;
  partner: string;
  date: string;
  time: string;
  address: string;
  method: string;
  area?: string;
  price?: number;
  isDemo?: boolean;
};

const BOOKING_STORAGE_KEY = 'andicare.bookings.v1';
const CUSTOMER_KEY_STORAGE_KEY = 'andicare.customer-key.v1';

function getCustomerKey(): string {
  if (typeof window === 'undefined') return 'server-rendered-customer';
  const existing = window.localStorage.getItem(CUSTOMER_KEY_STORAGE_KEY);
  if (existing) return existing;
  const created =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `customer-${Date.now().toString(36)}`;
  window.localStorage.setItem(CUSTOMER_KEY_STORAGE_KEY, created);
  return created;
}

function readSavedBookings(): BookingRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = window.localStorage.getItem(BOOKING_STORAGE_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedBookings(bookings: BookingRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings));
}

function addSavedBooking(booking: BookingRecord) {
  writeSavedBookings([booking, ...readSavedBookings()]);
}

const tests: Test[] = [
  { slug: 'cbc', name: 'Complete Blood Count (CBC)', category: 'Everyday health', description: 'A broad look at red cells, white cells and platelets.', price: 299, oldPrice: 450, sample: 'Blood', report: 'Same day', popular: true, tags: ['Routine', 'Wellness'] },
  { slug: 'thyroid-profile', name: 'Thyroid Profile', category: 'Hormones', description: 'TSH, T3 and T4 markers for a clearer thyroid picture.', price: 649, oldPrice: 850, sample: 'Blood', report: '24 hours', popular: true, tags: ['Thyroid', 'Hormones'] },
  { slug: 'vitamin-d', name: 'Vitamin D, 25-OH', category: 'Vitamins', description: 'Understand your vitamin D level with a quantitative test.', price: 799, sample: 'Blood', report: '24 hours', tags: ['Vitamins', 'Energy'] },
  { slug: 'hba1c', name: 'HbA1c — 3 month sugar average', category: 'Diabetes', description: 'A longer-view marker that complements everyday glucose checks.', price: 499, oldPrice: 600, sample: 'Blood', report: '24 hours', popular: true, tags: ['Diabetes', 'Routine'] },
  { slug: 'lipid-profile', name: 'Lipid Profile', category: 'Heart health', description: 'Total cholesterol, HDL, LDL and triglycerides in one report.', price: 549, oldPrice: 700, sample: 'Blood', report: '24 hours', tags: ['Heart', 'Wellness'] },
  { slug: 'liver-function', name: 'Liver Function Test', category: 'Organ health', description: 'A set of markers that helps you discuss liver health with your clinician.', price: 699, sample: 'Blood', report: '24 hours', tags: ['Liver', 'Wellness'] },
  { slug: 'kidney-function', name: 'Kidney Function Test', category: 'Organ health', description: 'Creatinine, urea and related markers for a practical baseline.', price: 649, sample: 'Blood', report: '24 hours', tags: ['Kidney', 'Routine'] },
  { slug: 'urine-routine', name: 'Urine Routine & Microscopy', category: 'Everyday health', description: 'A simple urine analysis with microscopy.', price: 249, sample: 'Urine', report: 'Same day', tags: ['Routine'] },
];

const packages: Package[] = [
  { slug: 'essential-wellness', name: 'Essential Wellness', eyebrow: 'A steady baseline', description: 'The practical starting point for a yearly health conversation.', price: 1299, oldPrice: 1850, tests: 52, ideal: 'Adults 18–40', tone: 'sky', includes: ['Complete blood count', 'Lipid profile', 'Liver & kidney markers', 'Thyroid profile', 'Urine routine'] },
  { slug: 'active-heart', name: 'Active Heart', eyebrow: 'For heart-conscious living', description: 'A considered panel for people building consistent heart-health habits.', price: 1799, oldPrice: 2500, tests: 68, ideal: 'Adults 30+', tone: 'mint', includes: ['Lipid profile', 'HbA1c', 'hs-CRP', 'Electrolytes', 'Liver & kidney markers'] },
  { slug: 'women-wellness', name: 'Women’s Wellness', eyebrow: 'Thoughtful, not overwhelming', description: 'Commonly requested markers for a more complete picture of women’s wellness.', price: 1999, oldPrice: 2900, tests: 74, ideal: 'Women 18+', tone: 'lilac', includes: ['CBC & iron markers', 'Thyroid profile', 'Vitamin D', 'Vitamin B12', 'Urine routine'] },
];

const partners = [
  { name: 'LifeLine Diagnostics', area: 'Indore · Rau', note: 'Home collection available', since: 'Partner since 2022', color: 'bg-[#e8f5ff]' },
  { name: 'Aarogyam Labs', area: 'Indore · Mhow', note: 'Reports reviewed by lab team', since: 'Partner since 2023', color: 'bg-[#eaf9f2]' },
  { name: 'Central Pathology House', area: 'Indore · Ujjain', note: 'Same-day routine reports', since: 'Partner since 2024', color: 'bg-[#fff5dd]' },
];

const articles = [
  { tag: 'Know your numbers', title: 'What a routine health check can tell you', time: '5 min read', color: 'navy' },
  { tag: 'At home', title: 'How to prepare for a blood sample collection', time: '3 min read', color: 'cyan' },
  { tag: 'For your family', title: 'Making health records easier to find', time: '4 min read', color: 'green' },
];

function Logo({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return <Link href="/" className="flex items-center gap-2.5" data-testid="link-logo">
    <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-[#0066D6] text-white shadow-[0_5px_14px_rgba(0,102,214,.28)]">
      <span className="absolute h-5 w-1.5 rounded-full bg-white" /><span className="absolute h-1.5 w-5 rounded-full bg-white" />
      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#7ACB00]" />
    </span>
    {!compact && <span className={`font-display text-[1.2rem] font-bold tracking-[-.04em] ${inverse ? 'text-white' : 'text-[#002B73]'}`}>AnDi<span className="text-[#71dbe5]">Care</span></span>}
  </Link>;
}

function Button({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'outline' | 'ghost' | 'lime'; className?: string; type?: 'button' | 'submit'; disabled?: boolean }) {
  const styles = { primary: 'bg-[#0066D6] text-white hover:bg-[#0056b5]', outline: 'border border-[#9bc6e6] bg-white text-[#002B73] hover:border-[#0066D6] hover:bg-[#edf8ff]', ghost: 'text-[#0066D6] hover:bg-[#eaf6ff]', lime: 'bg-[#7ACB00] text-[#102f00] hover:bg-[#68b100]' };
  return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${styles[variant]} ${className}`} data-testid="button-action">{children}</button>;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = [['Tests', '/tests'], ['Packages', '/packages'], ['Home collection', '/home-collection'], ['Home ECG', '/home-ecg'], ['How it works', '/how-it-works']];
  return <>
    <header className="sticky top-0 z-40 border-b border-[#dcecf1] bg-[#f7fcfd]/90 backdrop-blur-xl">
      <div className="page-shell flex h-[4.6rem] items-center justify-between gap-5">
        <Logo />
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Main navigation">
          {nav.map(([label, href]) => <Link key={href} href={href} className="text-[.78rem] font-bold text-[#315271] transition hover:text-[#0066D6]" data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/reports" className="rounded-xl p-2.5 text-[#315271] hover:bg-[#eaf6ff]" data-testid="link-reports"><FileText className="h-4 w-4" /></Link>
          <Link href="/login" className="rounded-xl border border-[#b9d8e8] px-4 py-2.5 text-sm font-bold text-[#002B73] hover:bg-white" data-testid="link-login">Sign in</Link>
          <Link href="/tests" className="rounded-xl bg-[#002B73] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0066D6]" data-testid="link-book-now">Book a test</Link>
        </div>
        <button className="rounded-xl p-2.5 text-[#002B73] md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" data-testid="button-mobile-menu">{menuOpen ? <X /> : <Menu />}</button>
      </div>
      {menuOpen && <div className="border-t border-[#dcecf1] bg-[#f7fcfd] p-4 md:hidden animate-fade">
        <nav className="page-shell grid gap-1" aria-label="Mobile navigation">
          {nav.concat([['Health diary', '/health-diary'], ['My bookings', '/bookings'], ['Reports', '/reports']]).map(([label, href]) => <Link onClick={() => setMenuOpen(false)} key={href} href={href} className="rounded-xl px-3 py-3 font-bold text-[#315271] hover:bg-[#eaf6ff]" data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link>)}
          <Link onClick={() => setMenuOpen(false)} href="/login" className="mt-2 rounded-xl bg-[#0066D6] px-3 py-3 text-center font-bold text-white" data-testid="link-mobile-sign-in">Sign in</Link>
        </nav>
      </div>}
    </header>
  </>;
}

function BottomNav() {
  const items: [string, IconType, string][] = [['/', HomeIcon, 'Home'], ['/tests', TestTube2, 'Tests'], ['/bookings', CalendarDays, 'Bookings'], ['/health-diary', Heart, 'Diary']];
  return <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#dcecf1] bg-white/95 px-4 pb-[max(.65rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden" aria-label="Mobile bottom navigation">
    <div className="mx-auto grid max-w-md grid-cols-4">
      {items.map(([href, Icon, label]) => { const IconComponent = Icon as IconType; return <Link key={href as string} href={href as string} className="flex flex-col items-center gap-1 py-1 text-[.68rem] font-bold text-[#52718c] hover:text-[#0066D6]" data-testid={`link-bottom-${label.toLowerCase()}`}><IconComponent className="h-[1.15rem] w-[1.15rem]" />{label}</Link>; })}
    </div>
  </nav>;
}

function Footer() {
  return <footer className="mt-20 bg-[#002B73] pb-24 pt-14 text-white md:pb-10">
      <div className="page-shell grid gap-12 md:grid-cols-[1.4fr_.8fr_.8fr_1fr]">
      <div><Logo inverse /><p className="mt-5 max-w-xs text-sm leading-6 text-[#b9d4ec]">Healthcare at your doorstep. Clear choices, verified partner information, and support when you need it.</p><div className="mt-7 flex items-center gap-2 text-xs text-[#b9d4ec]"><LockKeyhole className="h-4 w-4 text-[#7ACB00]" /> Your health information stays yours.</div></div>
      <div><p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-[#71dbe5]">Explore</p><div className="grid gap-3 text-sm text-[#d4e6f4]"><Link href="/tests" data-testid="link-footer-tests">Lab tests</Link><Link href="/packages" data-testid="link-footer-packages">Health packages</Link><Link href="/home-collection" data-testid="link-footer-collection">Home collection</Link><Link href="/home-ecg" data-testid="link-footer-ecg">Home ECG</Link></div></div>
      <div><p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-[#71dbe5]">Your care</p><div className="grid gap-3 text-sm text-[#d4e6f4]"><Link href="/bookings" data-testid="link-footer-bookings">Bookings</Link><Link href="/reports" data-testid="link-footer-reports">Reports</Link><Link href="/health-diary" data-testid="link-footer-diary">Health diary</Link><Link href="/family" data-testid="link-footer-family">Family profiles</Link></div></div>
      <div><p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-[#71dbe5]">Need a hand?</p><p className="text-sm leading-6 text-[#d4e6f4]">Our care team can help you choose a service or find your report.</p><Link href="/concierge" className="mt-4 inline-flex items-center gap-2 font-bold text-[#7ACB00]" data-testid="link-footer-concierge">Talk to concierge <ArrowUpRight className="h-4 w-4" /></Link></div>
    </div>
    <div className="page-shell mt-12 flex flex-col justify-between gap-4 border-t border-[#2c568d] pt-5 text-xs text-[#a8c7e0] md:flex-row"><span>© 2025 AnDiCare. A partner-enabled healthcare platform.</span><div className="flex gap-4"><Link href="/privacy" data-testid="link-footer-privacy">Privacy</Link><Link href="/terms" data-testid="link-footer-terms">Terms</Link><Link href="/refund-policy" data-testid="link-footer-refunds">Refund policy</Link></div></div>
  </footer>;
}

function Page({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className="min-h-[100dvh]">{children}{!wide && <Footer />}<BottomNav /></div>;
}

function Eyebrow({ children }: { children: ReactNode }) { return <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#008a9d]"><span className="h-2 w-2 rounded-full bg-[#7ACB00]" />{children}</p>; }
function SectionHeading({ eyebrow, title, copy, action }: { eyebrow?: string; title: string; copy?: string; action?: ReactNode }) { return <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div>{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}<h2 className="font-display text-3xl font-bold leading-tight tracking-[-.04em] text-[#002B73] md:text-4xl">{title}</h2>{copy && <p className="mt-3 max-w-2xl leading-7 text-[#52718c]">{copy}</p>}</div>{action}</div>; }

function SearchBar({
  initial = '',
  onSubmit,
  onChange,
}: {
  initial?: string;
  onSubmit?: (value: string) => void;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    setValue(initial);
  }, [initial]);

  return <form onSubmit={e => { e.preventDefault(); onSubmit?.(value); }} className="flex min-h-[4.4rem] items-center gap-3 rounded-2xl border border-[#b9d9e8] bg-white p-2 pl-4 shadow-[0_10px_30px_rgba(0,70,120,.1)]">
    <Search className="h-5 w-5 shrink-0 text-[#0066D6]" /><input value={value} onChange={e => { const nextValue = e.target.value; setValue(nextValue); onChange?.(nextValue); }} placeholder="Search a test, package or health goal" className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#002B73] outline-none placeholder:text-[#7d9aaf]" aria-label="Search tests and packages" data-testid="input-search" /><Button type="submit" className="hidden sm:inline-flex">Search</Button>
  </form>;
}

function TrustStrip() {
  return <div className="border-y border-[#dcecf1] bg-white"><div className="page-shell grid divide-y divide-[#dcecf1] py-1 md:grid-cols-3 md:divide-x md:divide-y-0"><div className="flex items-center gap-3 px-3 py-4"><ShieldCheck className="h-5 w-5 text-[#008A45]" /><div><p className="text-sm font-bold text-[#002B73]">Partner information, clearly shown</p><p className="text-xs text-[#68859c]">You always see who fulfils your booking.</p></div></div><div className="flex items-center gap-3 px-3 py-4 md:pl-8"><HomeIcon className="h-5 w-5 text-[#0066D6]" /><div><p className="text-sm font-bold text-[#002B73]">Care that comes home</p><p className="text-xs text-[#68859c]">Choose doorstep collection in supported areas.</p></div></div><div className="flex items-center gap-3 px-3 py-4 md:pl-8"><MessageCircle className="h-5 w-5 text-[#00AFC5]" /><div><p className="text-sm font-bold text-[#002B73]">A real team when you need one</p><p className="text-xs text-[#68859c]">Ask our concierge before you book.</p></div></div></div></div>;
}

function Home() {
  const [, setLocation] = useLocation();
  return <Page>
    <main>
      <section className="relative overflow-hidden bg-[#eaf7fb] pb-16 pt-14 md:pb-24 md:pt-20">
        <div className="absolute -right-28 -top-24 h-80 w-80 rounded-full bg-[#7bdbe0]/40 blur-3xl" /><div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-[#bde891]/40 blur-3xl" />
        <div className="page-shell relative grid items-center gap-12 lg:grid-cols-[1.03fr_.97fr]">
          <div className="animate-rise"><Eyebrow>Healthcare at your doorstep</Eyebrow><h1 className="max-w-2xl font-display text-[clamp(2.7rem,6vw,5.2rem)] font-bold leading-[1.02] tracking-[-.065em] text-[#002B73]">Less wondering.<br /><span className="text-[#0066D6]">More knowing.</span></h1><p className="mt-6 max-w-lg text-lg leading-8 text-[#45647e]">Book lab tests, health packages and at-home care from trusted local partners — with every important detail in plain sight.</p><div className="mt-8 max-w-xl"><SearchBar onSubmit={value => setLocation(value ? `/tests?search=${encodeURIComponent(value)}` : '/tests')} /><p className="mt-3 text-xs text-[#62819a]">Try “thyroid”, “vitamin D” or “annual check-up”</p></div><div className="mt-7 flex flex-wrap gap-3"><Button onClick={() => setLocation('/home-collection')} variant="lime">Book home collection <ArrowRight className="h-4 w-4" /></Button><Link href="/how-it-works" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-[#0066D6] hover:bg-white" data-testid="link-hero-how-it-works">See how it works <ChevronRight className="h-4 w-4" /></Link></div></div>
          <div className="relative mx-auto w-full max-w-[31rem] animate-rise delay-2"><div className="relative overflow-hidden rounded-[2.2rem] border border-white/80 bg-[#002B73] p-4 shadow-[0_24px_50px_rgba(0,43,115,.2)]"><div className="rounded-[1.7rem] bg-[#edfafd] p-6 md:p-8"><div className="flex items-center justify-between"><span className="rounded-full bg-[#d8f4e7] px-3 py-1.5 text-[.68rem] font-bold text-[#008A45]">A clearer health day</span><span className="text-xs font-bold text-[#6b8ba1]">AnDiCare</span></div><div className="mt-12"><p className="font-display text-2xl font-bold tracking-[-.04em] text-[#002B73]">Your next step,<br />made simple.</p><div className="mt-7 grid gap-3"><div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#dff1ff] text-[#0066D6]"><TestTube2 className="h-4 w-4" /></span><div className="flex-1"><p className="text-xs font-bold text-[#002B73]">Annual wellness</p><p className="text-[.68rem] text-[#7692a7]">52 markers · Home visit</p></div><span className="text-xs font-bold text-[#0066D6]">₹1,299</span></div><div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e5f7ed] text-[#008A45]"><CalendarDays className="h-4 w-4" /></span><div className="flex-1"><p className="text-xs font-bold text-[#002B73]">Collection booked</p><p className="text-[.68rem] text-[#7692a7]">Tomorrow · 7:00–8:00 AM</p></div><Check className="h-4 w-4 text-[#008A45]" /></div></div></div><div className="mt-12 flex items-center justify-between border-t border-[#d7ebef] pt-4 text-xs text-[#5d7d94]"><span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#008A45]" /> Partner-led care</span><span>Indore & nearby</span></div></div></div><div className="absolute -bottom-4 -left-3 rounded-2xl bg-white p-4 shadow-[0_12px_28px_rgba(0,43,115,.16)]"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e8f7d8] text-[#008A45]"><Heart className="h-4 w-4 fill-current" /></span><div><p className="text-xs font-bold text-[#002B73]">Care, without the queue</p><p className="text-[.68rem] text-[#6d899e]">Built for real life</p></div></div></div></div>
        </div>
      </section>
      <TrustStrip />
      <section className="page-shell py-20"><SectionHeading eyebrow="Start here" title="Choose what feels right today" copy="Whether you know the test or only know the question, AnDiCare helps you find a practical next step." /><div className="grid gap-4 md:grid-cols-12"><Link href="/tests" className="group relative overflow-hidden rounded-[1.5rem] bg-[#002B73] p-7 text-white md:col-span-7 md:min-h-[19rem]" data-testid="card-home-tests"><div className="absolute -right-8 -top-8 h-44 w-44 rounded-full border-[26px] border-[#1b4c91]" /><TestTube2 className="h-8 w-8 text-[#71dbe5]" /><h3 className="mt-12 font-display text-2xl font-bold">I know the test<br />I need</h3><p className="mt-2 max-w-xs text-sm leading-6 text-[#b9d4ec]">Search individual tests by name, goal or marker.</p><span className="absolute bottom-7 right-7 grid h-10 w-10 place-items-center rounded-full bg-[#00AFC5] transition group-hover:translate-x-1"><ArrowRight className="h-4 w-4" /></span></Link><Link href="/packages" className="group rounded-[1.5rem] bg-[#dcf4ee] p-7 text-[#002B73] md:col-span-5 md:min-h-[19rem]" data-testid="card-home-packages"><Sparkles className="h-8 w-8 text-[#008A45]" /><h3 className="mt-12 font-display text-2xl font-bold">I want a<br />healthier baseline</h3><p className="mt-2 max-w-xs text-sm leading-6 text-[#4b726f]">Compare thoughtful packages for the year ahead.</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#008A45]">See packages <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link></div></section>
      <section className="bg-white py-20"><div className="page-shell"><SectionHeading eyebrow="Popular today" title="Small steps, good information" action={<Link href="/tests" className="hidden items-center gap-2 text-sm font-bold text-[#0066D6] md:flex" data-testid="link-popular-tests">View all tests <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 md:grid-cols-3">{tests.slice(0, 3).map((test, i) => <TestCard key={test.slug} test={test} className={`animate-rise delay-${i + 1}`} />)}</div></div></section>
      <section className="soft-grid py-20"><div className="page-shell grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><Eyebrow>Designed around you</Eyebrow><h2 className="font-display text-4xl font-bold leading-tight tracking-[-.05em] text-[#002B73]">Health information<br /><span className="text-[#00AFC5]">should feel human.</span></h2><p className="mt-5 max-w-md leading-7 text-[#52718c]">We bring the details together without making you decode the process.</p></div><div className="grid gap-3 sm:grid-cols-2"><Feature icon={MapPin} title="Know your partner" copy="See the laboratory or service partner before you confirm." /><Feature icon={Clock3} title="Know the next step" copy="Clear sample, report and appointment details at a glance." /><Feature icon={Users} title="Care for your people" copy="Keep family bookings and reports together in one place." /><Feature icon={LifeBuoy} title="Ask a human" copy="Our concierge can help when a search box is not enough." /></div></div></section>
      <section className="page-shell py-20"><SectionHeading eyebrow="From the library" title="A little context goes a long way" action={<Link href="/library" className="hidden items-center gap-2 text-sm font-bold text-[#0066D6] md:flex" data-testid="link-library">Visit health library <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 md:grid-cols-[1.2fr_.8fr_.8fr]">{articles.map((article, i) => <Link key={article.title} href="/library" className={`group rounded-[1.4rem] p-6 ${i === 0 ? 'bg-[#002B73] text-white md:row-span-2' : 'bg-white text-[#002B73] shadow-sm'}`} data-testid={`card-article-${i}`}><span className={`text-xs font-bold uppercase tracking-[.14em] ${i === 0 ? 'text-[#71dbe5]' : 'text-[#008a9d]'}`}>{article.tag}</span><h3 className="mt-16 max-w-xs font-display text-2xl font-bold leading-tight tracking-[-.04em] group-hover:underline">{article.title}</h3><p className={`mt-4 text-xs ${i === 0 ? 'text-[#b9d4ec]' : 'text-[#6c879b]'}`}>{article.time}</p></Link>)}</div></section>
    </main>
  </Page>;
}

function Feature({ icon: Icon, title, copy }: { icon: IconType; title: string; copy: string }) { return <div className="rounded-2xl border border-[#d7e9ee] bg-white p-5"><Icon className="h-5 w-5 text-[#0066D6]" /><h3 className="mt-4 font-bold text-[#002B73]">{title}</h3><p className="mt-1 text-sm leading-6 text-[#68859c]">{copy}</p></div>; }
function TestCard({ test, className = '' }: { test: Test; className?: string }) { const [, setLocation] = useLocation(); return <article className={`card-calm flex flex-col p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(0,43,115,.12)] ${className}`} data-testid={`card-test-${test.slug}`}><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-[#eaf6ff] px-2.5 py-1 text-[.68rem] font-bold text-[#0066D6]">{test.category}</span>{test.popular && <span className="text-[.68rem] font-bold text-[#008A45]">Popular</span>}</div><h3 className="mt-5 font-display text-lg font-bold leading-snug tracking-[-.025em] text-[#002B73]">{test.name}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-[#68859c]">{test.description}</p><div className="mt-5 flex items-center gap-4 border-t border-[#e5eff2] pt-4 text-xs text-[#718ea3]"><span className="flex items-center gap-1.5"><TestTube2 className="h-3.5 w-3.5" />{test.sample}</span><span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{test.report}</span></div><div className="mt-5 flex items-end justify-between"><div><span className="font-display text-xl font-bold text-[#002B73]">₹{test.price.toLocaleString('en-IN')}</span>{test.oldPrice && <span className="ml-2 text-xs text-[#8ba0ae] line-through">₹{test.oldPrice.toLocaleString('en-IN')}</span>}</div><Button onClick={() => setLocation(`/checkout?item=${test.slug}&type=test`)} className="min-h-9 px-3 text-xs">Book now</Button></div></article>; }

function TestsPage() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('search') ?? ''); const [category, setCategory] = useState('All'); const [homeOnly, setHomeOnly] = useState(false);
  const categories = ['All', 'Everyday health', 'Hormones', 'Vitamins', 'Diabetes', 'Heart health', 'Organ health'];
  const shown = useMemo(() => tests.filter(t => (!query || `${t.name} ${t.description} ${t.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())) && (category === 'All' || t.category === category)), [query, category]);
  return <Page><main className="page-shell py-12 md:py-16"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><Eyebrow>Lab tests</Eyebrow><h1 className="font-display text-4xl font-bold tracking-[-.05em] text-[#002B73] md:text-5xl">Find the right test.</h1><p className="mt-3 max-w-xl leading-7 text-[#52718c]">Search by what you know, or browse by the kind of answer you’re looking for.</p></div><Button onClick={() => setLocation('/concierge')} variant="outline"><MessageCircle className="h-4 w-4" /> Ask concierge</Button></div><div className="mt-9 grid gap-6 lg:grid-cols-[15rem_1fr]"><aside className="card-calm h-fit p-5"><div className="flex items-center justify-between"><p className="font-bold text-[#002B73]">Refine</p><Filter className="h-4 w-4 text-[#00AFC5]" /></div><label className="mt-6 flex items-center gap-3 text-sm text-[#52718c]"><input type="checkbox" checked={homeOnly} onChange={e => setHomeOnly(e.target.checked)} className="h-4 w-4 accent-[#0066D6]" data-testid="input-home-collection-filter" />Home collection</label><p className="mb-3 mt-7 text-xs font-bold uppercase tracking-[.13em] text-[#7b95a7]">Category</p><div className="grid gap-1">{categories.map(item => <button key={item} onClick={() => setCategory(item)} className={`rounded-lg px-3 py-2 text-left text-sm font-bold ${category === item ? 'bg-[#e4f3ff] text-[#0066D6]' : 'text-[#607d92] hover:bg-[#f0f8fb]'}`} data-testid={`button-category-${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</button>)}</div></aside><div><div className="mb-5"><SearchBar initial={query} onChange={setQuery} onSubmit={setQuery} /></div><div className="mb-5 flex items-center justify-between text-sm text-[#68859c]"><span><strong className="text-[#002B73]">{shown.length}</strong> tests to explore</span><button onClick={() => { setQuery(''); setCategory('All'); }} className="font-bold text-[#0066D6]" data-testid="button-clear-filters">Clear filters</button></div>{shown.length ? <div className="grid gap-4 md:grid-cols-2">{shown.map(test => <TestCard key={test.slug} test={test} />)}</div> : <EmptyState title="No tests match that search" copy="Try a broader term, or ask our care team to help you find the right starting point." action={<Button onClick={() => { setQuery(''); setCategory('All'); }}>Reset search</Button>} />}</div></div></main></Page>;
}

function TestDetailPage() {
  const { slug } = useParams<{ slug: string }>(); const [, setLocation] = useLocation(); const test = tests.find(item => item.slug === slug) ?? tests[0];
  return <Page><main className="page-shell py-12 md:py-16"><Link href="/tests" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#0066D6]" data-testid="link-back-tests">← Back to tests</Link><div className="grid gap-10 lg:grid-cols-[1fr_22rem]"><div><Eyebrow>{test.category}</Eyebrow><h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-[-.055em] text-[#002B73] md:text-6xl">{test.name}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#52718c]">{test.description} Understand the result with the right context and your clinician’s guidance.</p><div className="mt-10 grid gap-3 sm:grid-cols-3"><DetailStat icon={TestTube2} label="Sample" value={test.sample} /><DetailStat icon={Clock3} label="Report time" value={test.report} /><DetailStat icon={HomeIcon} label="Collection" value="At home or centre" /></div><div className="mt-12 border-t border-[#dcecf1] pt-10"><h2 className="font-display text-2xl font-bold text-[#002B73]">Before you book</h2><div className="mt-5 grid gap-3 md:grid-cols-2"><InfoRow title="Fasting" copy="This test usually does not require fasting. Follow any instructions shared at booking." /><InfoRow title="What you receive" copy="A digital report in your AnDiCare account, with the partner lab clearly named." /><InfoRow title="A note on results" copy="Reports are for information and discussion with a qualified healthcare professional." /><InfoRow title="Need help deciding?" copy="Our concierge can help you compare options, not diagnose." /></div></div></div><aside className="card-calm h-fit p-6 lg:sticky lg:top-24"><span className="rounded-full bg-[#e8f7d8] px-3 py-1.5 text-xs font-bold text-[#008A45]">Available in your area</span><p className="mt-7 text-sm text-[#68859c]">Starting from</p><p className="mt-1 font-display text-4xl font-bold tracking-[-.06em] text-[#002B73]">₹{test.price.toLocaleString('en-IN')}</p>{test.oldPrice && <p className="text-sm text-[#8ba0ae] line-through">₹{test.oldPrice.toLocaleString('en-IN')} partner list price</p>}<div className="my-6 border-t border-[#e5eff2]" /><p className="flex items-center gap-2 text-sm font-bold text-[#002B73]"><ShieldCheck className="h-4 w-4 text-[#008A45]" /> Fulfilled by a verified partner</p><Button onClick={() => setLocation(`/checkout?item=${test.slug}&type=test`)} className="mt-6 w-full">Book this test <ArrowRight className="h-4 w-4" /></Button><Button onClick={() => setLocation('/concierge')} variant="outline" className="mt-3 w-full">Talk it through</Button></aside></div></main></Page>;
}
function DetailStat({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) { return <div className="rounded-xl bg-[#eff8fb] p-4"><Icon className="h-4 w-4 text-[#00AFC5]" /><p className="mt-3 text-xs text-[#718ea3]">{label}</p><p className="mt-1 text-sm font-bold text-[#002B73]">{value}</p></div>; }
function InfoRow({ title, copy }: { title: string; copy: string }) { return <div className="rounded-xl border border-[#dcecf1] p-4"><p className="font-bold text-[#002B73]">{title}</p><p className="mt-1 text-sm leading-6 text-[#68859c]">{copy}</p></div>; }

function PackagesPage() {
  const [compare, setCompare] = useState<string[]>([]); const [, setLocation] = useLocation();
  return <Page><main className="page-shell py-12 md:py-16"><div className="max-w-2xl"><Eyebrow>Health packages</Eyebrow><h1 className="font-display text-4xl font-bold tracking-[-.055em] text-[#002B73] md:text-6xl">A fuller picture,<br /><span className="text-[#00AFC5]">without the overwhelm.</span></h1><p className="mt-5 text-lg leading-8 text-[#52718c]">Thoughtful groups of tests for the moments when one answer is not enough.</p></div><div className="mt-10 grid gap-5 lg:grid-cols-3">{packages.map((item, i) => <PackageCard key={item.slug} item={item} featured={i === 1} selected={compare.includes(item.slug)} onCompare={() => setCompare(prev => prev.includes(item.slug) ? prev.filter(x => x !== item.slug) : prev.length < 2 ? [...prev, item.slug] : prev)} onBook={() => setLocation(`/checkout?item=${item.slug}&type=package`)} />)}</div><div className="mt-14 rounded-[1.5rem] bg-[#002B73] p-7 text-white md:p-10"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#71dbe5]">Not sure yet?</p><h2 className="mt-2 font-display text-2xl font-bold">Compare side by side or ask a person.</h2><p className="mt-2 text-sm text-[#b9d4ec]">{compare.length ? `${compare.length} package${compare.length > 1 ? 's' : ''} selected for a closer look.` : 'Select up to two packages to compare what is included.'}</p></div><div className="flex flex-wrap gap-3">{compare.length > 0 && <Button variant="lime" onClick={() => setLocation(`/packages/${compare[0]}`)}>Compare selection <ArrowRight className="h-4 w-4" /></Button>}<Button variant="outline" onClick={() => setLocation('/concierge')}>Ask concierge</Button></div></div></div></main></Page>;
}
function PackageCard({ item, featured, selected, onCompare, onBook }: { item: Package; featured: boolean; selected: boolean; onCompare: () => void; onBook: () => void }) { return <article className={`relative flex flex-col rounded-[1.5rem] border p-6 ${featured ? 'border-[#0066D6] bg-[#edf8ff] shadow-[0_16px_35px_rgba(0,102,214,.12)]' : 'border-[#dcecf1] bg-white'}`} data-testid={`card-package-${item.slug}`}>{featured && <span className="absolute -top-3 left-6 rounded-full bg-[#7ACB00] px-3 py-1 text-[.68rem] font-bold text-[#173700]">Most chosen</span>}<p className="text-xs font-bold uppercase tracking-[.15em] text-[#008a9d]">{item.eyebrow}</p><h2 className="mt-4 font-display text-2xl font-bold text-[#002B73]">{item.name}</h2><p className="mt-3 min-h-14 text-sm leading-6 text-[#68859c]">{item.description}</p><div className="mt-6 flex items-baseline gap-2"><span className="font-display text-3xl font-bold text-[#002B73]">₹{item.price.toLocaleString('en-IN')}</span><span className="text-xs text-[#8ba0ae] line-through">₹{item.oldPrice.toLocaleString('en-IN')}</span></div><p className="mt-1 text-xs font-bold text-[#008A45]">{item.tests} markers included · {item.ideal}</p><div className="my-6 border-t border-[#dcecf1]" /><p className="text-xs font-bold uppercase tracking-[.14em] text-[#7b95a7]">Inside your package</p><ul className="mt-4 grid gap-3">{item.includes.map(inc => <li key={inc} className="flex gap-2 text-sm text-[#52718c]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#008A45]" />{inc}</li>)}</ul><div className="mt-auto pt-7"><Button onClick={onBook} className="w-full">Book package <ArrowRight className="h-4 w-4" /></Button><button onClick={onCompare} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold ${selected ? 'bg-[#d8f4e7] text-[#008A45]' : 'text-[#0066D6] hover:bg-[#eaf6ff]'}`} data-testid={`button-compare-${item.slug}`}>{selected ? <Check className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}{selected ? 'Added to comparison' : 'Add to compare'}</button></div></article>; }

function PackageDetailPage() { const { slug } = useParams<{ slug: string }>(); const item = packages.find(x => x.slug === slug) ?? packages[0]; const [, setLocation] = useLocation(); return <Page><main className="page-shell py-12 md:py-16"><Link href="/packages" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#0066D6]" data-testid="link-back-packages">← Back to packages</Link><div className="grid gap-10 lg:grid-cols-[1fr_22rem]"><div><Eyebrow>{item.eyebrow}</Eyebrow><h1 className="font-display text-4xl font-bold tracking-[-.055em] text-[#002B73] md:text-6xl">{item.name}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#52718c]">{item.description} One booking, a simple collection experience, and a report you can return to.</p><div className="mt-10 rounded-[1.5rem] bg-[#eaf7fb] p-7"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#008a9d]">What’s included</p><div className="mt-6 grid gap-3 md:grid-cols-2">{item.includes.map((inc, index) => <div key={inc} className="flex items-center gap-3 rounded-xl bg-white p-4"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e6f6da] text-xs font-bold text-[#008A45]">{String(index + 1).padStart(2, '0')}</span><span className="text-sm font-bold text-[#315271]">{inc}</span></div>)}</div></div><div className="mt-10 grid gap-3 md:grid-cols-3"><DetailStat icon={TestTube2} label="Included" value={`${item.tests} markers`} /><DetailStat icon={HomeIcon} label="Collection" value="At home or centre" /><DetailStat icon={FileText} label="Result" value="Digital report" /></div></div><aside className="card-calm h-fit p-6 lg:sticky lg:top-24"><p className="text-sm text-[#68859c]">Package price</p><p className="mt-1 font-display text-4xl font-bold tracking-[-.06em] text-[#002B73]">₹{item.price.toLocaleString('en-IN')}</p><p className="mt-1 text-sm text-[#8ba0ae] line-through">₹{item.oldPrice.toLocaleString('en-IN')}</p><div className="my-6 border-t border-[#e5eff2]" /><p className="flex items-center gap-2 text-sm font-bold text-[#002B73]"><ShieldCheck className="h-4 w-4 text-[#008A45]" /> Partner lab shown at checkout</p><Button onClick={() => setLocation(`/checkout?item=${item.slug}&type=package`)} className="mt-6 w-full">Book this package <ArrowRight className="h-4 w-4" /></Button></aside></div></main></Page>; }

function ServicePage({ kind }: { kind: 'collection' | 'ecg' }) { const isEcg = kind === 'ecg'; const [, setLocation] = useLocation(); return <Page><main><section className={`relative overflow-hidden ${isEcg ? 'bg-[#002B73] text-white' : 'bg-[#eaf7fb]'} py-16 md:py-24`}><div className="page-shell grid items-center gap-12 lg:grid-cols-[1fr_.8fr]"><div><Eyebrow>{isEcg ? 'Coming to your home' : 'Home sample collection'}</Eyebrow><h1 className={`font-display text-4xl font-bold leading-tight tracking-[-.06em] md:text-6xl ${isEcg ? 'text-white' : 'text-[#002B73]'}`}>{isEcg ? <>A heart check,<br /><span className="text-[#71dbe5]">without the commute.</span></> : <>A calm morning<br /><span className="text-[#0066D6]">starts at home.</span></>}</h1><p className={`mt-6 max-w-xl text-lg leading-8 ${isEcg ? 'text-[#c4dced]' : 'text-[#52718c]'}`}>{isEcg ? 'Book a trained technician for a resting ECG at home. A practical service for supported areas, with your report shared digitally.' : 'A trained phlebotomist arrives at your chosen time, collects your sample carefully, and leaves you with one less thing to organise.'}</p><div className="mt-8 flex flex-wrap gap-3"><Button onClick={() => isEcg ? setLocation('/checkout?item=home-ecg&type=service') : setLocation('/tests')} variant={isEcg ? 'lime' : 'primary'}>{isEcg ? 'Request home ECG' : 'Choose a test for home collection'} <ArrowRight className="h-4 w-4" /></Button><Button onClick={() => setLocation(`/service-areas?service=${kind}`)} variant="outline">Check service areas</Button></div></div><div className={`relative min-h-[18rem] rounded-[2rem] p-8 ${isEcg ? 'bg-[#0a3b83]' : 'bg-white shadow-calm'}`}><div className="absolute right-8 top-8 h-20 w-20 rounded-full border border-[#72d7df]/50" /><div className="absolute bottom-8 left-8 h-28 w-28 rounded-full border-[18px] border-[#cfeef0]/70" /><div className="relative mt-8"><span className={`grid h-14 w-14 place-items-center rounded-2xl ${isEcg ? 'bg-[#00AFC5] text-[#002B73]' : 'bg-[#dff1ff] text-[#0066D6]'}`}>{isEcg ? <Heart className="h-7 w-7" /> : <HomeIcon className="h-7 w-7" />}</span><p className={`mt-10 font-display text-2xl font-bold ${isEcg ? 'text-white' : 'text-[#002B73]'}`}>{isEcg ? 'Technician visit' : 'Home visit'}</p><p className={`mt-2 max-w-xs text-sm leading-6 ${isEcg ? 'text-[#c4dced]' : 'text-[#68859c]'}`}>{isEcg ? 'A resting ECG in a familiar room, at a time you choose.' : 'Early morning slots available in supported areas.'}</p></div></div></div></section><section className="page-shell py-20"><SectionHeading eyebrow="How it feels" title={isEcg ? 'Simple from request to report.' : 'The little details are taken care of.'} /><div className="grid gap-4 md:grid-cols-3"><Step number="01" title="Choose a time" copy="Pick a slot that fits your morning and add the person being cared for." /><Step number="02" title="We come to you" copy={isEcg ? 'A trained technician explains the process before starting.' : 'Your collector arrives with the right supplies and partner details.'} /><Step number="03" title="Find your report" copy="See the status in Bookings, then access the digital report in Reports." /></div></section></main></Page>; }
function Step({ number, title, copy }: { number: string; title: string; copy: string }) { return <div className="rounded-[1.4rem] border border-[#dcecf1] bg-white p-6"><span className="font-display text-sm font-bold text-[#00AFC5]">{number}</span><h3 className="mt-10 font-display text-xl font-bold text-[#002B73]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#68859c]">{copy}</p></div>; }

function SimplePage({ title, eyebrow, copy, icon: Icon = Info, children, action }: { title: string; eyebrow: string; copy: string; icon?: IconType; children?: ReactNode; action?: ReactNode }) { return <Page><main className="page-shell py-14 md:py-20"><div className="max-w-3xl"><Eyebrow>{eyebrow}</Eyebrow><div className="flex items-start gap-5"><span className="mt-1 grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#dff1ff] text-[#0066D6]"><Icon className="h-7 w-7" /></span><div><h1 className="font-display text-4xl font-bold leading-tight tracking-[-.055em] text-[#002B73] md:text-6xl">{title}</h1><p className="mt-5 text-lg leading-8 text-[#52718c]">{copy}</p>{action && <div className="mt-7">{action}</div>}</div></div></div>{children}</main></Page>; }

function HowItWorks() { return <SimplePage eyebrow="The AnDiCare way" title="Good care starts with clarity." copy="From your first search to the report in your account, we keep the process calm, visible and easy to revisit." icon={Sparkles}><div className="mt-14 grid gap-4 md:grid-cols-3"><Step number="01" title="Find your answer" copy="Browse tests and packages with useful, plain-language details." /><Step number="02" title="Choose your setting" copy="Book a centre visit, home collection or a home ECG where available." /><Step number="03" title="Stay in the loop" copy="Follow your booking and find reports in one tidy place." /></div><div className="mt-12 rounded-[1.5rem] bg-[#002B73] p-8 text-white"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#71dbe5]">One important thing</p><h2 className="mt-3 font-display text-2xl font-bold">AnDiCare helps you book. It does not replace medical advice.</h2><p className="mt-3 max-w-2xl leading-7 text-[#bdd5e8]">We show partner information and service details clearly. For questions about symptoms, results or treatment, speak with a qualified healthcare professional.</p></div></SimplePage>; }
function PartnersPage() { return <SimplePage eyebrow="Our network" title="Local partners, clearly named." copy="AnDiCare brings together verified partner providers across Indore and nearby areas. You see the partner before you confirm." icon={ShieldCheck}><div className="mt-14 grid gap-4 md:grid-cols-3">{partners.map(p => <div key={p.name} className={`card-calm ${p.color} p-6`}><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#0066D6]"><Stethoscope className="h-6 w-6" /></div><h2 className="mt-6 font-display text-xl font-bold text-[#002B73]">{p.name}</h2><p className="mt-2 text-sm font-bold text-[#315271]">{p.area}</p><p className="mt-5 text-sm leading-6 text-[#52718c]">{p.note}</p><p className="mt-5 border-t border-black/5 pt-4 text-xs text-[#68859c]">{p.since}</p></div>)}</div><p className="mt-8 text-xs leading-6 text-[#68859c]">Partner details are sample information for this prototype and will be connected to live provider records later.</p></SimplePage>; }
function ServiceAreas() { const params = new URLSearchParams(window.location.search); const service = params.get('service'); const [, setLocation] = useLocation(); const areas = ['Indore', 'Rau', 'Mhow', 'Pithampur', 'Dewas', 'Ujjain']; const [selectedArea, setSelectedArea] = useState(''); const isAvailable = areas.indexOf(selectedArea) < 4; return <SimplePage eyebrow="Where we are" title="Care that reaches your neighbourhood." copy="Choose the area where you need care. We’ll use it to guide the right booking path and show whether the service is currently available." icon={MapPin}><div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{areas.map((area, i) => { const available = i < 4; const selected = selectedArea === area; return <button key={area} onClick={() => setSelectedArea(area)} className={`flex items-center justify-between rounded-2xl border p-5 text-left transition ${selected ? 'border-[#0066D6] bg-[#edf8ff] shadow-[0_10px_24px_rgba(0,102,214,.12)]' : 'border-[#dcecf1] bg-white hover:-translate-y-0.5 hover:border-[#9bc6e6]'}`} data-testid={`button-service-area-${area.toLowerCase()}`}><span className="flex items-center gap-3 font-bold text-[#002B73]"><MapPin className="h-4 w-4 text-[#00AFC5]" />{area}</span><span className={`rounded-full px-2.5 py-1 text-[.68rem] font-bold ${selected ? 'bg-[#0066D6] text-white' : available ? 'bg-[#e5f7ed] text-[#008A45]' : 'bg-[#fff5d8] text-[#956500]'}`}>{selected ? 'Selected' : available ? 'Available' : 'Expanding soon'}</span></button>; })}</div>{selectedArea && <div className="mt-8 rounded-[1.5rem] bg-[#002B73] p-7 text-white md:flex md:items-center md:justify-between md:gap-8"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#71dbe5]">Selected area</p><h2 className="mt-2 font-display text-2xl font-bold">{selectedArea}</h2><p className="mt-2 text-sm leading-6 text-[#bdd5e8]">{isAvailable ? 'This area is currently supported for the available service slots.' : 'This area is marked as expanding soon and may not have bookable slots yet.'}</p></div>{isAvailable && <div className="mt-5 flex flex-wrap gap-3 md:mt-0">{(!service || service === 'ecg') && <Button variant="lime" onClick={() => setLocation(`/checkout?item=home-ecg&type=service&area=${encodeURIComponent(selectedArea)}`)}>Book Home ECG <ArrowRight className="h-4 w-4" /></Button>}<Button variant="outline" onClick={() => setLocation(`/tests?area=${encodeURIComponent(selectedArea)}`)}>Find home collection tests <ArrowRight className="h-4 w-4" /></Button></div>}</div>}</SimplePage>; }
function ComingSoon() { return <SimplePage eyebrow="On our roadmap" title="More ways to feel looked after." copy="We are exploring new services with the same focus on clear information and thoughtful doorstep care." icon={Zap}><div className="mt-12 grid gap-4 md:grid-cols-3"><Feature icon={Heart} title="Preventive care plans" copy="A more connected way to keep recurring health needs on track." /><Feature icon={Baby} title="Paediatric collection" copy="Gentler planning for the small people in your family." /><Feature icon={LineChart} title="Trend insights" copy="A more useful view of how your health information changes over time." /></div><p className="mt-8 text-sm text-[#68859c]">These services are not bookable yet. Join the waitlist through Concierge to hear when they become available.</p></SimplePage>; }

function HealthDiary() { const [note, setNote] = useState(''); const [saved, setSaved] = useState(false); return <SimplePage eyebrow="Your private space" title="A diary for the details you want to remember." copy="Keep notes alongside your reports and bookings. This prototype stores your note only for this session." icon={Heart}><div className="mt-12 grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="card-calm p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#008a9d]">Personal note</p><h2 className="mt-2 font-display text-xl font-bold text-[#002B73]">How are you feeling?</h2></div><ClipboardList className="h-5 w-5 text-[#00AFC5]" /></div><textarea value={note} onChange={e => { setNote(e.target.value); setSaved(false); }} placeholder="Add a note for your next appointment..." className="mt-6 min-h-40 w-full resize-none rounded-xl border border-[#cfe3eb] bg-[#f7fcfd] p-4 text-sm leading-6 outline-none focus:border-[#0066D6]" data-testid="textarea-diary-note" /><div className="mt-4 flex items-center justify-between"><span className="text-xs text-[#68859c]">{saved ? 'Saved for this session' : 'Private to your account'}</span><Button onClick={() => setSaved(true)} disabled={!note.trim()}>Save note</Button></div></div><div className="grid gap-4"><div className="card-calm p-6"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#008a9d]">A gentle prompt</p><h2 className="mt-4 font-display text-2xl font-bold text-[#002B73]">What would you like to ask next time?</h2><p className="mt-3 text-sm leading-6 text-[#68859c]">Write down questions while they are fresh. Your future self will thank you.</p></div><Link href="/reports" className="card-calm flex items-center justify-between p-6 transition hover:-translate-y-1" data-testid="card-diary-reports"><span><p className="text-xs text-[#68859c]">Your latest</p><p className="mt-1 font-bold text-[#002B73]">View health reports</p></span><ArrowUpRight className="h-5 w-5 text-[#0066D6]" /></Link></div></div></SimplePage>; }

function FamilyPage() { const [members, setMembers] = useState(['Me', 'Aarav']); const [adding, setAdding] = useState(false); const [name, setName] = useState(''); return <SimplePage eyebrow="Care together" title="One place for your family’s care." copy="Create simple profiles so the right person is attached to every booking and report." icon={Users}><div className="mt-12 max-w-2xl"><div className="grid gap-3 sm:grid-cols-2">{members.map((member, i) => <div key={member} className="card-calm flex items-center gap-4 p-5"><span className={`grid h-11 w-11 place-items-center rounded-full ${i ? 'bg-[#d8f4e7] text-[#008A45]' : 'bg-[#dff1ff] text-[#0066D6]'}`}><UserRound className="h-5 w-5" /></span><div><p className="font-bold text-[#002B73]">{member}</p><p className="text-xs text-[#68859c]">{i ? 'Family member' : 'Primary profile'}</p></div><Check className="ml-auto h-4 w-4 text-[#008A45]" /></div>)}</div>{adding ? <form onSubmit={e => { e.preventDefault(); if (name.trim()) { setMembers([...members, name.trim()]); setName(''); setAdding(false); } }} className="mt-4 rounded-2xl border border-[#b9d9e8] bg-white p-5"><label className="text-sm font-bold text-[#002B73]">Name</label><input value={name} onChange={e => setName(e.target.value)} autoFocus className="mt-2 w-full rounded-xl border border-[#cfe3eb] p-3 outline-none focus:border-[#0066D6]" data-testid="input-family-name" /><div className="mt-4 flex gap-2"><Button type="submit">Add profile</Button><Button onClick={() => setAdding(false)} variant="ghost">Cancel</Button></div></form> : <Button onClick={() => setAdding(true)} variant="outline" className="mt-5"><Plus className="h-4 w-4" /> Add family member</Button>}</div></SimplePage>; }

function BookingsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [upcoming, setUpcoming] = useState<BookingRecord[]>(() => readSavedBookings());
  const [editing, setEditing] = useState<number | null>(null);
  const [draftDate, setDraftDate] = useState('');
  const [draftTime, setDraftTime] = useState('');
  const [draftAddress, setDraftAddress] = useState('');
  const [saved, setSaved] = useState<number | null>(null);
  const dates = ['Tomorrow · 18 Sep', 'Saturday · 19 Sep', 'Sunday · 20 Sep'];
  const timeSlots = ['7:00–8:00 AM', '8:00–9:00 AM', '10:00–11:00 AM'];

  useEffect(() => {
    let active = true;
    fetch(`/api/bookings?customerKey=${encodeURIComponent(getCustomerKey())}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load bookings');
        return (await response.json()) as BookingRecord[];
      })
      .then((serverBookings) => {
        if (!active || serverBookings.length === 0) return;
        setUpcoming(serverBookings);
        writeSavedBookings(serverBookings);
      })
      .catch(() => {
        // The local list remains visible when the API is temporarily unavailable.
      });
    return () => {
      active = false;
    };
  }, []);

  const startEditing = (index: number) => {
    const booking = upcoming[index];
    setEditing(index);
    setDraftDate(booking.date);
    setDraftTime(booking.time);
    setDraftAddress(booking.address);
    setSaved(null);
  };

  const saveBooking = (index: number) => {
    const updated = upcoming.map((booking, bookingIndex) =>
      bookingIndex === index
        ? {
            ...booking,
            date: draftDate,
            time: draftTime,
            address: draftAddress,
            detail: `${booking.method} · ${draftDate}, ${draftTime}`,
            status: 'Updated',
          }
        : booking,
    );
    setUpcoming(updated);
    writeSavedBookings(updated.filter((booking) => !booking.isDemo));
    const booking = updated[index];
    void fetch(`/api/bookings/${encodeURIComponent(booking.id)}?customerKey=${encodeURIComponent(getCustomerKey())}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: booking.date,
        time: booking.time,
        address: booking.address,
        detail: booking.detail,
        status: booking.status,
      }),
    });
    setEditing(null);
    setSaved(index);
  };

  return (
    <SimplePage
      eyebrow="Your care timeline"
      title="Bookings"
      copy="Keep every appointment, collection and next step in view."
      icon={CalendarDays}
    >
      <div className="mt-10 flex gap-2 border-b border-[#dcecf1]">
        <button
          onClick={() => setTab('upcoming')}
          className={`border-b-2 px-4 py-3 text-sm font-bold ${
            tab === 'upcoming'
              ? 'border-[#0066D6] text-[#0066D6]'
              : 'border-transparent text-[#68859c]'
          }`}
          data-testid="button-upcoming-bookings"
        >
          Upcoming
        </button>
        <button
          onClick={() => setTab('past')}
          className={`border-b-2 px-4 py-3 text-sm font-bold ${
            tab === 'past'
              ? 'border-[#0066D6] text-[#0066D6]'
              : 'border-transparent text-[#68859c]'
          }`}
          data-testid="button-past-bookings"
        >
          Past
        </button>
      </div>

      {tab === 'upcoming' ? (
        upcoming.length > 0 ? (
          <div className="mt-5 grid gap-4">
            {upcoming.map((booking, i) => (
            <div key={booking.title} className="card-calm p-5">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                <div className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eaf6ff] text-[#0066D6]">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-bold text-[#002B73]">{booking.title}</h2>
                    <p className="mt-1 text-sm text-[#68859c]">{booking.detail}</p>
                    <p className="mt-2 text-xs text-[#8ba0ae]">{booking.partner}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      saved === i || booking.status === 'Updated'
                        ? 'bg-[#e5f7ed] text-[#008A45]'
                        : i
                          ? 'bg-[#fff5d8] text-[#956500]'
                          : 'bg-[#e5f7ed] text-[#008A45]'
                    }`}
                  >
                    {saved === i ? 'Saved' : booking.status}
                  </span>
                  <button
                    onClick={() => startEditing(i)}
                    className="rounded-xl border border-[#9bc6e6] px-3 py-2 text-xs font-bold text-[#0066D6] hover:bg-[#edf8ff]"
                    data-testid={`button-edit-booking-${i}`}
                  >
                    Edit
                  </button>
                </div>
              </div>

              {editing === i && (
                <div className="mt-5 grid gap-5 border-t border-[#e5eff2] pt-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold text-[#315271]">
                      Date
                      <select
                        value={draftDate}
                        onChange={(event) => setDraftDate(event.target.value)}
                        className="rounded-xl border border-[#cfe3eb] bg-white p-3 font-normal outline-none focus:border-[#0066D6]"
                        data-testid={`select-booking-date-${i}`}
                      >
                        {dates.map((date) => (
                          <option key={date}>{date}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-bold text-[#315271]">
                      Time
                      <select
                        value={draftTime}
                        onChange={(event) => setDraftTime(event.target.value)}
                        className="rounded-xl border border-[#cfe3eb] bg-white p-3 font-normal outline-none focus:border-[#0066D6]"
                        data-testid={`select-booking-time-${i}`}
                      >
                        {timeSlots.map((slot) => (
                          <option key={slot}>{slot}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm font-bold text-[#315271]">
                    Address
                    <textarea
                      value={draftAddress}
                      onChange={(event) => setDraftAddress(event.target.value)}
                      rows={2}
                      className="resize-none rounded-xl border border-[#cfe3eb] p-3 font-normal outline-none focus:border-[#0066D6]"
                      data-testid={`input-edit-booking-address-${i}`}
                    />
                  </label>
                  <div className="flex gap-2">
                    <Button onClick={() => saveBooking(i)}>
                      Save changes <Check className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => setEditing(null)} variant="ghost">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No upcoming bookings yet"
            copy="Once you confirm a test or package, your booking details will appear here."
            action={
              <Link
                href="/tests"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0066D6] px-5 text-sm font-bold text-white"
                data-testid="link-book-first-test"
              >
                Browse tests <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        )
      ) : (
        <EmptyState
          title="No past bookings yet"
          copy="Completed bookings and their reports will appear here."
          action={<Button onClick={() => window.history.back()}>Back to care</Button>}
        />
      )}
    </SimplePage>
  );
}

function ReportsPage() { const reports = [{ name: 'Complete Blood Count (CBC)', date: '04 Jun 2025', partner: 'LifeLine Diagnostics', kind: 'Routine' }, { name: 'Thyroid Profile', date: '12 Apr 2025', partner: 'Aarogyam Labs', kind: 'Hormones' }]; return <SimplePage eyebrow="Your information" title="Reports, when you need them." copy="A calmer way to find the results you have already received." icon={FileText}><div className="mt-10 rounded-2xl border border-[#f4dd9b] bg-[#fffaf0] p-4 text-sm leading-6 text-[#795b1f]"><Info className="mr-2 inline h-4 w-4" /> Reports are informational. Please discuss results with a qualified healthcare professional.</div><div className="mt-5 grid gap-3">{reports.map(report => <div key={report.name} className="card-calm flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-[#002B73]">{report.name}</h2><span className="rounded-full bg-[#eaf6ff] px-2 py-1 text-[.68rem] font-bold text-[#0066D6]">{report.kind}</span></div><p className="mt-2 text-sm text-[#68859c]">{report.date} · {report.partner}</p></div><Button onClick={() => alert('Report preview will be connected to the partner report service.')} variant="outline"><FileText className="h-4 w-4" /> View report</Button></div>)}</div></SimplePage>; }

function LibraryPage() { const [selected, setSelected] = useState<string | null>(null); return <SimplePage eyebrow="The health library" title="Useful context, without the noise." copy="Short, practical reads to help you prepare, ask better questions and understand the care journey." icon={FileText}><div className="mt-12 grid gap-4 md:grid-cols-3">{articles.concat([{ tag: 'Choosing care', title: 'When a home collection makes sense', time: '4 min read', color: 'cyan' }]).map(article => <button key={article.title} onClick={() => setSelected(article.title)} className="card-calm group text-left p-6 transition hover:-translate-y-1 hover:shadow-calm" data-testid={`button-article-${article.title.slice(0, 10).replaceAll(' ', '-')}`}><span className="text-xs font-bold uppercase tracking-[.14em] text-[#008a9d]">{article.tag}</span><h2 className="mt-12 font-display text-xl font-bold leading-tight text-[#002B73] group-hover:text-[#0066D6]">{article.title}</h2><p className="mt-4 text-xs text-[#68859c]">{article.time}</p><span className="mt-7 inline-flex items-center gap-1 text-sm font-bold text-[#0066D6]">Read article <ArrowRight className="h-4 w-4" /></span></button>)}</div>{selected && <div className="fixed inset-0 z-50 grid place-items-center bg-[#002B73]/45 p-4" onClick={() => setSelected(null)}><div className="max-w-lg rounded-[1.5rem] bg-white p-7 shadow-calm" onClick={e => e.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><Eyebrow>From the library</Eyebrow><h2 className="font-display text-2xl font-bold text-[#002B73]">{selected}</h2></div><button onClick={() => setSelected(null)} className="rounded-full p-2 hover:bg-[#edf8ff]" data-testid="button-close-article"><X className="h-5 w-5" /></button></div><p className="mt-5 leading-7 text-[#52718c]">Good health information should give you a clearer next question, not more worry. Use this guide as a starting point, and bring anything important to a qualified healthcare professional.</p><Button onClick={() => setSelected(null)} className="mt-6">Done</Button></div></div>}</SimplePage>; }

function ConciergePage() { const [sent, setSent] = useState(false); return <SimplePage eyebrow="A human in the loop" title="Not sure what to book?" copy="Tell us what you are trying to organise. Our concierge can help you compare services and understand the booking steps." icon={MessageCircle}><div className="mt-12 grid gap-8 lg:grid-cols-[1fr_.75fr]"><form onSubmit={e => { e.preventDefault(); setSent(true); }} className="card-calm p-6"><label className="text-sm font-bold text-[#002B73]">How can we help?</label><textarea required placeholder="For example: I need a yearly check-up for my parents..." className="mt-3 min-h-36 w-full rounded-xl border border-[#cfe3eb] bg-[#f7fcfd] p-4 text-sm outline-none focus:border-[#0066D6]" data-testid="textarea-concierge" /><div className="mt-4 grid gap-3 sm:grid-cols-2"><input required type="text" placeholder="Your name" className="rounded-xl border border-[#cfe3eb] p-3 text-sm outline-none focus:border-[#0066D6]" data-testid="input-concierge-name" /><input required type="tel" placeholder="Phone number" className="rounded-xl border border-[#cfe3eb] p-3 text-sm outline-none focus:border-[#0066D6]" data-testid="input-concierge-phone" /></div><Button type="submit" className="mt-5">{sent ? <><Check className="h-4 w-4" /> Request received</> : <>Send to concierge <ArrowRight className="h-4 w-4" /></>}</Button></form><div className="rounded-[1.5rem] bg-[#002B73] p-7 text-white"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#71dbe5]">Prefer to talk?</p><h2 className="mt-4 font-display text-2xl font-bold">We are here Monday to Saturday.</h2><p className="mt-3 text-sm leading-6 text-[#b9d4ec]">Our team can help with service areas, preparation questions and booking details.</p><div className="mt-8 grid gap-3 text-sm"><span className="flex items-center gap-3"><Phone className="h-4 w-4 text-[#7ACB00]" /> +91 731 410 2080</span><span className="flex items-center gap-3"><Mail className="h-4 w-4 text-[#7ACB00]" /> hello@andicare.in</span></div></div></div></SimplePage>; }

function LoginPage() { const [mode, setMode] = useState<'login' | 'register'>('login'); const [, setLocation] = useLocation(); return <Page><main className="grid min-h-[calc(100dvh-4.6rem)] items-center bg-[#eaf7fb] py-12"><div className="page-shell grid max-w-5xl items-center gap-12 lg:grid-cols-[1fr_25rem]"><div className="hidden lg:block"><Eyebrow>Your care, together</Eyebrow><h1 className="font-display text-5xl font-bold leading-tight tracking-[-.06em] text-[#002B73]">A quieter place<br />for your health.</h1><p className="mt-5 max-w-md leading-7 text-[#52718c]">Sign in to keep bookings, reports and family profiles in one secure place.</p><div className="mt-9 flex gap-5 text-sm text-[#315271]"><span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#008A45]" /> Secure account</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#008A45]" /> Your information</span></div></div><form onSubmit={e => { e.preventDefault(); setLocation('/bookings'); }} className="card-calm p-7 md:p-9"><Logo /><div className="mt-9"><h2 className="font-display text-2xl font-bold text-[#002B73]">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="mt-2 text-sm text-[#68859c]">{mode === 'login' ? 'Pick up where you left off.' : 'Start keeping your care in one place.'}</p></div><div className="mt-7 grid gap-4"><label className="grid gap-2 text-sm font-bold text-[#315271]">Email or phone<input required type="text" className="rounded-xl border border-[#cfe3eb] p-3 font-normal outline-none focus:border-[#0066D6]" data-testid="input-auth-identity" /></label><label className="grid gap-2 text-sm font-bold text-[#315271]">Password<input required type="password" className="rounded-xl border border-[#cfe3eb] p-3 font-normal outline-none focus:border-[#0066D6]" data-testid="input-auth-password" /></label></div><Button type="submit" className="mt-6 w-full">{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight className="h-4 w-4" /></Button><button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="mt-5 w-full text-sm font-bold text-[#0066D6]" data-testid="button-toggle-auth">{mode === 'login' ? 'New to AnDiCare? Create an account' : 'Already have an account? Sign in'}</button><p className="mt-6 text-center text-xs leading-5 text-[#8ba0ae]">By continuing, you agree to our <Link href="/terms" className="font-bold text-[#0066D6]" data-testid="link-auth-terms">Terms</Link> and <Link href="/privacy" className="font-bold text-[#0066D6]" data-testid="link-auth-privacy">Privacy Policy</Link>.</p></form></div></main></Page>; }

function CheckoutPage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type') ?? 'test';
  const itemSlug = params.get('item') ?? 'cbc';
  const area = params.get('area') ?? 'Indore';
  const item =
    type === 'package'
      ? packages.find((x) => x.slug === itemSlug) ?? packages[0]
      : type === 'service'
        ? { slug: 'home-ecg', name: 'Home ECG', price: 449 }
        : tests.find((x) => x.slug === itemSlug) ?? tests[0];
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const [method, setMethod] = useState('Home collection');
  const [address, setAddress] = useState(type === 'service' ? `${area} service area` : '22, Saket Nagar, Indore');
  const [customerName, setCustomerName] = useState('Ananya Mehta');
  const [customerPhone, setCustomerPhone] = useState('+91 98 7654 3210');
  const [selectedDate, setSelectedDate] = useState('Tomorrow · 18 Sep');
  const [selectedTime, setSelectedTime] = useState('7:00–8:00 AM');
  const [savingBooking, setSavingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const dates = ['Tomorrow · 18 Sep', 'Saturday · 19 Sep', 'Sunday · 20 Sep'];
  const timeSlots = ['7:00–8:00 AM', '8:00–9:00 AM', '10:00–11:00 AM'];
  const handleConfirm = async () => {
    setSavingBooking(true);
    setBookingError('');
    const bookingId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `and-${Date.now().toString(36)}`;
    const bookingPayload = {
      id: bookingId,
      customerKey: getCustomerKey(),
      customerName,
      customerPhone,
      title: item.name,
      detail: `${method} · ${selectedDate}, ${selectedTime}`,
      status: 'Booking requested',
      partner: 'Partner selection pending',
      date: selectedDate,
      time: selectedTime,
      address: method === 'Home collection' ? address : `${area} partner centre`,
      method,
      area,
      price: item.price,
    };
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });
      const savedBooking = (await response.json()) as BookingRecord & { error?: string };
      if (!response.ok) throw new Error(savedBooking.error ?? 'Unable to save booking');
      addSavedBooking(savedBooking);
      setLocation(`/booking-confirmation?bookingId=${encodeURIComponent(bookingId)}`);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Unable to save booking');
    } finally {
      setSavingBooking(false);
    }
  };

  return (
    <Page>
      <main className="page-shell py-12 md:py-16">
        <Link
          href={type === 'package' ? '/packages' : type === 'service' ? '/home-ecg' : '/tests'}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#0066D6]"
          data-testid="link-checkout-back"
        >
          ← Back
        </Link>
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div>
            <Eyebrow>Secure booking</Eyebrow>
            <h1 className="font-display text-4xl font-bold tracking-[-.055em] text-[#002B73]">
              Let’s make this easy.
            </h1>
            <div className="mt-8 flex items-center gap-2">
              {['Your details', 'Choose a slot', 'Confirm'].map((label, i) => (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                      step > i
                        ? 'bg-[#0066D6] text-white'
                        : 'bg-[#eaf6ff] text-[#0066D6]'
                    }`}
                  >
                    {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className="hidden text-xs font-bold text-[#52718c] sm:block">
                    {label}
                  </span>
                  {i < 2 && <span className="h-px flex-1 bg-[#dcecf1]" />}
                </div>
              ))}
            </div>

            <div className="card-calm mt-8 p-6 md:p-8">
              {step === 1 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#002B73]">
                    Who is this for?
                  </h2>
                  <p className="mt-2 text-sm text-[#68859c]">
                    We use this to keep the right person attached to the report.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold text-[#315271]">
                      Full name
                      <input
                        value={customerName}
                        onChange={(event) => setCustomerName(event.target.value)}
                        className="rounded-xl border border-[#cfe3eb] p-3 font-normal outline-none focus:border-[#0066D6]"
                        data-testid="input-booking-name"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-bold text-[#315271]">
                      Phone number
                      <input
                        value={customerPhone}
                        onChange={(event) => setCustomerPhone(event.target.value)}
                        className="rounded-xl border border-[#cfe3eb] p-3 font-normal outline-none focus:border-[#0066D6]"
                        data-testid="input-booking-phone"
                      />
                    </label>
                  </div>
                  <Button onClick={() => setStep(2)} className="mt-7">
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#002B73]">
                    Choose how it happens
                  </h2>
                  <div className="mt-6 grid gap-3">
                    <button
                      onClick={() => setMethod('Home collection')}
                      className={`flex items-center gap-4 rounded-xl border p-4 text-left ${
                        method === 'Home collection'
                          ? 'border-[#0066D6] bg-[#edf8ff]'
                          : 'border-[#dcecf1]'
                      }`}
                      data-testid="button-method-home"
                    >
                      <HomeIcon className="h-5 w-5 text-[#0066D6]" />
                      <span className="flex-1">
                        <strong className="block text-sm text-[#002B73]">
                          Home collection
                        </strong>
                        <small className="text-xs text-[#68859c]">
                          Collector visits your saved address
                        </small>
                      </span>
                      <span
                        className={`h-4 w-4 rounded-full border-4 ${
                          method === 'Home collection'
                            ? 'border-[#0066D6]'
                            : 'border-[#cfe3eb]'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => setMethod('Centre visit')}
                      className={`flex items-center gap-4 rounded-xl border p-4 text-left ${
                        method === 'Centre visit'
                          ? 'border-[#0066D6] bg-[#edf8ff]'
                          : 'border-[#dcecf1]'
                      }`}
                      data-testid="button-method-centre"
                    >
                      <MapPin className="h-5 w-5 text-[#0066D6]" />
                      <span className="flex-1">
                        <strong className="block text-sm text-[#002B73]">
                          Centre visit
                        </strong>
                        <small className="text-xs text-[#68859c]">
                          Indore · Choose a partner slot
                        </small>
                      </span>
                      <span
                        className={`h-4 w-4 rounded-full border-4 ${
                          method === 'Centre visit'
                            ? 'border-[#0066D6]'
                            : 'border-[#cfe3eb]'
                        }`}
                      />
                    </button>
                  </div>

                  {method === 'Home collection' && (
                    <div className="mt-7 grid gap-6 border-t border-[#e5eff2] pt-6">
                      <label className="grid gap-2 text-sm font-bold text-[#315271]">
                        Collection address
                        <textarea
                          value={address}
                          onChange={(event) => setAddress(event.target.value)}
                          rows={2}
                          className="resize-none rounded-xl border border-[#cfe3eb] p-3 font-normal outline-none focus:border-[#0066D6]"
                          data-testid="input-booking-address"
                        />
                        <span className="text-xs font-normal text-[#68859c]">
                          The collector will visit this address.
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="mt-7 grid gap-4 border-t border-[#e5eff2] pt-6">
                    <div>
                      <p className="text-sm font-bold text-[#315271]">Choose a date</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {dates.map((date) => (
                          <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={`rounded-xl border px-3 py-3 text-left text-sm font-bold ${
                              selectedDate === date
                                ? 'border-[#0066D6] bg-[#edf8ff] text-[#002B73]'
                                : 'border-[#dcecf1] text-[#52718c]'
                            }`}
                            data-testid={`button-date-${date.split(' ')[0].toLowerCase()}`}
                          >
                            <CalendarDays className="mb-2 h-4 w-4 text-[#0066D6]" />
                            {date}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#315271]">Choose a time</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`rounded-xl border px-3 py-3 text-sm font-bold ${
                              selectedTime === slot
                                ? 'border-[#0066D6] bg-[#edf8ff] text-[#002B73]'
                                : 'border-[#dcecf1] text-[#52718c]'
                            }`}
                            data-testid={`button-time-${slot.split('–')[0].replace(':', '')}`}
                          >
                            <Clock3 className="mr-2 inline h-4 w-4 text-[#0066D6]" />
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 flex gap-2">
                    <Button onClick={() => setStep(1)} variant="ghost">
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)}>
                      Review booking <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#002B73]">
                    Ready to confirm?
                  </h2>
                  <div className="mt-6 rounded-xl bg-[#eff8fb] p-5">
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-[#008a9d]">
                      Booking summary
                    </p>
                    <p className="mt-3 font-bold text-[#002B73]">{item.name}</p>
                    <div className="mt-3 grid gap-2 text-sm text-[#68859c]">
                      <p className="flex gap-2">
                        <HomeIcon className="h-4 w-4 shrink-0 text-[#0066D6]" />
                        {method}
                      </p>
                      <p className="flex gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0 text-[#0066D6]" />
                        {selectedDate} · {selectedTime}
                      </p>
                      <p className="flex gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-[#0066D6]" />
                        {method === 'Home collection' ? address : `${area} partner centre`}
                      </p>
                    </div>
                    <p className="mt-4 font-display text-2xl font-bold text-[#002B73]">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <p className="mt-5 flex gap-2 text-xs leading-5 text-[#68859c]">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#008A45]" />
                    Partner details and any applicable payment information will be shown before final confirmation.
                  </p>
                  {bookingError && <p className="mt-4 rounded-xl bg-[#ffe8e8] p-3 text-sm text-[#b42318]" role="alert">{bookingError}</p>}
                  <div className="mt-7 flex gap-2">
                    <Button onClick={() => setStep(2)} variant="ghost">
                      Edit details
                    </Button>
                    <Button onClick={handleConfirm} disabled={savingBooking}>
                      {savingBooking ? 'Saving booking…' : 'Confirm booking'} <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <aside className="card-calm h-fit p-6 lg:sticky lg:top-24">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#008a9d]">
              You’re booking
            </p>
            <h2 className="mt-4 font-display text-xl font-bold text-[#002B73]">
              {item.name}
            </h2>
            <div className="mt-5 border-t border-[#e5eff2] pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-[#68859c]">Service price</span>
                <strong className="text-[#002B73]">
                  ₹{item.price.toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-[#68859c]">Partner</span>
                <strong className="text-[#002B73]">Shown next</strong>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </Page>
  );
}

function ConfirmationPage() { return <Page><main className="page-shell grid min-h-[calc(100dvh-4.6rem)] place-items-center py-16"><div className="max-w-xl text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#d8f4e7] text-[#008A45]"><Check className="h-9 w-9" /></span><Eyebrow>Booking received</Eyebrow><h1 className="font-display text-4xl font-bold tracking-[-.055em] text-[#002B73] md:text-5xl">You’re all set.</h1><p className="mt-5 text-lg leading-8 text-[#52718c]">Your booking request is safely with the partner team. We’ll keep the next step visible in your account.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/bookings" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0066D6] px-5 text-sm font-bold text-white" data-testid="link-confirmation-bookings">View my bookings <ArrowRight className="h-4 w-4" /></Link><Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#9bc6e6] px-5 text-sm font-bold text-[#002B73]" data-testid="link-confirmation-home">Back home</Link></div></div></main></Page>; }

function FAQPage() { const [open, setOpen] = useState<number | null>(null); const qs = [['What is AnDiCare?', 'AnDiCare is a healthcare and diagnostics booking platform that helps you discover tests, packages and doorstep services from partner providers.'], ['Who fulfils my test?', 'The partner laboratory or service provider is shown during your booking journey. AnDiCare helps organise the experience; it does not operate every laboratory.'], ['Can I book for a family member?', 'Yes. Family profiles help you attach a booking and report to the right person.'], ['When will I receive my report?', 'Timing depends on the test and partner. You will see an indicative report time on the test detail and booking.'], ['Does AnDiCare provide medical advice?', 'No. We provide service information and booking support. Please speak with a qualified healthcare professional about symptoms or results.']]; return <SimplePage eyebrow="Questions, answered" title="A clearer place to start." copy="If your question is not here, our concierge can help." icon={LifeBuoy} action={<Link href="/concierge" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0066D6] px-5 text-sm font-bold text-white" data-testid="link-faq-concierge">Ask concierge <ArrowRight className="h-4 w-4" /></Link>}><div className="mt-12 max-w-3xl">{qs.map(([q, a], i) => <div key={q} className="border-b border-[#dcecf1]"><button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-5 py-5 text-left font-bold text-[#002B73]" data-testid={`button-faq-${i}`}><span>{q}</span>{open === i ? <Minus className="h-4 w-4 text-[#0066D6]" /> : <Plus className="h-4 w-4 text-[#0066D6]" />}</button>{open === i && <p className="pb-5 pr-8 text-sm leading-7 text-[#68859c] animate-fade">{a}</p>}</div>)}</div></SimplePage>; }

function ContactPage() { const [sent, setSent] = useState(false); return <SimplePage eyebrow="Talk to us" title="We’re close when you need us." copy="For booking questions, partnerships or feedback, send a note and the right team will pick it up." icon={Mail}><div className="mt-12 grid gap-8 lg:grid-cols-[1fr_.7fr]"><form onSubmit={e => { e.preventDefault(); setSent(true); }} className="card-calm p-6"><div className="grid gap-4 sm:grid-cols-2"><input required placeholder="Your name" className="rounded-xl border border-[#cfe3eb] p-3 text-sm outline-none focus:border-[#0066D6]" data-testid="input-contact-name" /><input required type="email" placeholder="Email address" className="rounded-xl border border-[#cfe3eb] p-3 text-sm outline-none focus:border-[#0066D6]" data-testid="input-contact-email" /></div><textarea required placeholder="What would you like to tell us?" className="mt-4 min-h-40 w-full rounded-xl border border-[#cfe3eb] p-4 text-sm outline-none focus:border-[#0066D6]" data-testid="textarea-contact-message" /><Button type="submit" className="mt-4">{sent ? 'Message sent' : 'Send message'} <ArrowRight className="h-4 w-4" /></Button></form><div className="grid gap-4"><div className="card-calm p-6"><Phone className="h-5 w-5 text-[#0066D6]" /><h2 className="mt-5 font-display text-xl font-bold text-[#002B73]">Call concierge</h2><p className="mt-2 text-sm text-[#68859c]">+91 731 410 2080<br />Monday–Saturday, 9 AM–6 PM</p></div><div className="card-calm p-6"><MapPin className="h-5 w-5 text-[#0066D6]" /><h2 className="mt-5 font-display text-xl font-bold text-[#002B73]">Find us in Indore</h2><p className="mt-2 text-sm text-[#68859c]">Partner network across Indore and nearby areas.</p></div></div></div></SimplePage>; }

function OffersPage() { return <SimplePage eyebrow="Thoughtful value" title="Good care, made more approachable." copy="Occasional offers on popular tests and packages. The details are always clear before you book." icon={Award}><div className="mt-12 grid gap-4 md:grid-cols-2"><div className="rounded-[1.5rem] bg-[#002B73] p-7 text-white"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#71dbe5]">Popular this month</p><h2 className="mt-4 font-display text-3xl font-bold">Save on your next baseline.</h2><p className="mt-3 text-sm leading-6 text-[#bdd5e8]">Explore Essential Wellness and keep the full set of markers in one booking.</p><Link href="/packages/essential-wellness" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#7ACB00] px-5 text-sm font-bold text-[#173700]" data-testid="link-offer-package">See Essential Wellness <ArrowRight className="h-4 w-4" /></Link></div><div className="rounded-[1.5rem] bg-[#e5f7ed] p-7 text-[#002B73]"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#008A45]">Home care</p><h2 className="mt-4 font-display text-3xl font-bold">Early slots, less waiting.</h2><p className="mt-3 text-sm leading-6 text-[#52716f]">Check home collection availability for your area and preferred morning slot.</p><Link href="/home-collection" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0066D6] px-5 text-sm font-bold text-white" data-testid="link-offer-collection">Explore collection <ArrowRight className="h-4 w-4" /></Link></div></div></SimplePage>; }

function AboutPage() { return <SimplePage eyebrow="Why AnDiCare" title="Healthcare navigation with a human point of view." copy="We believe booking a test should not require a spreadsheet, a dozen calls or medical vocabulary. AnDiCare gives people a calmer way to take the next step." icon={Heart}><div className="mt-14 grid gap-4 md:grid-cols-3"><Feature icon={ShieldCheck} title="Clear by default" copy="Partner, price, sample and report details are easy to find." /><Feature icon={Users} title="Built for real households" copy="Book for yourself, parents or children without losing the thread." /><Feature icon={Sparkles} title="Always improving" copy="We are starting local and learning from every care journey." /></div></SimplePage>; }
function LegalPage({ kind }: { kind: 'privacy' | 'terms' | 'refund' }) { const title = kind === 'privacy' ? 'Privacy, in plain language.' : kind === 'terms' ? 'Terms that set expectations.' : 'Refunds should not be mysterious.'; return <SimplePage eyebrow="AnDiCare policies" title={title} copy="This prototype contains a concise summary. Before launch, these pages will be reviewed and replaced with the complete policy for the live service." icon={LockKeyhole}><div className="prose prose-slate mt-12 max-w-3xl"><h2>What this page covers</h2><p>We are designing AnDiCare to be transparent about service partners, booking details and the information needed to support your request.</p><h2>For the live product</h2><p>The final policy will explain account information, booking records, reports, communications, cancellations and partner responsibilities in full.</p><h2>Questions</h2><p>Contact our team if you need help understanding any policy or a booking decision.</p></div></SimplePage>; }

function EmptyState({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) { return <div className="rounded-[1.5rem] border border-dashed border-[#b9d9e8] bg-[#f7fcfd] p-10 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf6ff] text-[#0066D6]"><Search className="h-5 w-5" /></span><h2 className="mt-5 font-display text-xl font-bold text-[#002B73]">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68859c]">{copy}</p>{action && <div className="mt-5">{action}</div>}</div>; }
function NotFound() { return <SimplePage eyebrow="That page moved" title="Let’s get you back to care." copy="The page you were looking for is not here, but there is plenty of good next-step information waiting." icon={Info} action={<Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0066D6] px-5 text-sm font-bold text-white" data-testid="link-404-home">Back to home <ArrowRight className="h-4 w-4" /></Link>} />; }

function Router() { return <ErrorBoundary resetKey={window.location.pathname}><Switch><Route path="/" component={Home} /><Route path="/tests" component={TestsPage} /><Route path="/tests/:slug" component={TestDetailPage} /><Route path="/packages" component={PackagesPage} /><Route path="/packages/:slug" component={PackageDetailPage} /><Route path="/home-collection" component={() => <ServicePage kind="collection" />} /><Route path="/home-ecg" component={() => <ServicePage kind="ecg" />} /><Route path="/partners" component={PartnersPage} /><Route path="/how-it-works" component={HowItWorks} /><Route path="/health-diary" component={HealthDiary} /><Route path="/family" component={FamilyPage} /><Route path="/bookings" component={BookingsPage} /><Route path="/reports" component={ReportsPage} /><Route path="/library" component={LibraryPage} /><Route path="/concierge" component={ConciergePage} /><Route path="/about" component={AboutPage} /><Route path="/contact" component={ContactPage} /><Route path="/offers" component={OffersPage} /><Route path="/service-areas" component={ServiceAreas} /><Route path="/coming-soon" component={ComingSoon} /><Route path="/login" component={LoginPage} /><Route path="/checkout" component={CheckoutPage} /><Route path="/booking-confirmation" component={ConfirmationPage} /><Route path="/admin" component={AdminPage} /><Route path="/faq" component={FAQPage} /><Route path="/privacy" component={() => <LegalPage kind="privacy" />} /><Route path="/terms" component={() => <LegalPage kind="terms" />} /><Route path="/refund-policy" component={() => <LegalPage kind="refund" />} /><Route component={NotFound} /></Switch></ErrorBoundary>; }
function App() { const isAdminRoute = window.location.pathname.startsWith('/admin'); return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>{!isAdminRoute && <Header />}<Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }
export default App;