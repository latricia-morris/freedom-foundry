import React from 'react';

export default function BrandPortal() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mb-2">
          Brand <span className="molten-text italic">Portal</span>
        </h1>
        <p className="text-sm text-muted-foreground">Your brand profiles, assets, and identity — all in one place.</p>
      </div>
      <div className="dashboard-card p-8">
        <p className="text-sm text-muted-foreground">Select a section from the navigation to manage your personal brand, corporate identity, big picture, and media kit.</p>
      </div>
    </div>
  );
}