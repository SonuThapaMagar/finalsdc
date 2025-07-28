import React from 'react';
import { ArrowRight } from 'lucide-react';
import dc from '../../../../images/dc.png';
import { Heart } from 'lucide-react';

const HeroSection = ({ onNavigateToCategories, navigate, browseUrl, learnMoreUrl }) => (
  <section className="hero">
    <div className="hero-container">
      <div className="hero-grid">
        <div className="hero-content slide-left">
          <h1 className="hero-title">Find Your <span className="hero-gradient-text">Perfect Companion</span></h1>
          <p className="hero-subtitle">Connect with loving pets from verified shelters and rescues. Every adoption saves a life and creates a forever bond.</p>
          <div className="hero-buttons">
            <button
              className="hero-btn-primary"
              onClick={() => navigate(browseUrl)}
            >
              Browse Pets <ArrowRight size={20} />
            </button>
            <button
              className="hero-btn-secondary"
              onClick={() => navigate(learnMoreUrl)}
            >
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-image-container slide-right">
          <div className="hero-image">
            <img src={dc} alt="Happy pets" width="600" height="500" />
            <div className="hero-overlay" />
          </div>
          <div className="hero-stats fade-in">
            <div className="hero-stats-content">
              <div className="hero-stats-icon"><Heart size={24} fill="currentColor" /></div>
              <div>
                <div className="hero-stats-number">10K+</div>
                <div className="hero-stats-label">Happy Adoptions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;