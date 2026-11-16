import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/** Dashboard invitation to the Brand Persona Quiz. */
export default function PersonaQuizBanner() {
  return (
    <Link
      to="/brand-persona-quiz"
      className="btn-forge group flex flex-col gap-3 rounded-[5px] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      
      <div>
        <h2 className="leading-tight [font-family:'Adobe_Caslon',_sans-serif] font-normal text-xl sm:text-xl tracking-[0.1em]">What's Your Power Persona?</h2>
        <p className="mt-1 text-sm opacity-90">Take the Free Quiz to Unlock Your Brand Messaging</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
        Take the quiz <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>);

}