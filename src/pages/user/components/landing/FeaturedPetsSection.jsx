import React from 'react';
import { Heart } from 'lucide-react';

const FeaturedPetsSection = ({
  pets,
  isLoading,
  isFavorite,
  toggleFavorite,
  onNavigateToCategories,
  viewAllPetsUrl,
  navigate
}) => (
  <section className="featured-pets" style={{ background: 'white', padding: '4rem 0' }}>
    <div className="featured-pets-container">
      <div className="section-header slide-up">
        <h2 className="section-title">Pets Available for Adoption</h2>
        <p className="section-subtitle">Meet some of our wonderful pets looking for their forever homes</p>
      </div>
      {isLoading ? (
        <div>Loading pets...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="landing-pet-card"
              style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: 'white', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
              onClick={() => navigate(`/adoptme/${pet.id}`)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ position: 'relative', width: '100%', paddingTop: '100%' }}>
                <img src={pet.imageUrl || '/placeholder.svg'} alt={pet.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(pet.id); }}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255, 255, 255, 0.9)', borderRadius: '50%', width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease', color: isFavorite[pet.id] ? '#8b5cf6' : '#6b7280', backdropFilter: 'blur(4px)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(243, 244, 246, 0.95)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <Heart size={20} fill={isFavorite[pet.id] ? '#8b5cf6' : 'none'} stroke={isFavorite[pet.id] ? '#8b5cf6' : '#6b7280'} />
                </button>
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginRight: '0.5rem' }}>{pet.name}</h3>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>
                    {pet.gender === 'female' ? '♀️' : '♂️'}
                  </span>
                </div>
                <p style={{ color: '#6b7280', margin: '0' }}>{pet.age} | {pet.breed}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => navigate(viewAllPetsUrl)}
        style={{
          backgroundColor: 'white',
          color: '#8b5cf6',
          border: '2px solid #8b5cf6',
          padding: '0.75rem 2rem',
          borderRadius: '9999px',
          fontWeight: '600',
          margin: '3rem auto 0',
          display: 'block',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        View All Pets
      </button>
    </div>
  </section>
);

export default FeaturedPetsSection;