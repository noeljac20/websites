/**
 * Site content. Everything a non-developer might want to change lives here.
 * Items marked TODO should be checked with Declan before launch.
 */
export const site = {
  name: "Declan Muay Thai",
  coach: "Declan",
  tagline: "Private Muay Thai coaching",
  location: "Melbourne, VIC", // TODO: gym name + suburb
  email: "hello@declanmuaythai.com", // TODO: Declan's real email
  phone: "", // TODO: e.g. "+61 4xx xxx xxx" — enables tap-to-call / SMS links
  instagram: "", // TODO: e.g. "https://instagram.com/declan.muaythai"
  bookingNotice: "Declan confirms every request personally, usually within 24 hours.",
  hero: {
    eyebrow: "Private Muay Thai coaching · Melbourne",
    headline: ["Train with", "someone who", "still fights."],
    sub: "One-on-one Muay Thai sessions with Declan, an active competitor and 2026 national champion. Sixty minutes, all on you. Complete beginners welcome.",
  },
  stats: [
    { value: "$40", label: "per hour session" },
    { value: "60", label: "minutes, 1:1" },
    { value: "2026", label: "national champion" }, // TODO: confirm title wording with Declan
    { value: "All", label: "levels welcome" },
  ],
  marquee: ["Pads", "Clinch", "Kicks", "Elbows", "Knees", "Footwork", "Fight IQ", "Conditioning"],
  about: {
    eyebrow: "About Declan",
    title: "Coached from the ring, not the sidelines.",
    paragraphs: [
      "Declan is an active Muay Thai fighter competing out of Melbourne. He trains, cuts weight, and steps into the ring the same way he'll ask you to train: with intent, good habits, and no wasted rounds.",
      "In 2026 he took gold at the Muay Thai Australia National Championships. He coaches the way he was coached: simple fundamentals drilled until they're automatic, then built into combinations you can actually use.",
      "Sessions are private and personal. Whether you've never thrown a kick or you're preparing for your first fight, the hour is built around you.",
    ],
    highlights: [
      "2026 Muay Thai Australia National Championships — gold", // TODO: confirm division
      "Active amateur competitor",
      "Private sessions since 2024", // TODO: confirm
      "Beginners, fitness and fight prep",
    ],
    quote: "Every round has a purpose. If you can't tell me why we're doing it, I'm not coaching properly.",
  },
  session: {
    eyebrow: "What a session looks like",
    title: "Sixty minutes, zero filler.",
    steps: [
      {
        n: "01",
        title: "Warm up & move",
        body: "Skipping, shadow boxing and mobility to get the hips open and the hands up. We check in on how you're feeling and what we're working on today.",
      },
      {
        n: "02",
        title: "Technique & pads",
        body: "The core of the hour. One or two techniques broken down properly, then drilled on the pads until they feel natural. Filmed if you want it.",
      },
      {
        n: "03",
        title: "Rounds & review",
        body: "Put it together under a bit of pressure: timed rounds, light clinch, conditioning finisher. We finish with what to practise before next time.",
      },
    ],
  },
  howToBook: [
    { title: "Pick a session", body: "Single hour, partner session or a pack." },
    { title: "Choose a time", body: "Live availability, mornings and evenings." },
    { title: "Turn up ready", body: "Declan confirms, you bring water and a towel." },
  ],
  faq: [
    {
      q: "I've never trained before. Is that a problem?",
      a: "Not at all. Most people who book have never trained Muay Thai. Your first session is about movement, the basic stance and throwing a few clean strikes. Nobody gets thrown in the deep end.",
    },
    {
      q: "What do I need to bring?",
      a: "Comfortable training clothes, water and a towel. Gloves, pads and wraps are provided for your first sessions. If you keep training we'll help you pick your own gloves.",
    },
    {
      q: "Where are the sessions?",
      a: "Sessions run in Melbourne. The exact gym address is sent with your confirmation.", // TODO: gym address
    },
    {
      q: "How do I pay?",
      a: "Pay on the day by cash or bank transfer. Packs are paid up front at your first session.",
    },
    {
      q: "What if I need to cancel?",
      a: "Life happens. Cancel or move your session from the link in your confirmation. Please give at least 12 hours' notice so someone else can use the slot.",
    },
    {
      q: "Can I bring a friend?",
      a: "Yes, book a 2-on-1 Partner Session. Same coaching, shared hour, and you split the cost.",
    },
  ],
  experienceOptions: [
    { value: "never", label: "Never trained" },
    { value: "beginner", label: "Beginner (under 6 months)" },
    { value: "intermediate", label: "Intermediate" },
    { value: "fighter", label: "Competing / fight prep" },
  ],
};

export const EXPERIENCE_LABEL: Record<string, string> = Object.fromEntries(
  site.experienceOptions.map((o) => [o.value, o.label]),
);
