import React, { useEffect } from 'react';

export default function Testimonials() {
  useEffect(() => {
    const existing = document.querySelector('script[src*="reputationhub"]');
    if (existing) return;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://reputationhub.site/reputation/assets/review-widget.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="mt-12">
      <p className="text-xs uppercase tracking-[0.3em] text-[#d9c9a3] text-center mb-6">What Clients Say</p>
      <iframe
        className="lc_reviews_widget"
        src="https://reputationhub.site/reputation/widgets/review_widget/vWfRN0dFcsqJFR2yqvAI?widgetId=6a56ac2d2c90db1e4f27ea3d"
        frameBorder="0"
        scrolling="no"
        style={{ minWidth: '100%', width: '100%', border: 'none' }}
        title="Client Reviews"
      />
    </div>
  );
}