// Brief, paraphrased brand-archetype reference data for the in-app Archetype
// Guide. Intentionally short summaries (not the full licensed reports) — the
// full individual reports remain a separate, more protected deliverable.
export const ARCHETYPES = {
  Ruler: {
    heart: 'Control',
    slogan: '"Power isn\'t everything, it\'s the only thing."',
    description: 'Leads with authority, order, and refinement. Ruler brands set the standard and reward excellence, status, and mastery.',
    brands: ['Louis Vuitton', 'Mercedes-Benz', 'Rolex'],
  },
  Hero: {
    heart: 'Mastery',
    slogan: '"Where there\'s a will, there\'s a way."',
    description: 'Proves what\'s possible through courage, discipline, and grit. Hero brands help people become stronger and overcome adversity.',
    brands: ['Nike', 'Adidas', 'FedEx'],
  },
  Magician: {
    heart: 'Power',
    slogan: '"It can happen."',
    description: 'Turns vision into reality and creates moments of transformation. Magician brands make the extraordinary feel possible.',
    brands: ['Disney', 'Coca-Cola', 'Dyson'],
  },
  Outlaw: {
    heart: 'Revolution',
    slogan: '"Rules are made to be broken."',
    description: 'Breaks convention and gives people permission to challenge the status quo. Outlaw brands disrupt and demand more.',
    brands: ['Harley-Davidson', 'Virgin', 'Diesel'],
  },
  Explorer: {
    heart: 'Freedom',
    slogan: '"Don\'t fence me in."',
    description: 'Champions freedom, discovery, and the courage to forge a new path. Explorer brands celebrate the journey.',
    brands: ['The North Face', 'Jeep', 'Patagonia'],
  },
  Creator: {
    heart: 'Innovation',
    slogan: '"If it can be imagined, it can be created."',
    description: 'Builds original, imaginative work that didn\'t exist before. Creator brands inspire and unlock imagination.',
    brands: ['LEGO', 'Apple', 'Adobe'],
  },
  Lover: {
    heart: 'Intimacy',
    slogan: '"I only have eyes for you."',
    description: 'Creates intimacy, beauty, and deep emotional connection. Lover brands make people feel seen and desired.',
    brands: ['Chanel', 'Alfa Romeo', "Victoria's Secret"],
  },
  Caregiver: {
    heart: 'Service',
    slogan: '"Love your neighbor as yourself."',
    description: 'Leads with compassion, protection, and selfless service. Caregiver brands put others before self.',
    brands: ['UNICEF', 'TOMS', 'WWF'],
  },
  Everyman: {
    heart: 'Belonging',
    slogan: '"You\'re just like me, and I\'m just like you."',
    description: 'Builds belonging through honesty, relatability, and shared values. Everyman brands feel like a trusted friend.',
    brands: ['IKEA', 'Target', 'Lynx'],
  },
  Jester: {
    heart: 'Pleasure',
    slogan: '"If I can\'t dance, I\'m not part of it."',
    description: 'Brings joy, humor, and lightness to everything it touches. Jester brands make people laugh and enjoy the moment.',
    brands: ["Dollar Shave Club", "Old Spice", "M&M's"],
  },
  Sage: {
    heart: 'Understanding',
    slogan: '"The truth will set you free."',
    description: 'Guides through wisdom, expertise, and truth. Sage brands help people think better and learn continuously.',
    brands: ['Google', 'BBC', 'University of Oxford'],
  },
  Innocent: {
    heart: 'Safety',
    slogan: '"Life is simple, and simplicity is elegant."',
    description: 'Offers simplicity, optimism, and wholesome trust. Innocent brands are honest, humble, and uncomplicated.',
    brands: ['Dove', 'Aveeno', 'Innocent'],
  },
};

export const ARCHETYPE_ORDER = [
  'Ruler', 'Hero', 'Magician', 'Outlaw', 'Explorer', 'Creator',
  'Lover', 'Caregiver', 'Everyman', 'Jester', 'Sage', 'Innocent',
];

// Rough denominator for turning raw quiz points into a percentage: each of
// the 18 questions always splits its points across exactly two archetypes
// (7 questions worth 3pts, 7 worth 2pts, 4 worth 1pt — each x2 recipients).
export const MAX_QUIZ_POINTS = 7 * 3 * 2 + 7 * 2 * 2 + 4 * 1 * 2;