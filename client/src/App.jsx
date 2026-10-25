
import { useState } from "react";
import Admin from "./Admin";

const API_URL = "http://localhost:3000/api/donors";

const bloodGroups = [
  "All blood groups",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const validBloodGroups = bloodGroups.filter(
  (group) => group !== "All blood groups"
);

const features = [
  {
    icon: "⌕",
    title: "Find blood donors",
    description:
      "Search for compatible donors by blood group and location when someone needs help.",
    color: "bg-red-50 text-red-600",
    href: "#find-donors",
  },
  {
    icon: "♡",
    title: "Become a donor",
    description:
      "Register your interest in donating blood and help make a difference in your community.",
    color: "bg-rose-50 text-rose-600",
    href: "#become-donor",
  },
  {
    icon: "✚",
    title: "Hospital directory",
    description:
      "Find hospital contact information to help you take the next step when time matters.",
    color: "bg-orange-50 text-orange-600",
    href: "#hospitals",
  },
];

function App() {
  // Donor search state
  const [bloodGroup, setBloodGroup] = useState("All blood groups");
  const [location, setLocation] = useState("");
  const [donors, setDonors] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Donor registration state
  const [donorName, setDonorName] = useState("");
  const [donorBloodGroup, setDonorBloodGroup] = useState("O+");
  const [donorCity, setDonorCity] = useState("");
  const [donorContact, setDonorContact] = useState("");
  const [donorConsent, setDonorConsent] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Search donors in the backend
  async function handleSearch(event) {
    event.preventDefault();

    if (!location.trim()) {
      setDonors([]);
      setSearched(false);
      setSearchMessage("Please enter a city or location to continue.");
      return;
    }

    setLoading(true);
    setSearched(false);
    setSearchMessage("");
    setDonors([]);

    try {
      const params = new URLSearchParams();

      if (bloodGroup !== "All blood groups") {
        params.set("bloodGroup", bloodGroup);
      }

      params.set("city", location.trim());

      const response = await fetch(
        `${API_URL}?${params.toString()}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to search donors.");
      }

      const results = data.donors || [];

      setDonors(results);
      setSearched(true);

      setSearchMessage(
        results.length > 0
          ? `Found ${results.length} donor(s) matching your search.`
          : "No donors found. Try another city or blood group."
      );
    } catch (error) {
      console.error("Donor search error:", error);
      setSearchMessage(
        "Unable to connect to the donor service. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }
  // Register a new donor
  async function handleRegistration(event) {
    event.preventDefault();

    if (
      !donorName.trim() ||
      !donorCity.trim() ||
      !donorContact.trim() ||
      !validBloodGroups.includes(donorBloodGroup)
    ) {
      setRegistrationSuccess(false);
      setRegistrationMessage("Please complete all fields correctly.");
      return;
    }

    if (!donorConsent) {
      setRegistrationSuccess(false);
      setRegistrationMessage(
        "Please provide consent before registering."
      );
      return;
    }

    setRegistering(true);
    setRegistrationMessage("");
    setRegistrationSuccess(false);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: donorName.trim(),
          bloodGroup: donorBloodGroup,
          city: donorCity.trim(),
          contact: donorContact.trim(),
          consent: donorConsent,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed.");
      }

      setRegistrationSuccess(true);
      setRegistrationMessage(
        "Registration successful! Thank you for volunteering."
      );

      setDonorName("");
      setDonorBloodGroup("O+");
      setDonorCity("");
      setDonorContact("");
      setDonorConsent(false);
    } catch (error) {
      console.error("Donor registration error:", error);
      setRegistrationSuccess(false);
      setRegistrationMessage(
        error.message || "Unable to register. Please try again."
      );
    } finally {
      setRegistering(false);
    }
  }

  // Show the admin page when the URL is /admin
  if (window.location.pathname === "/admin") {
    return <Admin />;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-800">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a
            href="#home"
            className="flex items-center gap-3"
            aria-label="Blood Bridge home"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-2xl text-white shadow-lg shadow-red-200">
              ♥
            </div>
            <div>
              <p className="text-xl font-extrabold tracking-tight text-slate-900">
                Blood<span className="text-red-600">Bridge</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Every drop matters
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#home" className="text-sm font-semibold text-red-600">
              Home
            </a>
            <a
              href="#find-donors"
              className="text-sm font-medium text-slate-600 transition hover:text-red-600"
            >
              Find Donors
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-red-600"
            >
              How It Works
            </a>
            <a
              href="#hospitals"
              className="text-sm font-medium text-slate-600 transition hover:text-red-600"
            >
              Hospitals
            </a>
          </div>

          <a
            href="#become-donor"
            className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-red-100 transition hover:bg-red-700"
          >
            Become a Donor <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section id="home" className="relative">
          <div className="absolute -right-32 -top-20 h-96 w-96 rounded-full bg-red-50 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-2 lg:px-8">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Connecting hearts. Saving lives.
              </div>

              <h1 className="max-w-2xl text-5xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                A little help can make a{" "}
                <span className="text-red-600">life-changing</span> difference.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">
                Blood Bridge brings blood donors and people in need closer
                together. Because when every moment matters, connection matters
                too.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#find-donors"
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-red-600 px-7 py-4 font-bold text-white shadow-xl shadow-red-200 transition hover:-translate-y-0.5 hover:bg-red-700"
                >
                  Find a Blood Donor <span aria-hidden="true">→</span>
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-4 font-bold text-slate-700 transition hover:border-red-200 hover:text-red-600"
                >
                  How it works
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                {[
                  "Community focused",
                  "Simple to use",
                  "Built around care",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <span className="font-bold text-green-600">✓</span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero illustration */}
            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute inset-6 rounded-[3rem] bg-red-100/70 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-red-100 bg-gradient-to-br from-rose-50 via-white to-red-100 p-7 shadow-2xl shadow-red-100/60 sm:p-10">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-600 shadow-sm">
                    The gift of life
                  </span>
                  <span className="text-2xl text-red-300">✦</span>
                </div>

                <div className="relative mx-auto my-9 flex h-60 w-60 items-center justify-center rounded-full border border-red-200/70 bg-white/70 sm:h-72 sm:w-72">
                  <div className="absolute h-48 w-48 rounded-full border border-dashed border-red-200 sm:h-60 sm:w-60" />
                  <div className="flex h-36 w-36 items-center justify-center rounded-[2.5rem] bg-red-600 text-8xl text-white shadow-2xl shadow-red-300 sm:h-44 sm:w-44">
                    ♥
                  </div>
                  <div className="absolute -right-1 top-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-red-600 shadow-lg">
                    ✚
                  </div>
                  <div className="absolute -bottom-1 left-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-black text-red-600 shadow-lg">
                    O+
                  </div>
                </div>

                <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl text-green-600">
                      ✓
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">
                        One act of kindness
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Can mean everything to someone.
                      </p>
                    </div>
                    <span className="text-2xl text-red-500">♡</span>
                  </div>
                </div>
              </div>

              <div className="absolute -left-3 top-28 hidden rounded-2xl bg-white px-4 py-3 shadow-xl sm:block">
                <p className="text-xs text-slate-500">
                  A simple way to help
                </p>
                <p className="mt-1 font-bold text-slate-800">
                  Give hope. Give blood.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Donor Search */}
        <section id="find-donors" className="bg-slate-50 px-5 py-16 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                Find help nearby
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Find a blood donor
              </h2>
              <p className="mt-3 leading-7 text-slate-500">
                Start by selecting a blood group and entering your location.
              </p>
            </div>

            <form
              onSubmit={handleSearch}
              className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8"
            >
              <div className="grid gap-5 md:grid-cols-[1fr_1.4fr_auto] md:items-end">
                <div>
                  <label
                    htmlFor="bloodGroup"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Blood group
                  </label>
                  <select
                    id="bloodGroup"
                    value={bloodGroup}
                    onChange={(event) => setBloodGroup(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-slate-700 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                  >
                    {bloodGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    City or location
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-50">
                    <span className="text-xl text-red-500" aria-hidden="true">
                      ⌖
                    </span>
                    <input
                      id="location"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="Enter city or area"
                      className="min-w-0 flex-1 bg-transparent py-4 text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-red-600 px-7 py-4 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Searching..." : "Search donors →"}
                </button>
              </div>

              {searchMessage && (
                <p
                  role="status"
                  className="mt-5 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700"
                >
                  {searchMessage}
                </p>
              )}

              {searched && donors.length > 0 && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {donors.map((donor) => (
                    <article
                      key={donor._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-red-600">
                          {donor.bloodGroup}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">
                            {donor.name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {donor.city}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium text-green-700">
                        Listed as available
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Features */}
        <section className="px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                What we do
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Bringing people together for a greater good
              </h2>
              <p className="mt-4 leading-7 text-slate-500">
                A more connected way to find help, offer support, and discover
                local healthcare resources.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="group rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-red-100 hover:shadow-xl hover:shadow-red-100/40"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${feature.color}`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="mt-6 text-xl font-extrabold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-500">
                    {feature.description}
                  </p>
                  <a
                    href={feature.href}
                    className="mt-6 inline-flex items-center gap-2 font-bold text-red-600 transition group-hover:gap-3"
                  >
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-slate-50 px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                Simple steps, meaningful impact
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                How Blood Bridge works
              </h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Search",
                  text: "Choose a blood group and enter the location where help is needed.",
                },
                {
                  number: "02",
                  title: "Connect",
                  text: "Explore available donor listings and follow up through appropriate healthcare services.",
                },
                {
                  number: "03",
                  title: "Make a difference",
                  text: "Eligible donors can help patients by donating through appropriate healthcare services.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="relative rounded-2xl bg-white p-7"
                >
                  <span className="text-sm font-black tracking-widest text-red-600">
                    STEP {step.number}
                  </span>
                  <h3 className="mt-4 text-xl font-extrabold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-500">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Donor Registration */}
        <section id="become-donor" className="px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                Make a difference
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Become a blood donor
              </h2>
              <p className="mt-4 leading-7 text-slate-500">
                Register your interest in helping people in your community.
              </p>
            </div>

            <form
              onSubmit={handleRegistration}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="donorName"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Full name
                  </label>
                  <input
                    id="donorName"
                    value={donorName}
                    onChange={(event) => setDonorName(event.target.value)}
                    required
                    maxLength={100}
                    autoComplete="name"
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="donorBloodGroup"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Blood group
                  </label>
                  <select
                    id="donorBloodGroup"
                    value={donorBloodGroup}
                    onChange={(event) =>
                      setDonorBloodGroup(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-red-500"
                  >
                    {validBloodGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="donorCity"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    City
                  </label>
                  <input
                    id="donorCity"
                    value={donorCity}
                    onChange={(event) => setDonorCity(event.target.value)}
                    required
                    maxLength={100}
                    autoComplete="address-level2"
                    placeholder="e.g. Hyderabad"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="donorContact"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Contact number
                  </label>
                  <input
                    id="donorContact"
                    type="tel"
                    value={donorContact}
                    onChange={(event) =>
                      setDonorContact(event.target.value)
                    }
                    required
                    maxLength={20}
                    autoComplete="tel"
                    placeholder="Enter your phone number"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-slate-600">
                <input
                  type="checkbox"
                  checked={donorConsent}
                  onChange={(event) =>
                    setDonorConsent(event.target.checked)
                  }
                  required
                  className="mt-1 h-4 w-4 accent-red-600"
                />
                <span>
                  I consent to Blood Bridge storing the information I submit
                  for donor coordination. I understand that registration does
                  not guarantee eligibility to donate.
                </span>
              </label>

              <button
                type="submit"
                disabled={registering}
                className="mt-6 w-full rounded-xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {registering ? "Registering..." : "Register as a donor →"}
              </button>

              {registrationMessage && (
                <p
                  role="status"
                  className={`mt-4 rounded-xl p-4 text-sm ${
                    registrationSuccess
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {registrationMessage}
                </p>
              )}
            </form>
          </div>
        </section>

        {/* Hospital Directory Placeholder */}
        <section
          id="hospitals"
          className="bg-slate-50 px-5 py-12 text-center"
        >
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Hospital directory
            </h2>
            <p className="mt-3 leading-7 text-slate-500">
              Hospital listings and contact information will be added in a
              future update.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white px-5 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <a
            href="#home"
            className="flex items-center gap-2 font-extrabold text-slate-900"
          >
            <span className="text-2xl text-red-600">♥</span>
            Blood<span className="-ml-2 text-red-600">Bridge</span>
          </a>
          <p className="text-center text-sm text-slate-400">
            Built with care for a community that cares.
          </p>
          <a
            href="#home"
            className="text-sm font-semibold text-slate-500 hover:text-red-600"
          >
            Back to top ↑
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
