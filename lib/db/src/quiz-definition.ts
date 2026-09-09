export type Archetype = "Ruler" | "Hero" | "Magician" | "Outlaw" | "Explorer" | "Creator" | "Lover" | "Caregiver" | "Everyman" | "Jester" | "Sage" | "Innocent";
export interface Answer { text: string; scores: Partial<Record<Archetype, number>>; }
export interface Question { id: number; text: string; answers: Answer[]; }

// Priority for tie-breaking
export const ARCHETYPE_PRIORITY: Archetype[] = [
  "Ruler", "Hero", "Magician", "Outlaw", "Explorer", "Creator",
  "Lover", "Caregiver", "Everyman", "Jester", "Sage", "Innocent"
];

export const questions: Question[] = [
  // --- SECTION 1: 3 POINTS (Core Drivers) ---
  {
    id: 1,
    text: "What drives you most in your business?",
    answers: [
      { text: "Setting the standard and proving excellence through determination", scores: { Ruler: 3, Hero: 3 } },
      { text: "Transforming vision into reality through original thinking", scores: { Magician: 3, Creator: 3 } },
      { text: "Challenging convention and discovering new territory", scores: { Outlaw: 3, Explorer: 3 } },
      { text: "Creating meaningful connections and serving those who matter", scores: { Lover: 3, Caregiver: 3 } },
      { text: "Building community and bringing joy to the world", scores: { Everyman: 3, Jester: 3 } },
      { text: "Pursuing truth and living with conviction", scores: { Sage: 3, Innocent: 3 } },
    ]
  },
  {
    id: 2,
    text: "How do you define success?",
    answers: [
      { text: "Being recognized as the authority and trusted expert in my field", scores: { Ruler: 3, Sage: 3 } },
      { text: "Achieving what others said couldn't be done on my own terms", scores: { Hero: 3, Outlaw: 3 } },
      { text: "Creating something original that transforms reality", scores: { Magician: 3, Creator: 3 } },
      { text: "Building relationships and making people laugh and enjoy life", scores: { Lover: 3, Jester: 3 } },
      { text: "Making a real difference with honest, integrity-driven work", scores: { Caregiver: 3, Innocent: 3 } },
      { text: "Having freedom to explore while being accepted for who I am", scores: { Explorer: 3, Everyman: 3 } },
    ]
  },
  {
    id: 3,
    text: "What frustrates you most about your industry?",
    answers: [
      { text: "Too much mediocrity and people spreading bad information", scores: { Ruler: 3, Sage: 3 } },
      { text: "People giving up too easily and being stuck in safe ways", scores: { Hero: 3, Explorer: 3 } },
      { text: "No one thinking big enough or imagining what's possible", scores: { Magician: 3, Creator: 3 } },
      { text: "Everyone following outdated playbooks and taking themselves too seriously", scores: { Outlaw: 3, Jester: 3 } },
      { text: "Treating clients like transactions instead of relationships", scores: { Lover: 3, Caregiver: 3 } },
      { text: "Too much pretentiousness and unethical shortcuts", scores: { Everyman: 3, Innocent: 3 } },
    ]
  },
  {
    id: 4,
    text: "My business makes the biggest impact when:",
    answers: [
      { text: "We establish the benchmark for quality and deliver with integrity", scores: { Ruler: 3, Innocent: 3 } },
      { text: "We help clients achieve what seemed impossible and exceed expectations", scores: { Hero: 3, Magician: 3 } },
      { text: "We challenge how things are supposed to be done and help see new opportunities", scores: { Outlaw: 3, Explorer: 3 } },
      { text: "We create something original and make the process enjoyable", scores: { Creator: 3, Jester: 3 } },
      { text: "We deliver memorable experiences and go the extra mile to support", scores: { Lover: 3, Caregiver: 3 } },
      { text: "Customers gain insights and feel understood and supported", scores: { Sage: 3, Everyman: 3 } },
    ]
  },
  {
    id: 5,
    text: "What legacy do you want your brand to leave?",
    answers: [
      { text: "To be known as THE BEST and proof that determination conquers anything", scores: { Ruler: 3, Hero: 3 } },
      { text: "That I transformed how people see what's possible and inspired creativity", scores: { Magician: 3, Creator: 3 } },
      { text: "That I challenged the norms and gave people permission to forge their own way", scores: { Outlaw: 3, Explorer: 3 } },
      { text: "That I created connections people never forgot and brought them joy", scores: { Lover: 3, Jester: 3 } },
      { text: "That I made a lasting positive impact with honest, integrity-driven work", scores: { Caregiver: 3, Innocent: 3 } },
      { text: "That I helped people decide wisely and built something they could always count on", scores: { Sage: 3, Everyman: 3 } },
    ]
  },
  {
    id: 6,
    text: "What do you value most in your work?",
    answers: [
      { text: "Being the recognized authority because of deep knowledge and mastery of my craft", scores: { Ruler: 3, Sage: 3 } },
      { text: "Proving what's possible while doing it the right way", scores: { Hero: 3, Innocent: 3 } },
      { text: "Creating transformation that delights and amazes people", scores: { Magician: 3, Jester: 3 } },
      { text: "Creating something original that people emotionally connect with", scores: { Creator: 3, Lover: 3 } },
      { text: "Challenging the system to better serve and protect people", scores: { Outlaw: 3, Caregiver: 3 } },
      { text: "Exploring new possibilities while keeping everyone grounded and included", scores: { Explorer: 3, Everyman: 3 } },
    ]
  },
  {
    id: 7,
    text: "What's your brand's biggest fear?",
    answers: [
      { text: "Losing our edge and becoming boring or irrelevant", scores: { Ruler: 3, Jester: 3 } },
      { text: "Failing when it matters or giving bad advice", scores: { Hero: 3, Sage: 3 } },
      { text: "Delivering mediocre results instead of transforming", scores: { Magician: 3, Creator: 3 } },
      { text: "Getting stuck or becoming just another corporate sellout", scores: { Outlaw: 3, Explorer: 3 } },
      { text: "Losing the connection that makes us different and not being able to help", scores: { Lover: 3, Caregiver: 3 } },
      { text: "Losing the trust we've built or compromising our values", scores: { Everyman: 3, Innocent: 3 } },
    ]
  },

  // --- SECTION 2: 2 POINTS (Behavior & Strategy) ---
  {
    id: 8,
    text: "How do you operate under pressure?",
    answers: [
      { text: "By staying grounded in what works and keeping things light when pressure builds", scores: { Everyman: 2, Jester: 2 } },
      { text: "By making smart decisions and maintaining rigorous standards", scores: { Sage: 2, Innocent: 2 } },
      { text: "By adapting quickly to market shifts while staying true to my core", scores: { Ruler: 2, Outlaw: 2 } },
      { text: "By solving problems creatively and innovating consistently", scores: { Magician: 2, Creator: 2 } },
      { text: "By pushing through setbacks and staying motivated through long cycles", scores: { Hero: 2, Explorer: 2 } },
      { text: "By building genuine loyalty and measuring impact on people served", scores: { Lover: 2, Caregiver: 2 } },
    ]
  },
  {
    id: 9,
    text: "When you encounter resistance or criticism, you:",
    answers: [
      { text: "Listen deeply and adjust to preserve the relationship", scores: { Lover: 2, Caregiver: 2 } },
      { text: "Question the rules they're applying and view it as a learning opportunity", scores: { Outlaw: 2, Explorer: 2 } },
      { text: "Analyze it objectively and double down on doing the right thing", scores: { Sage: 2, Innocent: 2 } },
      { text: "Push through the challenge and transform how they see what's possible", scores: { Hero: 2, Magician: 2 } },
      { text: "Stay humble and grounded while laughing it off and moving forward", scores: { Everyman: 2, Jester: 2 } },
      { text: "Assert your position and reimagine the approach entirely", scores: { Ruler: 2, Creator: 2 } },
    ]
  },
  {
    id: 10,
    text: "Your ideal client relationship is built on:",
    answers: [
      { text: "Deep emotional trust and making the journey enjoyable and memorable", scores: { Lover: 2, Jester: 2 } },
      { text: "Clear hierarchy and expertise while respecting their independence", scores: { Ruler: 2, Outlaw: 2 } },
      { text: "Genuine care and integrity in advocating for their success", scores: { Caregiver: 2, Innocent: 2 } },
      { text: "Pushing each other to new heights and uncovering their hidden potential", scores: { Hero: 2, Magician: 2 } },
      { text: "Honesty, reliability, and shared exploration and discovery", scores: { Everyman: 2, Explorer: 2 } },
      { text: "Expertise and teaching them to think better while co-creating something original", scores: { Sage: 2, Creator: 2 } },
    ]
  },
  {
    id: 11,
    text: "When scaling your business, your priority is:",
    answers: [
      { text: "Building systems that keep quality high as we grow", scores: { Ruler: 2, Innocent: 2 } },
      { text: "Expanding into new markets and staying open to new opportunities", scores: { Explorer: 2, Outlaw: 2 } },
      { text: "Creating new offers and innovating so we do not plateau", scores: { Creator: 2, Magician: 2 } },
      { text: "Increasing impact and pushing for bigger outcomes", scores: { Hero: 2, Sage: 2 } },
      { text: "Protecting the client experience and taking care of people well", scores: { Caregiver: 2, Lover: 2 } },
      { text: "Keeping the culture grounded, real, and enjoyable", scores: { Everyman: 2, Jester: 2 } },
    ]
  },
  {
    id: 12,
    text: "The clients you attract are typically:",
    answers: [
      { text: "Looking for proven authority and deeper wisdom and insights", scores: { Ruler: 2, Sage: 2 } },
      { text: "Wanting authenticity and someone who breaks the mold and explores new territory", scores: { Outlaw: 2, Explorer: 2 } },
      { text: "Seeking transformation and breakthrough results through creative solutions", scores: { Magician: 2, Creator: 2 } },
      { text: "Ready to push themselves and achieve big things with deep connection", scores: { Hero: 2, Lover: 2 } },
      { text: "Wanting honest, reliable help and someone who genuinely cares", scores: { Everyman: 2, Caregiver: 2 } },
      { text: "Looking for someone who makes it enjoyable and does things the right way", scores: { Jester: 2, Innocent: 2 } },
    ]
  },
  {
    id: 13,
    text: "When a client or team member disagrees with your approach, you:",
    answers: [
      { text: "Stand firm on the strategy and explain the reasoning behind it", scores: { Ruler: 2, Sage: 2 } },
      { text: "Stay curious and explore their perspective while reimagining together", scores: { Explorer: 2, Creator: 2 } },
      { text: "Listen and find common ground while understanding their concerns", scores: { Lover: 2, Caregiver: 2 } },
      { text: "Rise to the challenge and reframe to show a better way", scores: { Hero: 2, Magician: 2 } },
      { text: "Stay practical and keep it light while finding what actually works", scores: { Everyman: 2, Jester: 2 } },
      { text: "Question the conventional wisdom and stick to what's right", scores: { Outlaw: 2, Innocent: 2 } },
    ]
  },
  {
    id: 14,
    text: "Your biggest competitive advantage is:",
    answers: [
      { text: "Deep expertise and the ability to see solutions others miss", scores: { Sage: 2, Magician: 2 } },
      { text: "Authenticity and willingness to be different and adapt", scores: { Outlaw: 2, Explorer: 2 } },
      { text: "Genuine care and commitment to serving and supporting people", scores: { Lover: 2, Caregiver: 2 } },
      { text: "Discipline and determination to deliver with integrity", scores: { Ruler: 2, Innocent: 2 } },
      { text: "Staying calm and using your presence to shape the atmosphere around you", scores: { Everyman: 2, Jester: 2 } },
      { text: "Resilience and the ability to find solutions when obstacles arise", scores: { Hero: 2, Creator: 2 } },
    ]
  },

  // --- SECTION 3: 1 POINT (Personality Nuances) ---
  {
    id: 15,
    text: "When your results don't match your expectations, you:",
    answers: [
      { text: "Analyze what went wrong and study the data to understand why", scores: { Ruler: 1, Sage: 1 } },
      { text: "See it as a chance to explore a new direction and reimagine the strategy", scores: { Explorer: 1, Magician: 1 } },
      { text: "Check in with people and focus on how to support and help more", scores: { Lover: 1, Caregiver: 1 } },
      { text: "Double down and push harder with a different approach", scores: { Hero: 1, Creator: 1 } },
      { text: "Stay grounded, keep perspective, and recommit to the right path", scores: { Everyman: 1, Innocent: 1 } },
      { text: "Question whether the goal itself was right and find the humor in it", scores: { Outlaw: 1, Jester: 1 } },
    ]
  },
  {
    id: 16,
    text: "When you walk into a room, people usually experience you as:",
    answers: [
      { text: "Commanding, composed, and steady", scores: { Ruler: 1, Innocent: 1 } },
      { text: "Confident, driven, and ready to take on the challenge", scores: { Hero: 1, Explorer: 1 } },
      { text: "Magnetic, catalytic, and able to shift the room", scores: { Magician: 1, Jester: 1 } },
      { text: "Bold, unfiltered, and creatively expressive", scores: { Outlaw: 1, Creator: 1 } },
      { text: "Warm, attentive, and safe to be around", scores: { Lover: 1, Caregiver: 1 } },
      { text: "Down-to-earth, thoughtful, and perceptive", scores: { Everyman: 1, Sage: 1 } },
    ]
  },
  {
    id: 17,
    text: "If someone tried to describe your brand in one sentence, it would be:",
    answers: [
      { text: "The standard-setter that leads with excellence and integrity", scores: { Ruler: 1, Innocent: 1 } },
      { text: "The one that pushes people to rise and opens new paths", scores: { Hero: 1, Explorer: 1 } },
      { text: "The one that creates transformation through original work", scores: { Magician: 1, Creator: 1 } },
      { text: "The one that refuses to play by the rules and keeps it real", scores: { Outlaw: 1, Everyman: 1 } },
      { text: "The one that makes people feel seen and takes care of them", scores: { Lover: 1, Caregiver: 1 } },
      { text: "The one that brings wisdom, clarity, and keeps things human", scores: { Sage: 1, Jester: 1 } },
    ]
  },
  {
    id: 18,
    text: "The biggest risk to your brand's future is:",
    answers: [
      { text: "Getting outpaced by a faster market and losing your position", scores: { Ruler: 1, Explorer: 1 } },
      { text: "A harder fight than expected that exposes gaps in resilience and execution", scores: { Hero: 1, Everyman: 1 } },
      { text: "Copycats and commoditization that dilute what makes you special", scores: { Creator: 1, Magician: 1 } },
      { text: "Pressure to conform, soften, or \"play nice\" until your edge disappears", scores: { Outlaw: 1, Innocent: 1 } },
      { text: "Transactional growth that erodes trust, loyalty, and real connection", scores: { Lover: 1, Caregiver: 1 } },
      { text: "Noise, misinformation, and shallow takes that confuse your audience and kill clarity", scores: { Sage: 1, Jester: 1 } },
    ]
  },
];

export function scoreQuizAnswers(answerIndexes: number[]) {
  if (answerIndexes.length !== questions.length) {
    throw new Error(`Expected ${questions.length} answers`);
  }

  const scores = Object.fromEntries(
    ARCHETYPE_PRIORITY.map((archetype) => [archetype, 0]),
  ) as Record<Archetype, number>;
  const coreScores = Object.fromEntries(
    ARCHETYPE_PRIORITY.map((archetype) => [archetype, 0]),
  ) as Record<Archetype, number>;

  questions.forEach((question, questionIndex) => {
    const answer = question.answers[answerIndexes[questionIndex]];
    if (!answer) throw new Error(`Invalid answer for question ${question.id}`);
    Object.entries(answer.scores).forEach(([archetype, points]) => {
      scores[archetype as Archetype] += points ?? 0;
      if (questionIndex < 7) {
        coreScores[archetype as Archetype] += points ?? 0;
      }
    });
  });

  const ranked = [...ARCHETYPE_PRIORITY].sort(
    (left, right) =>
      scores[right] - scores[left] ||
      coreScores[right] - coreScores[left] ||
      ARCHETYPE_PRIORITY.indexOf(left) - ARCHETYPE_PRIORITY.indexOf(right),
  );

  return {
    scores,
    coreScores,
    primary: ranked[0],
    primaryScore: scores[ranked[0]],
    secondary: ranked[1],
    secondaryScore: scores[ranked[1]],
  };
}
