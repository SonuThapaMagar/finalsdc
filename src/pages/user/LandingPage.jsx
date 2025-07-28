// src/pages/user/LandingPage.jsx
import { useState, useEffect } from 'react';
import { Search, Heart, Shield, Users, Award, Phone, Mail, MapPin, Facebook, Twitter, Instagram, ArrowRight, CheckCircle } from 'lucide-react';
import { getPets, searchPets } from '../../services/userService';
import '../../styles/landing.css';
import LandingFooter from './components/Footer/LandingFooter';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import HeroSection from './components/landing/HeroSection';
import CategoriesSection from './components/landing/CategoriesSection';
import FeaturedPetsSection from './components/landing/FeaturedPetsSection';
import AboutSection from './components/landing/AboutSection';
import FeaturesSection from './components/landing/FeaturesSection';
import CTASection from './components/landing/CTASection';

function LandingPage() {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const petData = await getPets();
        setPets(petData.slice(0, 4)); // Display first 4 pets
        setIsLoading(false);
      } catch (error) {
        toast.error(error.message);
        setIsLoading(false);
      }
    };
    fetchPets();
  }, []);

  const toggleFavorite = (petId) => {
    setIsFavorite((prev) => ({ ...prev, [petId]: !prev[petId] }));
  };

  const onNavigateToCategories = () => navigate('/category');

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      const results = await searchPets(searchQuery);
      navigate('/category', { state: { searchResults: results } });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const features = [
    { icon: Shield, title: 'Verified Shelters', description: 'All our partner shelters are verified and trusted organizations committed to animal welfare.' },
    { icon: Heart, title: 'Health Guaranteed', description: 'Every pet comes with complete health records and veterinary checkups.' },
    { icon: Users, title: '24/7 Support', description: 'Our dedicated team is here to help you throughout your adoption journey.' },
    { icon: Award, title: 'Success Stories', description: 'Over 10,000 successful adoptions and countless happy families created.' },
  ];

  return (
    <div className="landing-page">
      <HeroSection
        navigate={navigate}
        browseUrl="/category"
        learnMoreUrl="/learn-more"
      />
      <CategoriesSection pets={pets} />
      <FeaturedPetsSection
        pets={pets}
        isLoading={isLoading}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
        onNavigateToCategories={onNavigateToCategories}
        viewAllPetsUrl="/category" // Pass the guest URL
        navigate={navigate}
      />
      <AboutSection navigate={navigate} />
      <FeaturesSection features={features} />
      <CTASection onNavigateToCategories={onNavigateToCategories} navigate={navigate} />
      <LandingFooter />
    </div>
  );
}

export default LandingPage;