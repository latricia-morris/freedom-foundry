export type BrandPowerMoveField = {
  p: string;
  t: "short_text" | "long_text" | "choice" | "checklist" | "rating" | "date";
  n?: number;
  o?: readonly string[];
  labels?: readonly string[];
};

export type BrandPowerMovePage = {
  title: string;
  fields: readonly BrandPowerMoveField[];
};

export type BrandPowerMove = {
  title: string;
  pages: readonly BrandPowerMovePage[];
};

export const powerMoves7to12 = [
  {
    title: "Power Move 7: Vibe Marketing",
    pages: [
      { title: "The Vibe Blueprint", fields: [
        { p: "The vibe in 3 words:", t: "short_text", n: 3, labels: ["Vibe word 1:", "Vibe word 2:", "Vibe word 3:"] },
        { p: "The buyer guard getting in the way:", t: "long_text" },
        { p: "What raises that guard (3 things you will not do):", t: "long_text", n: 3 },
        { p: "What lowers that guard (3 signals you will lead with):", t: "long_text", n: 3 },
        { p: "The anti-vibe (3 words you refuse to feel like):", t: "short_text", n: 3, labels: ["Anti-vibe 1:", "Anti-vibe 2:", "Anti-vibe 3:"] },
      ] },
      { title: "PART 2: THE CUE (WHAT MAKES YOU RECOGNIZABLE ON CONTACT)", fields: [
        { p: "Signature cue (one repeatable thing people will remember):", t: "long_text" },
        { p: "Where it shows up (3 places):", t: "short_text", n: 3 },
        { p: "PART 3: THE RULES (WHAT KEEPS THE VIBE CONSISTENT)", t: "long_text", n: 5, labels: ["Rule 1:", "Rule 2:", "Rule 3:", "Rule 4:", "Rule 5:"] },
      ] },
      { title: "PART 4: THE FIRST IMPRESSION (WHERE THE VIBE GETS DECIDED)", fields: [
        { p: "Pick the three touchpoints where buyers form their first impression.", t: "short_text", n: 3, labels: ["Touchpoint 1:", "Touchpoint 2:", "Touchpoint 3:"] },
        { p: "For each touchpoint, write what must be true right away so the vibe lands. Think: what they see, hear, feel, or experience in the first 10 seconds.", t: "long_text", n: 3, labels: ["What must be true? 1.", "2.", "3."] },
      ] },
      { title: "PART 5: THE THREE CHANGES (WHAT YOU WILL CHANGE THIS WEEK)", fields: [
        { p: "Environment change:", t: "long_text" }, { p: "Communication change:", t: "long_text" }, { p: "Friction removal:", t: "long_text" },
        { p: "If the vibe is _________________________, then ___________________________ cannot feel __________________________________________.", t: "short_text" },
      ] },
      { title: "PART 7: 7-DAY TEST", fields: [
        { p: "What changed?", t: "long_text" }, { p: "What did buyers do differently?", t: "long_text" }, { p: "What felt better?", t: "long_text" },
        { p: "What still felt off?", t: "long_text" }, { p: "What gets enforced next?", t: "long_text" },
      ] },
    ],
  },
  {
    title: "Power Move 8: World-Building",
    pages: [
      { title: "The World-Building Stack", fields: [
        { p: "World name (internal working name):", t: "short_text" }, { p: "One-line description (what this world is for):", t: "long_text" },
        { p: "Who belongs here (one sentence):", t: "long_text" }, { p: "Who does not (one sentence):", t: "long_text" },
      ] },
      { title: "LAYER 1: LANGUAGE", fields: [
        { p: "Use list (10 words or phrases that belong here):", t: "short_text", n: 10 }, { p: "Refuse list (10 words or phrases banned here):", t: "short_text", n: 10 },
        { p: "Clarity rule (finish the sentence): If a new person cannot understand it in 10 seconds, then the language is too clever.", t: "long_text" },
      ] },
      { title: "LAYER 2: RHYTHMS", fields: [
        { p: "Rhythm 1:", t: "long_text" }, { p: "Rhythm 2:", t: "long_text" }, { p: "Rhythm 3:", t: "long_text" },
        { p: "Optional Rhythm 4:", t: "long_text" }, { p: "Optional Rhythm 5:", t: "long_text" },
        { p: "Rhythm rule (finish the sentence): If the rhythm is optional, then the world is optional.", t: "long_text" },
      ] },
      { title: "LAYER 3: SYMBOLS AND ARTIFACTS", fields: [
        { p: "Gateway artifact (low-friction, attaches to an existing habit): What is it?", t: "long_text" }, { p: "What habit does it attach to?", t: "long_text" },
        { p: "Rite-of-passage artifact (earned, not bought): What gets completed to earn it?", t: "long_text" }, { p: "What do they receive?", t: "long_text" },
        { p: "Authority artifact (signals rank, competence, or credibility inside the world): What behavior or proof earns it?", t: "long_text" }, { p: "What is the visible marker?", t: "long_text" },
        { p: "Rhythm artifact (tool that makes the rhythm easier): What rhythm does it support?", t: "long_text" }, { p: "What tool makes it stick?", t: "long_text" },
        { p: "Relational artifact (creates recognition between members): What is the marker?", t: "long_text" }, { p: "What does it signal to “the room”?", t: "long_text" },
      ] },
      { title: "LAYER 4: STATUS MARKERS", fields: [
        { p: "What earns respect here (5 behaviors):", t: "long_text", n: 5 }, { p: "What disqualifies someone here (5 behaviors):", t: "long_text", n: 5 },
      ] },
      { title: "LAYER 5: RULES AND ENFORCEMENT", fields: [
        { p: "Rule 1:", t: "long_text" }, { p: "Rule 2:", t: "long_text" }, { p: "Rule 3:", t: "long_text" }, { p: "Rule 4:", t: "long_text" }, { p: "Rule 5:", t: "long_text" },
        { p: "Enforcement posture (finish the sentence): Standards without enforcement are theater.", t: "long_text" },
        { p: "Decision 1 (language):", t: "long_text" }, { p: "Decision 2 (rhythm):", t: "long_text" }, { p: "Decision 3 (rule/enforcement):", t: "long_text" },
      ] },
    ],
  },
  {
    title: "Power Move 9: Culture as the Operating System",
    pages: [
      { title: "THE PROMISE YOU ARE PROTECTING", fields: [
        { p: "Brand promise (one sentence):", t: "long_text" }, { p: "What the customer must consistently feel (3 words):", t: "short_text", n: 3 },
        { p: "Standards (write 5):", t: "long_text", n: 5 },
      ] },
      { title: "YOUR TOP 5 ENFORCED STANDARDS", fields: [
        { p: "Meets standard (observable):", t: "long_text", n: 5 }, { p: "Misses standard (observable):", t: "long_text", n: 5 },
        { p: "Preferences to stop enforcing (write 3):", t: "long_text", n: 3 }, { p: "Actual standards (the outcome that matters) (write 3):", t: "long_text", n: 3 },
      ] },
      { title: "THE CULTURE SCORECARD (5 CATEGORIES)", fields: [
        { p: "Category 1 name:", t: "short_text" }, { p: "Category 2 name:", t: "short_text" }, { p: "Category 4 name:", t: "short_text" }, { p: "Category 5 name:", t: "short_text" },
        { p: "Definition (one sentence):", t: "long_text", n: 5 }, { p: "Observable behaviors (3):", t: "long_text", n: 15 },
        { p: "Scale (choose one):", t: "choice", o: ["1-3 (misses / meets / raises)", "1-5 (only if you will actually use it)"] }, { p: "Chosen scale:", t: "short_text" },
      ] },
      { title: "INSTALL IT STARTING WITH THREE INTERNAL TOUCHPOINTS", fields: [
        { p: "TOUCHPOINT 1: ONBOARDING", t: "long_text", labels: ["When it happens:", "What gets taught/installed:", "What gets observed:"] },
        { p: "TOUCHPOINT 2: INSPECTION", t: "long_text", labels: ["When it happens:", "What gets reviewed:", "What gets corrected:"] },
        { p: "TOUCHPOINT 3: REINFORCEMENT", t: "long_text", labels: ["When it happens:", "What gets recognized:", "What gets repeated:"] },
      ] },
      { title: "WHO THRIVES HERE", fields: [
        { p: "What internal posture do people need to have to thrive here? (e.g., ownership mindset, curiosity, stewardship, willingness to learn, respect for standards)", t: "long_text" },
        { p: "What behaviors do you see in people who fit? (e.g., they ask clarifying questions before starting, they document their work, they flag problems early, they respect the mission over convenience)", t: "long_text" },
        { p: "What matters to them? (e.g., impact, growth, clarity, being part of something bigger, doing work that aligns with their values)", t: "long_text" },
        { p: "What postures or behaviors signal misalignment? (e.g., they argue with the foundation before understanding it, they prioritize their way over the brand's way, they see the role as transactional, they resist feedback)", t: "long_text" },
        { p: "What postures or behaviors signal alignment? (e.g., they ask about the mission first, they want to understand before executing, they take pride in the details, they see themselves as part of building something).", t: "long_text" },
      ] },
    ],
  },
  {
    title: "Power Move 10: MVP as Brand-Anchored Offer Validation",
    pages: [
      { title: "THE MVP YOU ARE TESTING (NAME IT)", fields: [
        { p: "MVP name:", t: "short_text" }, { p: "MVP format (service / product / hybrid):", t: "short_text" }, { p: "Who it is for (one sentence):", t: "long_text" },
        { p: "Launch type (quiet / public):", t: "choice", o: ["quiet", "public"] }, { p: "Minimum Viable Promise (one sentence):", t: "long_text" },
      ] },
      { title: "WHAT IS INCLUDED (ONLY WHAT IS REQUIRED TO KEEP THE PROMISE)", fields: [
        { p: "Included components (5 max):", t: "long_text", n: 5 }, { p: "Excluded on purpose (5 max):", t: "long_text", n: 5 },
        { p: "Quality floor (what must be true every time):", t: "long_text" }, { p: "Expectation setting (what you will say up front so the buyer is not surprised):", t: "long_text" },
      ] },
      { title: "THE TEST GROUP (WHO VOTES FIRST)", fields: [
        { p: "Test group definition:", t: "long_text" }, { p: "How you will recruit them (one channel):", t: "long_text" }, { p: "Target number of buyers (small):", t: "short_text" },
        { p: "Price:", t: "short_text" }, { p: "Delivery window:", t: "short_text" }, { p: "Capacity limit (if any):", t: "short_text" }, { p: "Refund / guarantee posture (one sentence):", t: "long_text" },
      ] },
      { title: "THE CONVERSION PATH (HOW THEY BUY)", fields: [
        { p: "Where they land (page / DM / call):", t: "short_text" }, { p: "What they do next (one step):", t: "long_text" },
        { p: "What counts as a conversion (choose one):", t: "choice", o: ["Paid in full", "Deposit paid", "Signed + paid"] }, { p: "Chosen conversion definition:", t: "short_text" },
        { p: "Offers made:", t: "short_text" }, { p: "Buyers:", t: "short_text" }, { p: "Conversion rate:", t: "short_text" },
      ] },
      { title: "THE THREE MEASUREMENTS (KEEP IT SIMPLE)", fields: [
        { p: "Top 3 buyer questions/objections you did not predict:", t: "long_text", n: 3 }, { p: "For each, decide the cause (choose one):", t: "choice", n: 3, o: ["Messaging problem", "Delivery problem"] },
        { p: "What result did buyers actually get (one sentence):", t: "long_text" }, { p: "Where reality matched the promise:", t: "long_text" }, { p: "Where reality missed the promise:", t: "long_text" },
        { p: "Repeatable: what required you (the founder) to carry it?", t: "long_text" }, { p: "Sustainable: what did delivery cost (time, energy, margin)?", t: "long_text" }, { p: "Scalable: what breaks if you double volume next month?", t: "long_text" },
      ] },
      { title: "THE DECISION (DO NOT LEAVE THIS PAGE WITHOUT CHOOSING)", fields: [
        { p: "Choose one:", t: "choice", o: ["Persevere (keep the core, tighten the weak point)", "Pivot (change the promise, price, segment, or model)"] },
        { p: "Decision:", t: "short_text" }, { p: "One structural change for the next iteration (one sentence):", t: "long_text" }, { p: "Next test date (put it on the calendar):", t: "date" },
      ] },
    ],
  },
  {
    title: "Power Move 11: Money Models as the Architecture of Wealth",
    pages: [
      { title: "THE PROMISE THE MODEL MUST PROTECT", fields: [
        { p: "Brand promise (one sentence):", t: "long_text" }, { p: "What the buyer must consistently experience (3 words):", t: "short_text", n: 3 }, { p: "Offers list:", t: "short_text", n: 10 },
      ] },
      { title: "ASSIGN EACH OFFER A ROLE (STOP THE RANDOM MENU)", fields: [
        { p: "Lead Gen (Gateway)", t: "long_text" }, { p: "Ascension", t: "long_text" }, { p: "Premium (Hero)", t: "long_text" }, { p: "Downsell (Stabilizer)", t: "long_text" }, { p: "Retention (Continuity)", t: "long_text" },
        { p: "Entry point (how they start):", t: "long_text" }, { p: "Next step (after the first win):", t: "long_text" }, { p: "Premium step (highest level of impact):", t: "long_text" }, { p: "If timing is off (the stabilizer):", t: "long_text" }, { p: "After the win (continuity):", t: "long_text" },
      ] },
      { title: "THE GAPS (WHERE MONEY LEAKS)", fields: [
        { p: "Where do clients ask “Whats next?” and you do not have a clean answer?", t: "long_text" },
        { p: "Which lane is missing or needs improvement right now (choose one):", t: "choice", o: ["Lead Gen", "Ascension", "Premium", "Downsell", "Retention"] }, { p: "Missing lane:", t: "short_text" },
        { p: "Offer name:", t: "short_text" }, { p: "Lane (Gateway / Ascension / Premium / Downsell / Retention):", t: "choice", o: ["Gateway", "Ascension", "Premium", "Downsell", "Retention"] },
      ] },
      { title: "OFFER STANDARD BUILDER (ONE-PAGE SPEC)", fields: [
        { p: "Before:", t: "long_text" }, { p: "After:", t: "long_text" }, { p: "What “done” means:", t: "long_text" }, { p: "What is inside your control:", t: "long_text" }, { p: "For:", t: "long_text" }, { p: "Not for:", t: "long_text" }, { p: "What must be true before they start:", t: "long_text" },
        { p: "Phase 1:", t: "long_text" }, { p: "Phase 2:", t: "long_text" }, { p: "Phase 3:", t: "long_text" }, { p: "Included (required to deliver outcome):", t: "long_text" }, { p: "Excluded (even if they ask nicely):", t: "long_text" }, { p: "Revision rules / change requests:", t: "long_text" },
      ] },
      { title: "Scope, Pace, Access & Proof", fields: [
        { p: "Start to finish timeline:", t: "long_text" }, { p: "Cadence (calls, reviews, delivery rhythm):", t: "long_text" }, { p: "What pauses the timeline:", t: "long_text" },
        { p: "Who they access:", t: "long_text" }, { p: "Where communication happens:", t: "long_text" }, { p: "Response window:", t: "long_text" }, { p: "Boundaries that protect delivery:", t: "long_text" },
        { p: "Proof you have:", t: "long_text" }, { p: "Proof you need next:", t: "long_text" },
      ] },
      { title: "Requirements, Terms & Speed to reward", fields: [
        { p: "Inputs they must provide:", t: "long_text" }, { p: "Decisions they must make (by when):", t: "long_text" }, { p: "Participation required:", t: "long_text" },
        { p: "Price:", t: "short_text" }, { p: "Payment structure:", t: "long_text" }, { p: "Refund posture:", t: "long_text" }, { p: "What happens when they are late / unresponsive / out of scope:", t: "long_text" },
        { p: "First win:", t: "long_text" }, { p: "When they get it:", t: "long_text" }, { p: "What it unlocks next:", t: "long_text" },
      ] },
      { title: "THE THREE PRESSURE TESTS (REALITY CHECK)", fields: [
        { p: "Repeatable: what requires a hero to deliver?", t: "long_text" }, { p: "Sustainable: what drains margin, time, or morale?", t: "long_text" }, { p: "Scalable: what breaks if volume doubles?", t: "long_text" },
        { p: "Decision:", t: "choice", o: ["Keep and tighten", "Rebuild", "Kill it"] }, { p: "Chosen decision:", t: "short_text" }, { p: "One change you will make before you sell it again (one sentence):", t: "long_text" },
        { p: "Whats next sentence:", t: "long_text" }, { p: "Hold-the-line sentence:", t: "long_text" },
      ] },
    ],
  },
  {
    title: "Powerhouse Collaborations",
    pages: [
      { title: "YOUR COLLABORATION TARGET (WHAT YOU WANT)", fields: [
        { p: "What you want more of (choose one):", t: "choice", o: ["Better buyers", "Faster trust", "New distribution", "Embedded referrals", "Strategic partners"] }, { p: "Chosen target:", t: "short_text" }, { p: "What you will not trade for access (one sentence):", t: "long_text" },
        { p: "Primary type:", t: "choice", o: ["Gatekeeper (controls rooms)", "Guide (controls belief)", "Broadcaster (controls reach)", "Integrator (controls workflow)", "Connector (controls introductions)"] }, { p: "Secondary type:", t: "short_text" },
      ] },
      { title: "MODE + TYPE (HOW YOU ENTER, WHAT YOU DO)", fields: [
        { p: "Mode (choose one):", t: "choice", o: ["Insider access (earned trust)", "Paid distribution (rented reach)", "Sponsored insider (hybrid)"] }, { p: "Chosen mode:", t: "short_text" },
        { p: "Type (choose one):", t: "choice", o: ["Access (teach / clinic / workshop)", "Distribution (swap / guest / webinar)", "Integration (embedded / preferred partner)", "Relationship (referral engine)", "Mission (cause / movement)"] }, { p: "Chosen type:", t: "short_text" },
        { p: "Decision:", t: "choice", o: ["Proceed", "Pass"] }, { p: "Dream 100 targets (25):", t: "short_text", n: 25 }, { p: "PICK YOUR TOP 10 (THE NEXT 30 DAYS)", t: "short_text", n: 10 },
      ] },
      { title: "THE WARM-UP PLAN (EARN THE INTRO)", fields: [
        { p: "Warm-up action (choose one):", t: "choice", o: ["Comment with substance (3x/week)", "Share their work with a clean takeaway (2x/week)", "Send a value-forward DM (1x/week)", "Introduce them to someone useful (1x)"] },
        { p: "Chosen action:", t: "short_text" }, { p: "What you will say/do (one sentence):", t: "long_text" },
        { p: "Choose ONE offer format.", t: "choice", o: ["Serve the room (training / clinic / workshop)", "Share the asset (co-branded resource)", "Share the outcome (joint package)"] },
        { p: "Chosen format:", t: "short_text" }, { p: "One-sentence offer:", t: "long_text" }, { p: "What they win (one sentence):", t: "long_text" }, { p: "What you win (one sentence):", t: "long_text" },
      ] },
      { title: "THE PITCH (TIGHT)", fields: [
        { p: "Subject line / opener (one sentence):", t: "long_text" }, { p: "The ask (one sentence):", t: "long_text" }, { p: "The proof (one sentence):", t: "long_text" }, { p: "The close (one sentence):", t: "long_text" },
      ] },
      { title: "THE COLLABORATION SPEC (NO VAGUE AGREEMENTS)", fields: [
        { p: "Who leads:", t: "short_text" }, { p: "Who supports:", t: "short_text" }, { p: "Who decides:", t: "short_text" }, { p: "What gets created:", t: "long_text" }, { p: "Due dates:", t: "date" }, { p: "Definition of done:", t: "long_text" },
        { p: "Compensation:", t: "long_text" }, { p: "Flat fee / revenue share / value trade:", t: "choice", o: ["Flat fee", "revenue share", "value trade"] }, { p: "IP ownership:", t: "long_text" }, { p: "Who owns the asset:", t: "long_text" }, { p: "Who can reuse it:", t: "long_text" },
        { p: "Exit clause:", t: "long_text" }, { p: "When either party can walk:", t: "long_text" }, { p: "What happens to assets/leads:", t: "long_text" },
      ] },
      { title: "EXECUTION STANDARDS (HOW YOU BECOME THE GOLD STANDARD PARTNER)", fields: [
        { p: "Your non-negotiables (3):", t: "long_text", n: 3 }, { p: "What you will do to make this effortless for them (one sentence):", t: "long_text" }, { p: "What proof you will collect:", t: "long_text" },
        { p: "Testimonial (who, when):", t: "long_text" }, { p: "Case study (what result):", t: "long_text" }, { p: "Referral ask (who they will introduce you to):", t: "long_text" },
        { p: "Decision 1 (Top 1 target to pursue this week):", t: "long_text" }, { p: "Decision 2 (warm-up action you will start today):", t: "long_text" }, { p: "Decision 3 (collaboration offer you will pitch):", t: "long_text" },
      ] },
    ],
  },
] as const satisfies readonly BrandPowerMove[];