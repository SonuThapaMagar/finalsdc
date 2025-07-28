import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPets } from '../../../services/userService';
import { toast } from 'react-toastify';
import '../../../styles/landing.css';
import LandingFooter from '../components/Footer/LandingFooter';
import HeroSection from '../components/landing/HeroSection';
import CategoriesSection from '../components/landing/CategoriesSection';
import FeaturedPetsSection from '../components/landing/FeaturedPetsSection';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState({});

  useEffect(() => {
    fetchPets();
    loadFavorites();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const petsData = await getPets();
      setPets(petsData.slice(0, 6)); // Show only first 6 pets on dashboard
    } catch (error) {
      console.error('Failed to fetch pets:', error);
      // Show mock data if API fails
      const mockPets = [
        {
          id: 1,
          name: 'Buddy',
          breed: 'Golden Retriever',
          age: 3,
          gender: 'Male',
          imageUrl: '/default-pet.jpg'
        },
        {
          id: 2,
          name: 'Luna',
          breed: 'Siamese Cat',
          age: 2,
          gender: 'Female',
          imageUrl: '/default-pet.jpg'
        },
        {
          id: 3,
          name: 'Max',
          breed: 'Labrador',
          age: 4,
          gender: 'Male',
          imageUrl: '/default-pet.jpg'
        }
      ];
      setPets(mockPets);
      toast.info('Showing sample pets. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
      // For compatibility with FeaturedPetsSection
      const favObj = {};
      JSON.parse(savedFavorites).forEach(id => { favObj[id] = true; });
      setIsFavorite(favObj);
    }
  };

  const toggleFavorite = (petId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(petId)
        ? prev.filter(id => id !== petId)
        : [...prev, petId];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      // For compatibility with FeaturedPetsSection
      const favObj = {};
      newFavorites.forEach(id => { favObj[id] = true; });
      setIsFavorite(favObj);
      return newFavorites;
    });
  };

  // For dashboard, you may want to customize the hero section text
  const heroProps = {
    navigate,
    browseUrl: '/user/petList',
    learnMoreUrl: '/user/learn-more', // Use a user-specific route
    title: 'Welcome to Your ',
    highlight: 'Dashboard',
    subtitle: 'Find your perfect companion and manage your adoption journey',
    showSearch: false
  };

  return (
    <div className="landing-page">
      <HeroSection {...heroProps} />
      <CategoriesSection pets={pets} />
      <FeaturedPetsSection
        pets={pets}
        isLoading={loading}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
        onNavigateToCategories={() => navigate('/user/petList')}
        viewAllPetsUrl="/user/petList" // Pass the logged-in URL
        navigate={navigate}
      />
      <LandingFooter />
    </div>
  );
};

export default UserDashboard;