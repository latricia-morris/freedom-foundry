// Text extracted with pdftotext -layout; prompts retain authored wording.
// Field keys: h = heading, q = prompt/label, type = short_text|long_text|choice|checklist|rating|date.
export const powerMoves1to6 = [
  { title: "Power Move 1: Own The Identity Factor", pages: [
    { page: 2, h: "PART 1: BEING (WHO WE ARE)", fields: [
      { q: "Company identity in one sentence", type: "short_text", prompt: "“We are a company that __________________________________________________________.”" },
      { q: "What we stand for (3–5 commitments)", type: "long_text", prompt: "Write commitments, not adjectives." },
      { q: "What we refuse (3–5 non-negotiables)", type: "long_text", prompt: "These are boundaries you will protect even when it costs you." },
      { q: "Our version of better (inside our niche)", type: "short_text", prompt: "“In our industry, ‘better’ means ____________________ because ____________________.”" }
    ]},
    { page: 3, h: "PART 2: OFFER (WHAT WE REALLY PROVIDE)", fields: [
      { q: "What we sell (deliverables)", type: "long_text", prompt: "List the obvious outputs." },
      { q: "What we really offer (transformation)", type: "short_text", prompt: "“Our customers don’t just get __________________. They get __________________.”" },
      { q: "The problem we solve (root, not symptoms)", type: "short_text", prompt: "“We solve _____________________________________ by ________________________________.”" },
      { q: "Proof of value (how we know it worked)", type: "short_text", prompt: "“We know we delivered when _____________________.”" }
    ]},
    { page: 4, h: "PART 3: VOICE (HOW WE COMMUNICATE)", fields: [
      { q: "Our voice in 3 words:", type: "short_text" },
      { q: "When we teach, we sound like", type: "short_text" }, { q: "When we sell, we sound like", type: "short_text" },
      { q: "When we correct, we sound like", type: "short_text" }, { q: "When we support, we sound like", type: "short_text" },
      { q: "Words we use", type: "long_text", prompt: "We say:" }, { q: "Words we don’t use", type: "long_text", prompt: "We avoid:" },
      { q: "The line we will not cross to get a sale.", type: "short_text", prompt: "“We will not _____________________________________ even if it would increase conversions.”" }
    ]},
    { page: 5, h: "PART 4: MISSION (WHY WE EXIST AND WHERE WE’RE GOING)", fields: [
      { q: "Mission (what we do daily)", type: "short_text", prompt: "“Our mission is to ___________________________ for ___________________________.”" },
      { q: "Vision (what we’re building over time)", type: "short_text", prompt: "“Our vision is a world where ______________________________________________________.”" },
      { q: "Causes and alignment (what we support)", type: "short_text", prompt: "“We align with _____________________________ because _____________________________.”" },
      { h: "PART 5: STANDARDS (HOW WE PROTECT THE BRAND)", q: "Experience standards (what customers can always expect)", type: "long_text", prompt: "They can always expect ____________________________________________________________" },
      { q: "Decision filter (brand decisions vs business decisions)", type: "checklist", prompt: "Before we say yes to a new offer, partnership, hire, or shortcut, we ask:", options: ["Does this strengthen or cheapen what people bought into?", "Does this align with our commitments and non-negotiables?", "Would we be proud to be known for this?", "Does this move the mission forward or just move money?"] }
    ]},
    { page: 6, h: "PART 6: TEAM CLARITY (SO NOBODY HAS TO GUESS)", fields: [
      { q: "If you’re new here, here’s what matters most", type: "long_text", prompt: "Write 3–5 sentences that a team member can remember." },
      { q: "If you’re representing us publicly, protect this.", type: "long_text", prompt: "List what must stay consistent across emails, calls, DMs, proposals, and service delivery." },
      { q: "FINAL CHECK", type: "checklist", options: ["If two different team members filled this out, would they sound like the same company?", "If not, don’t redesign anything yet. Define identity first."] }
    ]},
    { page: 7, h: "The Tool: The Purpose Map", fields: [
      { q: "Passion", type: "long_text", prompt: "What do we care about enough to keep improving, even when it's hard?" },
      { q: "Aptitude", type: "long_text", prompt: "What do we do exceptionally well (or have the potential to become exceptional at)?" },
      { q: "People Served", type: "long_text", prompt: "Who is helped by our work? (Primary customer, employees, specific community)." },
      { q: "Problem Removed", type: "long_text", prompt: "What specific burden do we reduce for them?" },
      { q: "Outcome Delivered", type: "long_text", prompt: "What becomes better? (Name both the practical result and the emotional shift)." },
      { q: "Our Version of Better (Plain English)", type: "long_text", prompt: "Write 1–2 sentences naming the specific improvement we make in the slice of the world we touch. Example: \"We make construction projects predictable so owners can sleep at night.\"" },
      { q: "Standards", type: "long_text", prompt: "What must be true every single time we deliver?" },
      { q: "Impact Level", type: "choice", prompt: "Where do we focus our impact?", options: ["Customer", "Workplace", "Community"] }
    ]}
  ]},
  { title: "Power Move 2: Buyer Intel Development", pages: [
    { page: 8, h: "The Tool: The \"Seen & Led\" ICA", fields: [
      { q: "MOMENT-OF-NEED SNAPSHOT", type: "long_text", prompt: "What is happening in real life when they reach for help? What is the pressure in the room? What just broke, slipped, or got exposed?" },
      { q: "STAKES THEY ARE PROTECTING", type: "long_text", prompt: "What matters most if this goes wrong? Reputation, capital, timeline, peace, control, momentum." }
    ]},
    { page: 9, h: "The \"Seen & Led\" ICA", fields: [
      { q: "STORY THEY ARE TELLING", type: "long_text", prompt: "What do they believe is true about their situation and their options? What conclusions have they already drawn?" },
      { q: "DECISION DRIVERS", type: "long_text", prompt: "What emotion makes them move toward a solution? Relief, certainty, pride, safety, momentum, control." },
      { q: "TRUST BREAKERS", type: "long_text", prompt: "What makes them stall or distrust a vendor in your space? What have they been burned by before?" }
    ]},
    { page: 10, h: "The \"Seen & Led\" ICA", fields: [
      { q: "BUYER LANGUAGE BANK", type: "long_text", prompt: "List 5 to 10 exact phrases they use about the problem, the outcome, and the fear underneath it." },
      { q: "ALTERNATIVES", type: "long_text", prompt: "Who or what are they comparing you to, including doing nothing? Another vendor, an internal hire, a cheaper option, a DIY route, or delay." },
      { q: "CONFIDENCE CUES", type: "long_text", prompt: "What signals competence to this specific buyer? Proof, credentials, case studies, clarity of process, speed of response, standards, and specificity." }
    ]},
    { page: 11, h: "The \"Seen & Led\" ICA", fields: [
      { q: "FIT AND MISFIT RULES", type: "long_text", prompt: "State who this is for and who it is not for. This is not an exclusion for ego. It is stewardship." }
    ]}
  ]},
  { title: "Power Move 3: Market Reconnaissance", pages: [
    { page: 12, h: "The Market Intelligence Dashboard", fields: [
      { q: "TOP 3 DESIRED OUTCOMES", type: "long_text", prompt: "What are buyers asking for most right now, in their own words? (e.g., \"I just want my team to be autonomous.\")", count: 3 },
      { q: "TOP 3 OBJECTIONS", type: "long_text", prompt: "What are they protecting when they hesitate? (e.g., \"We can't afford a long implementation time.\")", count: 3 }
    ]},
    { page: 13, h: "The Market Intelligence Dashboard", fields: [
      { q: "TOP 3 TRUST BREAKERS", type: "long_text", prompt: "What specific things create hesitation in your sales process? (e.g., \"Lack of clear pricing on the website.\")", count: 3 },
      { q: "TOP 3 CONFIDENCE CUES", type: "long_text", prompt: "What proof do they need to see to feel trust is reasonable? (e.g., \"Case studies from similar industries.\")", count: 3 },
      { q: "TOP 3 MARKET ALTERNATIVES", type: "long_text", prompt: "What are competitors promising right now? (e.g., \"AI-driven solutions.\")", count: 3 }
    ]},
    { page: 14, h: "The Market Intelligence Dashboard", fields: [
      { q: "TOP 3 CATEGORY CLICHÉS", type: "long_text", prompt: "What overused words must you avoid? (e.g., \"Synergy,\" \"Disruptive,\" \"Next-gen.\")", count: 3 },
      { q: "ONE OPPORTUNITY GAP", type: "long_text", prompt: "What is the one thing buyers want that is not being served well? (e.g., \"Strategic guidance, not just execution.\")", count: 3 }
    ]}
  ]},
  { title: "Power Move 4: Calibrate Without Compromise", pages: [
    { page: 15, h: "START WITH STANDARDS.", fields: [
      { q: "What are the few lines you will not cross, even when it costs you revenue, speed, or approval?", type: "long_text" },
      { q: "What do you refuse to do, even if the buyer asks? What do you always do, even when nobody would notice?", type: "long_text" },
      { q: "What is the standard you will defend when the market tries to bargain you down?", type: "long_text" }
    ]},
    { page: 16, h: "MOVE TO BUYER PRESSURE.", fields: [
      { q: "What is actually keeping them up at night?", type: "long_text" }, { q: "What risk are they trying to avoid? What hassle are they trying to get out of?", type: "long_text" },
      { q: "What is the moment they choose, “I’m not doing this myself,” and what happened right before that moment?", type: "long_text" }, { q: "What does staying stuck cost them in time, money, reputation, or peace?", type: "long_text" },
      { h: "DEFINE CREDIBILITY IN YOUR CATEGORY.", q: "What signals “these people are legit” in ten seconds, and what is now ignored white noise?", type: "long_text" }, { q: "What proof matters to a serious buyer?", type: "long_text" }
    ]},
    { page: 17, h: "DEFINE CREDIBILITY IN YOUR CATEGORY.", fields: [
      { q: "What proof only impresses amateurs?", type: "long_text" }, { q: "What would make the right buyer say, “They’ve done this before,” without you having to beg for belief?", type: "long_text" },
      { h: "LOCK IN THE MOMENT OF NEED.", q: "When is urgency highest, and what changed to create it?", type: "long_text" }, { q: "What broke, what deadline hit, what opportunity opened, what consequence got close enough to feel real?", type: "long_text" },
      { q: "What is happening in their world when they finally start searching, asking for referrals, or comparing options?", type: "long_text" },
      { h: "CHOOSE A POSTURE THAT MATCHES PRESSURE.", q: "What stance makes you feel safe and capable in that moment, not loud and salesy?", type: "long_text" }
    ]},
    { page: 18, h: "CHOOSE A POSTURE THAT MATCHES PRESSURE.", fields: [
      { q: "What tone, framing, and level of certainty fit the stakes?", type: "long_text" }, { q: "What posture would instantly disqualify you because it feels careless, soft, or performative?", type: "long_text" },
      { h: "NAME YOUR RALLY POINT.", q: "What enemy are you helping them defeat, or what standard are you restoring?", type: "long_text" }, { q: "What is the thing you will call out that the market keeps tolerating?", type: "long_text" },
      { q: "What are you willing to say plainly that makes the right buyer feel seen, and the wrong buyer feel exposed?", type: "long_text" },
      { h: "WRITE YOUR LINE IN THE SAND.", q: "Most of the market does X. We are only willing to do Y. We do it because that is the only way to achieve Z.", type: "long_text" }
    ]},
    { page: 19, h: "DECIDE PLACEMENT WITH DISCIPLINE.", fields: [
      { q: "Where does discovery happen when the stakes are real?", type: "long_text" }, { q: "Where are buyers already primed to make a decision?", type: "long_text" },
      { q: "Where does your presence increase trust rather than create noise?", type: "long_text" }, { q: "Where do you need to be seen so the buyer feels, “These are our people,” before you ever ask for the close?", type: "long_text" },
      { h: "NAIL THE PATH THAT PREPARES TRUST.", q: "What are the two or three steps that consistently make the right buyer ready?", type: "long_text" }, { q: "What do they need to see first?", type: "long_text" }
    ]},
    { page: 20, h: "NAIL THE PATH THAT PREPARES TRUST.", fields: [
      { q: "What do they need to understand?", type: "long_text" }, { q: "What proof, process, or framing makes action feel safe and obvious without hype?", type: "long_text" }
    ]}
  ]},
  { title: "Power Move 5: Make Your Voice Unignorable", pages: [
    { page: 21, h: "EXTRACT YOUR RAW VOICE", fields: [
      { q: "Write 10 lines the way you would say it out loud.", type: "long_text", prompt: "This is not the place for polishing or cosplay. This is a place to just say the dang thing exactly as you would if you were talking to them across the table." },
      { q: "What do you actually believe about the problem your buyer is stuck in?", type: "long_text" }, { q: "What do you wish someone would say to them plainly?", type: "long_text" },
      { q: "What are you tired of seeing in your category?", type: "long_text" }, { q: "What standard are you restoring?", type: "long_text" }
    ]},
    { page: 22, h: "BUILD YOUR MESSAGE BANK (12 LINES)", fields: [
      { q: "One promise line.", type: "long_text", prompt: "Example: Established leaders stop sounding like the category and start sounding inevitable to the right buyer." },
      { q: "One proof line.", type: "long_text", prompt: "Example: Decisions are built off buyer intel, market reconnaissance, and standards that can be enforced." },
      { q: "One posture line.", type: "long_text", prompt: "Example: We don't pull punches. We roll up our sleeves and get to work helping you build your own powerhouse brand." },
      { q: "One principle line.", type: "long_text", prompt: "Example: Nothing gets sold that we don't stand behind 100%. If the work will not hold up under pressure, it does not ship." }
    ]},
    { page: 23, h: "BUILD YOUR MESSAGE BANK (12 LINES)", fields: [
      { q: "One contrast line (we are not them).", type: "long_text", prompt: "Example: Most brand work is pretty packaging and vague language. This is identity that translates into conversions." },
      { q: "One stakes line (cost of staying stuck).", type: "long_text", prompt: "Example: Generic messaging turns marketing spend into noise and trains buyers to scroll past." },
      { q: "One misfit line (who this is not for).", type: "long_text", prompt: "Example: This is not for buyers who want trendy content, cheap templates, or a softer version of the truth." },
      { q: "One objection line (price, time, trust, complexity).", type: "long_text", prompt: "Example: The cost is not the work. The cost is the revenue bled when buyers cannot tell why this is the right choice." },
      { q: "One mechanism line (how it actually gets done).", type: "long_text", prompt: "Example: Promise, proof, posture, and principles get locked, then the voice gets codified into rules a team can repeat." }
    ]},
    { page: 24, h: "BUILD YOUR MESSAGE BANK (12 LINES)", fields: [
      { q: "One boundary line (what will not happen).", type: "long_text", prompt: "Example: Standards do not get diluted to make the sale easier." },
      { q: "One credibility line (why trust is reasonable).", type: "long_text", prompt: "Example: This is built by operators who have shipped real work, protected reputations, and know what holds up in the market." },
      { q: "One call to action line (the next step).", type: "long_text", prompt: "Example: Start here: audit the last 10 messages and rewrite them like standards actually matter." },
      { h: "Kill the category phrases", q: "Pull 10 phrases from your website, emails, or captions that sound like everybody. Rewrite each one in your voice.", type: "long_text", prompt: "Rule: if it could sit on a competitor site unchanged, it's gotta go. Fix it. Rework it. Do what you need to do to ensure your people appreciate you being so uniquely you..", count: 10 },
      { h: "WRITE 3 HOOKS THAT DO NOT SOUND LIKE A TEMPLATE", q: "Stakes hook.", type: "long_text" }
    ]},
    { page: 25, h: "WRITE 3 HOOKS THAT DO NOT SOUND LIKE A TEMPLATE", fields: [
      { q: "Standard hook.", type: "long_text" }, { q: "Contrast hook.", type: "long_text" },
      { h: "BUILD ONE POST, ONE EMAIL, ONE AD", q: "Post (short) — Hook:", type: "long_text" }, { q: "Post (short) — Point:", type: "long_text" }, { q: "Post (short) — Proof:", type: "long_text" }, { q: "Post (short) — CTA:", type: "long_text" }
    ]},
    { page: 26, h: "BUILD ONE POST, ONE EMAIL, ONE AD", fields: [
      { q: "Email (short) — Subject:", type: "short_text" }, { q: "Email (short) — Opening line:", type: "long_text" }, { q: "Email (short) — Problem:", type: "long_text" }, { q: "Email (short) — Standard:", type: "long_text" }, { q: "Email (short) — CTA:", type: "long_text" },
      { q: "Ad (contrast)", type: "long_text", prompt: "Most options for [service] will tell you [X]. That usually leads to [cost]. We enforce [Y]. You get [Z]. Next step: [CTA]." }
    ]},
    { page: 27, h: "EFFORT SIGNAL CHECK", fields: [
      { q: "Look at what you just wrote.", type: "checklist", options: ["Does it sound like a real person with standards?", "Does it feel edited, not generated?", "Would the right buyer feel spotted?", "Would the wrong buyer feel friction?"] },
      { h: "DEPLOYMENT PLAN (7 DAYS)", q: "Pick one channel.", type: "short_text" }, { q: "Pick one offer.", type: "short_text" }, { q: "Pick one buyer.", type: "short_text" },
      { q: "Deployment plan", type: "checklist", options: ["Day 1: publish 1 post using your stakes hook.", "Day 3: send 1 email using your standard hook.", "Day 5: run 1 ad or outreach message using your contrast line.", "Day 7: review replies and objections. Update your message bank."] }
    ]}
  ]},
  { title: "Power Move 6: Engineering the Experience", pages: [
    { page: 28, h: "DEFINE THE EXPERIENCE STANDARD", fields: [
      { q: "Write the standard in plain language.", type: "long_text" }, { q: "What is the experience supposed to feel like? (Remember, the more visceral the better)", type: "long_text" },
      { q: "What must never happen?", type: "long_text" }, { q: "What must always happen?", type: "long_text" }
    ]},
    { page: 29, h: "MAP THE JOURNEY (PHASES, NOT VIBES)", fields: [
      { q: "Discovery and first contact", type: "long_text" }, { q: "Diagnosis and sales", type: "long_text" }, { q: "Onboarding", type: "long_text" }, { q: "Execution and delivery", type: "long_text" }, { q: "Offboarding and follow-up", type: "long_text" }
    ]},
    { page: 30, h: "MAP THE JOURNEY (PHASES, NOT VIBES)", fields: [
      { q: "Questions to apply to every phase", type: "checklist", options: ["What is the buyer trying to get?", "What is the buyer afraid of?", "What is the one moment where trust is built or broken?", "What does clarity look like here?", "What boundary must be enforced here?"] },
      { q: "Jot any added thoughts here.", type: "long_text" }, { q: "Discovery and first contact:", type: "long_text" }, { q: "Diagnosis and sales:", type: "long_text" }, { q: "Onboarding:", type: "long_text" }, { q: "Execution and delivery:", type: "long_text" }, { q: "Offboarding and follow-up:", type: "long_text" },
      { h: "BUILD THE EXPECTATION SCRIPT", q: "What happens next?", type: "long_text" }
    ]},
    { page: 31, h: "BUILD THE EXPECTATION SCRIPT", fields: [
      { q: "What is the timeline?", type: "long_text" }, { q: "What is required from the client?", type: "long_text" }, { q: "What is not included?", type: "long_text" }, { q: "How does communication work?", type: "long_text" }, { q: "What response time is normal?", type: "long_text" },
      { h: "INSTALL PROACTIVE CLARITY", q: "What gets sent before a meeting?", type: "long_text" }, { q: "What gets sent after a meeting?", type: "long_text" }
    ]},
    { page: 32, h: "INSTALL PROACTIVE CLARITY", fields: [
      { q: "What gets sent weekly/regularly without fail?", type: "long_text" },
      { h: "ENFORCE BOUNDARIES WITHOUT DRAMA", q: "Office hours and channels:", type: "long_text" }, { q: "Revision process:", type: "long_text" }, { q: "Scope creep:", type: "long_text" }, { q: "Timeline pressure:", type: "long_text" }
    ]},
    { page: 33, h: "ENFORCE BOUNDARIES WITHOUT DRAMA", fields: [
      { q: "Boundary script template.", type: "long_text", prompt: "\"That request falls outside the agreement. Two options exist. Add it as a change order with adjusted timeline and investment, or prioritize it for phase two after the current scope is complete. Which works better?\"" },
      { h: "DESIGN THE TOUCHPOINT MENU", q: "Pick 5 touchpoints. For each one, consider:", type: "long_text", options: ["When does it happen?", "What does it reinforce?", "What is the cost in time and money?"], count: 4 }
    ]},
    { page: 34, h: "DESIGN THE TOUCHPOINT MENU", fields: [{ q: "5.", type: "long_text" }] }
  ]}
];