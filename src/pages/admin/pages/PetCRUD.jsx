import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import { toast } from 'react-toastify';
import { RiEdit2Line, RiDeleteBin6Line, RiAddLine, RiCloseLine, RiSaveLine, RiImageAddLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const initialPet = {
  id: '',
  name: '',
  breed: '',
  age: '',
  gender: '',
  location: '',
  status: 'AVAILABLE',
  description: '',
  image: null,
  imageUrl: '' // To store the existing image URL for preview
};

export default function PetCRUD() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPet, setCurrentPet] = useState(initialPet);
  const [errors, setErrors] = useState({});
  const [deletePetId, setDeletePetId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const petsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);
  // Export to Excel handler
  const handleExportTable = () => {
    if (!pets.length) {
      toast.error('No pet data to export');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(pets);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pets');
    XLSX.writeFile(workbook, 'pets_table.xlsx');
  };

  useEffect(() => {
    fetchPets();
  }, [currentPage]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/pets`);
      const allPets = res.data.map(pet => ({
        ...pet,
        imageUrl: pet.imageUrl || '' // Ensure imageUrl is always present
      }));
      setTotalPages(Math.ceil(allPets.length / petsPerPage));
      const startIndex = (currentPage - 1) * petsPerPage;
      const endIndex = startIndex + petsPerPage;
      setPets(allPets.slice(startIndex, endIndex));
    } catch (error) {
      toast.error('Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentPet(initialPet);
    setErrors({});
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (pet) => {
    setEditMode(true);
    setCurrentPet({
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      location: pet.location,
      status: pet.status,
      description: pet.description,
      image: null, // Reset image for upload
      imageUrl: pet.imageUrl // Preserve existing image URL for preview
    });
    setErrors({});
    setImagePreview(pet.imageUrl || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentPet(initialPet);
    setErrors({});
    setImagePreview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPet((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB.');
        return;
      }
      setCurrentPet((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!currentPet.name.trim()) newErrors.name = 'Name is required.';
    if (!currentPet.breed.trim()) newErrors.breed = 'Breed is required.';
    if (!String(currentPet.age).trim()) newErrors.age = 'Age is required.';
    if (!currentPet.gender.trim()) newErrors.gender = 'Gender is required.';
    if (!currentPet.location.trim()) newErrors.location = 'Location is required.';
    if (!currentPet.status.trim()) newErrors.status = 'Status is required.';
    if (!currentPet.description.trim()) newErrors.description = 'Description is required.';
    if (!editMode && !currentPet.image) newErrors.image = 'Image is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form.');
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('name', currentPet.name);
      formData.append('breed', currentPet.breed);
      formData.append('age', currentPet.age);
      formData.append('gender', currentPet.gender);
      formData.append('description', currentPet.description);
      formData.append('location', currentPet.location);
      formData.append('status', currentPet.status);
      if (currentPet.image) {
        formData.append('image', currentPet.image);
      }
  
      if (editMode) {
        await api.put(`/api/admin/pets/${currentPet.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Pet updated successfully!');
      } else {
        await api.post('/api/admin/pets', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Pet added successfully!');
      }
      closeModal();
      fetchPets();
    } catch (error) {
      toast.error('Failed to save pet: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (petId) => {
    try {
      await api.delete(`/api/admin/pets/${petId}`);
      setPets(pets.filter((p) => p.id !== petId));
      toast.success('Pet deleted successfully!');
      setDeletePetId(null);
    } catch (error) {
      toast.error('Failed to delete pet. Please try again.');
    }
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pet Management</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RiAddLine className="text-lg" /> Add Pet
        </button>
      </div>
      <div className="flex justify-end mb-2">
        <button
          onClick={handleExportTable}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Export to Excel
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Image</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Name</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Breed</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Age</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Gender</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Location</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Status</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Details</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pets.map((pet) => (
                <tr key={pet.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    {pet.imageUrl ? (
                      <img
                        src={pet.imageUrl}
                        alt={pet.name}
                        className="w-10 h-10 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <RiImageAddLine className="text-gray-400 text-lg" />
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm">{pet.name}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm">{pet.breed}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm">{pet.age}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm">{pet.gender}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm">{pet.location}</td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${pet.status === 'AVAILABLE'
                      ? 'bg-green-100 text-green-800'
                      : pet.status === 'ADOPTED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {pet.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => navigate(`/admin/pets/${pet.id}`)}
                      className="text-green-600 hover:text-green-900 text-sm"
                      title="View Details"
                    >
                      View
                    </button>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => openEditModal(pet)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      title="Edit"
                    >
                      <RiEdit2Line className="text-lg" />
                    </button>
                    <button
                      onClick={() => setDeletePetId(pet.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <RiDeleteBin6Line className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
              {pets.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No pets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-6 pb-4">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-2 text-sm font-medium border ${currentPage === i + 1
                  ? 'bg-blue-50 text-blue-600 border-blue-300'
                  : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{editMode ? 'Edit Pet' : 'Add Pet'}</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <RiCloseLine className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet Image</label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={`w-full p-2 border rounded ${errors.image ? 'border-red-500' : ''}`}
                    />
                    {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
                  </div>
                  {imagePreview && (
                    <div className="w-20 h-20">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Supported formats: JPG, PNG, GIF</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  value={currentPet.name}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <input
                  name="breed"
                  value={currentPet.breed}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.breed ? 'border-red-500' : ''}`}
                />
                {errors.breed && <p className="text-sm text-red-500">{errors.breed}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  name="age"
                  value={currentPet.age}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.age ? 'border-red-500' : ''}`}
                />
                {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={currentPet.gender}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.gender ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  name="location"
                  value={currentPet.location}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.location ? 'border-red-500' : ''}`}
                />
                {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={currentPet.status}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.status ? 'border-red-500' : ''}`}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ADOPTED">Adopted</option>
                  <option value="PENDING">Pending</option>
                </select>
                {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={currentPet.description}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : ''}`}
                  rows={3}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RiSaveLine className="text-lg" /> {editMode ? 'Save Changes' : 'Add Pet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletePetId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <div className="font-semibold text-lg mb-2">Are you sure?</div>
            <div className="text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the pet and remove their data from our servers.
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setDeletePetId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => handleDelete(deletePetId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
