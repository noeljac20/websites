/**
 * Site content. Everything a non-developer might want to change lives here.
 * Items marked TODO should be checked with Declan before launch.
 *
 * Writing rules for this file: plain, warm, confident English. Short sentences.
 * Sentence case. No exclamation marks, no quotations, no em dashes, no slang.
 */
export const site = {
  name: "Declan Muay Thai",
  coach: "Declan",
  tagline: "Private Muay Thai coaching",
  gym: "The Headhunters Gym",
  // TODO: confirm suburb / street address with Declan.
  // This value is a fallback only. The booking flow, confirmation and manage pages show mt_settings.location (coach Settings tab);
  // keep the two in step until the address is confirmed.
  location: "The Headhunters Gym, Melbourne",
  email: "", // TODO: Declan's real email — leave empty until confirmed; Instagram is the only known contact channel
  phone: "", // TODO: e.g. "+61 4xx xxx xxx" — enables tap-to-call / SMS links
  instagram: "https://instagram.com/declan_woodss",
  instagramHandle: "@declan_woodss",
  /** Declan's post says spots are limited; set to false to hide the notice. Shown once, in the hero. */
  limitedSpots: true, // TODO: confirm with Declan that spots are still limited before launch
  limitedSpotsText: "Limited spots available.",
  // TODO: no response-time promise is made anywhere. If Declan commits to one (for example within 24 hours), add it here
  // as a single sentence and reuse it on the booking form, confirmation page and manage page.
  bookingNotice: "Declan confirms every request personally.",
  // TODO: switch this back to "the link in your confirmation email" once email sending is set up (see Book.tsx).
  cancelNote: "You can cancel from the manage link shown on your confirmation page.",
  paymentNote: "Nothing is paid online. Payment is arranged directly with Declan.", // TODO: confirm preferred payment method with Declan
  hero: {
    eyebrow: "The Headhunters Gym, Melbourne",
    headline: ["Private Muay Thai coaching", "with Declan Woods"],
    sub: "One-on-one sessions tailored to your experience level and goals. Each session covers technique, pad work and fitness, and builds a strong foundation. Beginners and intermediate students are welcome, and kids aged 7 and up can book a shorter session.",
  },
  stats: [
    { value: "$40", label: "1-on-1 Training, 1 hour" },
    { value: "$30", label: "Kids Training, 45 minutes" },
    { value: "Ages 7+", label: "Kids Training" },
    { value: "1-on-1", label: "Every session is private" },
  ],
  about: {
    eyebrow: "About",
    title: "About Declan",
    paragraphs: [
      "Declan Woods is a Muay Thai competitor who trains and coaches at The Headhunters Gym in Melbourne.",
      "In 2026 he won gold at the Muay Thai Australia National Championships. He coaches the same way he trains: technique, pad work and fitness, built into a strong foundation you can keep developing.", // TODO: confirm title wording / organisation / division with Declan
      "Every session is one-on-one and tailored to your experience level and goals. Complete beginners are welcome, as are intermediate students who want to sharpen their skills. Kids aged 7 and up can train in a 45-minute session.",
    ],
    highlights: [
      "Gold medal, 2026 Muay Thai Australia National Championships", // TODO: confirm title wording / organisation / division with Declan
      "Active competitor",
      "Trains and coaches at The Headhunters Gym",
      "Beginner and intermediate levels welcome",
      "Kids Training from age 7",
    ],
    podiumCaption: "Muay Thai Australia National Championships, 2026", // TODO: confirm title wording with Declan
  },
  /** Two-image band below the about section. Captions sit under the images, not on top of them. */
  training: {
    eyebrow: "The gym",
    title: "Training at The Headhunters Gym",
    body: "Sessions run at The Headhunters Gym, where Declan trains and competes alongside his coach and training partners.",
    photos: [
      {
        src: "declan-win",
        alt: "Referee raising Declan's hand in the ring after a win",
        caption: "Declan after a win in the ring.",
      },
      {
        src: "declan-team",
        alt: "Declan with his coach and training partners outside The Headhunters Gym",
        caption: "Declan with his coach and training partners outside The Headhunters Gym.",
      },
    ],
  },
  // TODO: confirm session structure with Declan
  session: {
    eyebrow: "Sessions",
    title: "What a session includes",
    intro: "Each session is one-on-one and built around your experience level and goals.",
    steps: [
      {
        n: "01",
        title: "Warm up and check in",
        body: "A short warm-up, then a quick conversation about how you are feeling and what you want to work on.",
      },
      {
        n: "02",
        title: "Technique and pad work",
        body: "One or two techniques explained step by step, then practised on the pads until they feel natural.",
      },
      {
        n: "03",
        title: "Fitness and foundation",
        body: "Rounds and conditioning that bring the session together, and something to practise before next time.",
      },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Pricing",
    // TODO: confirm with Declan whether The Headhunters Gym charges a casual fee or needs a membership for private sessions.
    intro: "Pay per session. Nothing is paid online.",
    note: "Payment is arranged directly with Declan.", // TODO: confirm preferred payment method with Declan
  },
  howToBook: {
    eyebrow: "Booking",
    title: "How booking works",
    steps: [
      { title: "Choose a session", body: "1-on-1 Training, or Kids Training for ages 7 and up." },
      { title: "Choose a time", body: "Pick a time from Declan's live availability and add your details." },
      { title: "Declan confirms", body: "Declan confirms your request personally. Payment is arranged directly with him." },
    ],
    note: "Nothing is paid online. You can cancel from the manage link shown on your confirmation page.", // TODO: see cancelNote above
  },
  faq: {
    eyebrow: "Questions",
    title: "Common questions",
    items: [
      {
        q: "I have never trained before. Is that a problem?",
        a: "No. Complete beginners are welcome. Your first session covers the basics: stance, movement and a few clean strikes, at a pace that suits you.",
      },
      {
        q: "What do I need to bring?",
        a: "Comfortable training clothes, water and a towel. If you do not have gloves or wraps yet, mention it when you book and Declan will let you know what you need.", // TODO: confirm gear with Declan
      },
      {
        q: "Where are the sessions?",
        a: "Sessions run at The Headhunters Gym in Melbourne. Message Declan on Instagram if you need directions.", // TODO: gym address / suburb
      },
      {
        q: "How do I pay?",
        a: "Nothing is paid online. Payment is arranged directly with Declan.", // TODO: confirm preferred payment method with Declan
      },
      {
        q: "What if I need to cancel?",
        a: "Yes. Use the manage link shown on your confirmation page. Please give as much notice as you can so someone else can use the time.", // TODO: see cancelNote above
      },
      {
        q: "Do you train kids?",
        a: "Yes. Kids aged 7 and up can book a 45-minute session for $30. A parent or guardian makes the booking and brings the child to the gym.", // TODO: confirm kids supervision policy with Declan
      },
      {
        q: "Can I message Declan instead of booking online?",
        a: "Yes. Message @declan_woodss on Instagram to book or ask a question. Booking online holds your time straight away, and Declan still confirms personally.",
      },
    ],
  },
  finalCta: {
    eyebrow: "Get started",
    title: "Book your first session",
    body: "Choose a time that suits you. Nothing is paid online, and Declan confirms every request personally.",
  },
  experienceOptions: [
    { value: "never", label: "Never trained" },
    { value: "beginner", label: "Beginner (under 6 months)" },
    { value: "intermediate", label: "Intermediate" },
  ],
};

export const EXPERIENCE_LABEL: Record<string, string> = {
  // Legacy value from before the "Competing / fight prep" option was removed; kept so old bookings still render a label.
  fighter: "Competing / fight prep",
  ...Object.fromEntries(site.experienceOptions.map((o) => [o.value, o.label])),
};
