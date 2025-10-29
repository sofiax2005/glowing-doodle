// frontend/src/components/ScrollStory.jsx

import React, { useState, useEffect } from 'react';

// You can extend this to include dynamic sections/navigation as you enhance the project
const NORMALIZATION_STAGES = [
  { key: 'unf', label: 'Unnormalized Form' },
  { key: '1nf', label: 'First Normal Form (1NF)' },
  { key: '2nf', label: 'Second Normal Form (2NF)' },
  { key: '3nf', label: 'Third Normal Form (3NF)' }
];

/**
 * ScrollStory: Simple scroll/step-driven storyboard for normalization stages
 * - Automatically advances as user scrolls down the page (can be improved with a scroll library later)
 */
function ScrollStory({ data, children }) {
  const [activeStage, setActiveStage] = useState(1); // 0=UNF, 1=1NF, etc.

  // Basic keyboard support for accessibility
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowDown' && activeStage < NORMALIZATION_STAGES.length - 1) {
        setActiveStage(s => s + 1);
      }
      if (e.key === 'ArrowUp' && activeStage > 0) {
        setActiveStage(s => s - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeStage]);

  // (Minimalist) Scroll control mockup–replace with real scroll/stepper as project grows
  return (
    <div className="max-w-4xl mx-auto p-4">
      <nav className="flex space-x-4 mb-8 justify-center">
        {NORMALIZATION_STAGES.map((stage, idx) => (
          <button
            key={stage.key}
            className={`py-2 px-4 rounded ${idx === activeStage
              ? 'bg-blue-700 text-white font-semibold'
              : 'bg-gray-100 text-blue-700 border border-blue-700'
            }`}
            onClick={() => setActiveStage(idx)}
            aria-current={idx === activeStage ? "step" : undefined}
          >
            {stage.label}
          </button>
        ))}
      </nav>
      <section>
        {/* Render each stage's children (extension: show visual per stage here) */}
        {React.Children.map(children, (child, idx) =>
          idx === activeStage ? React.cloneElement(child, { isActive: true }) : null
        )}
      </section>
      <footer className="text-center text-gray-500 mt-8">
        <small>
          Use <kbd>↑</kbd>/<kbd>↓</kbd> arrows or click buttons to switch stages.
        </small>
      </footer>
    </div>
  );
}

export default ScrollStory;
