import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Filter } from "lucide-react";
import FilterModal from "./filtermodal";
import NotificationsPanel from "./notificationpanel";
import SearchModal from "./searchmodal";
import ProfileModal from "./ProfileModal";
import PetDetail from "../../user/pages/petdetail";
import api from '../../../api/api';
import Navbar from '../../user/pages/Navbar'; // Ensure this path is correct
import { profileImage } from "../../../data/petImages";
import logo from "../../../images/logo.png";
import "../../../index.css";
import "../../../styles/filtermodal.css";
import "../../../styles/category.css";
import "../../../styles/petdetails.css";
import "../../../styles/notification.css";

export default function PetCategories() {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [pets, setPets] = useState([]);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState({
    fullName: "Stylish Boi",
    email: "stylishboi@gmail.com",
    profileImage: profileImage,
    memberSince: "January 2024",
    accountStatus: "Active",
  });

  const inferPetType = (breed) => {
    const dogBreeds = ["labrador", "poodle", "bulldog", "beagle", "retriever", "pug"];
    const catBreeds = ["persian", "siamese", "maine coon", "ragdoll"];
    const breedLower = breed.toLowerCase();
    if (dogBreeds.some((dogBreed) => breedLower.includes(dogBreed))) return "Dogs";
    if (catBreeds.some((catBreed) => breedLower.includes(catBreed))) return "Cats";
    return "Others";
  };

  useEffect(() => {
    const fetchPets = async () => {
      try {
        let config = {};
        const token = localStorage.getItem("jwtToken");
        if (token) {
          config.headers = { Authorization: `Bearer ${token}` };
        }
        const response = await api.get('/api/user/pets', config);
        const data = response.data;
        const mappedPets = data.map((pet) => ({
          id: pet.id,
          name: pet.name,
          breed: pet.breed,
          age: pet.age.toString(),
          gender: pet.gender,
          location: pet.location || "Unknown",
          imageUrl: pet.imageUrl || "/placeholder.svg",
          description: pet.description || "No description available",
          status: pet.status || "Unknown",
        }));
        setPets(mappedPets);
        setError(null);
      } catch (err) {
        setError("Error fetching pets: " + (err.response?.data?.message || err.message));
        if (err.response?.status === 403) {
          navigate("/login");
        }
      }
    };
    fetchPets();
  }, [navigate]);

  const getFilteredPets = () => {
    let filtered = pets;
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (pet) =>
          pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.age.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (Object.keys(activeFilters).length > 0) {
      filtered = filtered.filter((pet) => {
        if (activeFilters.breed && activeFilters.breed !== "") {
          if (!pet.breed.toLowerCase().includes(activeFilters.breed.toLowerCase())) return false;
        }
        if (activeFilters.gender && activeFilters.gender !== "Both") {
          if (activeFilters.gender.toLowerCase() !== pet.gender.toLowerCase()) return false;
        }
        if (activeFilters.age && activeFilters.age.length > 0) {
          const petAge = pet.age.toLowerCase();
          const matchesAge = activeFilters.age.some((ageFilter) =>
            petAge.includes(ageFilter.toLowerCase())
          );
          if (!matchesAge) return false;
        }
        if (activeFilters.location && activeFilters.location !== "") {
          if (!pet.location.toLowerCase().includes(activeFilters.location.toLowerCase())) return false;
        }
        return true;
      });
    }
    return filtered;
  };

  const filteredPets = getFilteredPets();

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    console.log("Applied filters:", filters);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handlePetClick = (petId) => {
    setSelectedPetId(petId);
  };

  const handleClosePetDetail = () => {
    setSelectedPetId(null);
  };

  const toggleFavorite = (petId, event) => {
    event.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(petId)) {
        newFavorites.delete(petId);
      } else {
        newFavorites.add(petId);
      }
      return newFavorites;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchQuery("");
  };

  const handleResultClick = (pet) => {
    setIsSearchOpen(false);
    setTimeout(() => {
      setSelectedPetId(pet.id);
    }, 100);
  };

  const handleUpdateProfile = (updatedProfile) => {
    setUserProfile(updatedProfile);
    console.log("Profile updated:", updatedProfile);
  };

  return (
    <div>
      {/* Add Navbar here */}
      <Navbar
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        searchResults={filteredPets}
        onSearchResultClick={(pet) => handleResultClick(pet)}
      />
      <motion.div
        className="pet-categories"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {error && (
          <motion.div className="category-error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
            <motion.button
              onClick={() => window.location.reload()}
              className="category-retry-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retry
            </motion.button>
          </motion.div>
        )}
        <motion.main
          className="category-page-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="category-main">
            <motion.div
              className="category-filter-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <motion.button
                className="category-filter-button"
                onClick={() => setIsFilterOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Filter size={20} />
                Filter
                {Object.keys(activeFilters).length > 0 && (
                  <motion.span
                    className="category-filter-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    {Object.keys(activeFilters).length}
                  </motion.span>
                )}
              </motion.button>
              {(Object.keys(activeFilters).length > 0 || searchQuery) && (
                <motion.button
                  className="category-clear-filters-button"
                  onClick={clearAllFilters}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Clear All
                </motion.button>
              )}
            </motion.div>
            <motion.div
              className="category-results-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {searchQuery && (
                <span>
                  Search results for "{searchQuery}" • {filteredPets.length} pets found
                </span>
              )}
              {!searchQuery && Object.keys(activeFilters).length > 0 && (
                <span>Filtered results • {filteredPets.length} pets found</span>
              )}
              {!searchQuery && Object.keys(activeFilters).length === 0 && (
                <span>Showing all pets • {filteredPets.length} pets</span>
              )}
            </motion.div>
            <motion.div className="category-pet-grid" layout>
              <AnimatePresence>
                {filteredPets.length > 0 ? (
                  filteredPets.map((pet, index) => (
                    <motion.div
                      key={pet.id}
                      onClick={() => handlePetClick(pet.id)}
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -50, scale: 0.9 }}
                      transition={{ delay: index * 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
                      whileHover={{ y: -8, transition: { duration: 0.2 } }}
                      layout
                    >
                      <PetCard
                        name={pet.name}
                        gender={pet.gender}
                        info={`${pet.age} | ${pet.breed}`}
                        imageUrl={pet.imageUrl}
                        isFavorite={favorites.has(pet.id)}
                        onToggleFavorite={(event) => toggleFavorite(pet.id, event)}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    className="category-no-results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🐾</div>
                    <h3>No pets found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                    <motion.button
                      onClick={clearAllFilters}
                      className="category-no-results-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear filters
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.main>
        <AnimatePresence>
          {isFilterOpen && (
            <FilterModal
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              onApplyFilters={handleApplyFilters}
              currentFilters={activeFilters}
            />
          )}
          {isSearchOpen && (
            <SearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              onSearch={handleSearch}
              onClearSearch={handleClearSearch}
              currentQuery={searchQuery}
              pets={pets}
              onPetClick={handleResultClick}
            />
          )}
          {isNotificationsOpen && (
            <NotificationsPanel
              isOpen={isNotificationsOpen}
              onClose={() => {
                setIsNotificationsOpen(false);
                setHasUnreadNotifications(false);
              }}
            />
          )}
          {isProfileOpen && (
            <ProfileModal
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
          {selectedPetId && (
            <PetDetail
              petId={selectedPetId}
              onClose={() => setSelectedPetId(null)}
              favorites={favorites}
              onToggleFavorite={(event) => toggleFavorite(selectedPetId, event)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function PetCard({ name, gender, info, imageUrl, isFavorite, onToggleFavorite }) {
  return (
    <motion.div
      className="category-pet-card"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="category-pet-image-container">
        <motion.img
          src={imageUrl || "/placeholder.svg"}
          alt={name}
          className="category-pet-image"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="category-pet-info">
        <div className="category-pet-name-section">
          <div className="category-pet-name-gender">
            <motion.h3
              className="category-pet-name"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {name}
            </motion.h3>
            <motion.span
              className={gender === "female" ? "category-gender-female" : "category-gender-male"}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
            >
              {gender === "female" ? "♀️" : "♂️"}
            </motion.span>
          </div>
          <motion.p
            className="category-pet-details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {info}
          </motion.p>
        </div>
        <motion.button
          className={`category-favorite-button ${isFavorite ? "active" : ""}`}
          onClick={onToggleFavorite}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          animate={
            isFavorite
              ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }
              : {}
          }
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={isFavorite ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Heart className={isFavorite ? "fill-current" : ""} size={20} />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );
}