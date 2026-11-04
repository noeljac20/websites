/**
 * Site content. Everything a non-developer might want to change lives here.
 * Items marked TODO should be checked with Declan before launch.
 *
 * Writing rules: plain and brief. State facts, do not sell. Sentence case.
 * No exclamation marks, no quotations, no slogans.
 */
export const site = {
  name: "Declan Muay Thai",
  coach: "Declan",
  tagline: "Muay Thai coaching",
  gym: "The Headhunters Gym",
  // Fallback only. The booking flow, confirmation and manage pages show mt_settings.location (coach Settings tab).
  location: "The Headhunters Gym, 3 Pottery Cct, Pakenham VIC 3810",
  address: "3 Pottery Cct, Pakenham VIC 3810",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=The+Headhunters+Gym+3+Pottery+Cct+Pakenham+VIC+3810",
  email: "", // Not shown. Instagram is the contact channel.
  phone: "", // TODO: e.g. "+61 4xx xxx xxx" to enable a tap-to-call link
  instagram: "https://instagram.com/declan_woodss",
  instagramHandle: "@declan_woodss",
  /** Declan's post says spots are limited; set to false to hide the notice. */
  limitedSpots: false, // TODO: set to true if Declan wants the notice shown
  limitedSpotsText: "Limited spots available.",
  // TODO: no response-time promise is made anywhere. Add one here if Declan commits to it.
  bookingNotice: "Declan confirms each request.",
  // TODO: change to "the link in your confirmation email" once email sending is set up (see Book.tsx).
  cancelNote: "Cancel any time from the manage link on your confirmation page.",
  paymentNote: "Nothing is paid online. Payment is arranged with Declan.", // TODO: confirm payment method
  hero: {
    eyebrow: "The Headhunters Gym, Pakenham",
    headline: ["Muay Thai coaching", "with Declan Woods"],
    sub: "1-on-1 sessions for adults and kids from age 7. Beginner and intermediate.",
  },
  stats: [
    { value: "$40", label: "1-on-1 Training, 1 hour" },
    { value: "$30", label: "Kids Training, 45 minutes" },
  ],
  about: {
    eyebrow: "About",
    title: "Declan Woods",
    paragraphs: [
      "Declan Woods is a Muay Thai competitor and coach at The Headhunters Gym in Pakenham, where he trains under world champion Ramesh Habib.", // TODO: confirm Ramesh Habib's title wording
      "In 2026 he won gold at the Muay Thai Australia National Championships.", // TODO: confirm title wording / organisation / division
    ],
    /** Declan's own words, from his Instagram post (emojis removed, "your" corrected to "you're"). */
    fromInstagram: [
      "If you're looking to improve your skills, build confidence or get started in the sport, then this is for you.",
      "I offer 1-on-1 personal training sessions at The Headhunters Gym, with training tailored to your experience level and individual goals.",
      "Sessions focus on improving technique, pad work, fitness and building a strong foundation.",
      "Whether you're completely new or looking to sharpen your skills, all beginner and intermediate levels are welcome!",
      "1-on-1 Training: $40 (1 hour). Kids Training (Ages 7+): $30 (45 mins).",
      "DM me @declan_woodss to book a session or for any questions! Limited spots available.",
    ],
    highlights: [] as string[],
    podiumCaption: "Muay Thai Australia National Championships, 2026", // TODO: confirm wording
  },
  /** Two photos and two clips below the about section. */
  training: {
    eyebrow: "The gym",
    title: "The Headhunters Gym",
    body: "",
    photos: [
      {
        src: "declan-win",
        alt: "Referee raising Declan's hand in the ring after a win",
      },
      {
        src: "declan-team",
        alt: "Declan with his coach and training partners outside The Headhunters Gym",
      },
    ],
    clipsTitle: "In session",
  },
  sport: {
    eyebrow: "The sport",
    title: "Muay Thai and kickboxing",
    items: [
      {
        title: "Muay Thai",
        body: "The national sport of Thailand. A stand-up striking art that uses punches, kicks, elbows and knees, along with the clinch.",
      },
      {
        title: "Kickboxing",
        body: "A stand-up striking sport built on punches and kicks. Most rule sets leave out elbows and the clinch.",
      },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Pricing",
    // TODO: confirm whether the gym charges a casual fee or needs a membership for private sessions.
    intro: "Pay per session. Nothing is paid online.",
    note: "",
  },
  howToBook: {
    eyebrow: "Booking",
    title: "How booking works",
    steps: [
      { title: "Choose a session", body: "1-on-1 Training or Kids Training." },
      { title: "Choose a time", body: "Pick a time and add your details." },
      { title: "Declan confirms", body: "Payment is arranged with Declan." },
    ],
    note: "Cancel any time from the manage link on your confirmation page.", // TODO: see cancelNote
  },
  faq: {
    eyebrow: "Questions",
    title: "Questions",
    items: [
      { q: "I have never trained before. Is that a problem?", a: "No. Beginner and intermediate levels are both welcome." },
      { q: "Where are the sessions?", a: "The Headhunters Gym, 3 Pottery Cct, Pakenham VIC 3810." },
      { q: "How do I pay?", a: "Nothing is paid online. Payment is arranged with Declan." }, // TODO: confirm payment method
      { q: "What if I need to cancel?", a: "Use the manage link on your confirmation page. Give as much notice as you can." },
      { q: "Do you train kids?", a: "Yes. Ages 7 and up, 45 minutes, $30. A parent or guardian makes the booking." }, // TODO: confirm kids policy
      { q: "Can I book through Instagram instead?", a: "Yes. Message @declan_woodss." },
    ],
  },
  finalCta: {
    eyebrow: "Booking",
    title: "Book a session",
    body: "",
  },
  experienceOptions: [
    { value: "never", label: "Never trained" },
    { value: "beginner", label: "Beginner (under 6 months)" },
    { value: "intermediate", label: "Intermediate" },
  ],
};

export const EXPERIENCE_LABEL: Record<string, string> = {
  // Legacy value kept so old bookings still render a label.
  fighter: "Competing / fight prep",
  ...Object.fromEntries(site.experienceOptions.map((o) => [o.value, o.label])),
};
