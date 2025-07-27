import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditPetCenter = () => {
    const { centerId } = useParams();
    const navigate = useNavigate();
    const [center, setCenter] = useState({
        shelterName: '',
        address: '',
        phone: '',
        email: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [toastMsg, setToastMsg] = useState(null);

    useEffect(() => {
        const fetchCenter = async () => {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole');
            if (!token || userRole !== 'SUPERADMIN') {
                setToastMsg({ type: 'error', text: 'No superadmin token found. Please log in.' });
                navigate('/admin/login');
                return;
            }
            try {
                const response = await axios.get(`http://localhost:8080/api/superadmin/pet-centers/${centerId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCenter(response.data);
            } catch (error) {
                setToastMsg({ type: 'error', text: 'Failed to fetch pet center details.' });
            }
        };
        fetchCenter();
    }, [centerId, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCenter(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!center.shelterName.trim()) newErrors.shelterName = "Shelter Name is required.";
        if (!center.address.trim()) newErrors.address = "Address is required.";
        if (!center.phone.trim()) newErrors.phone = "Phone is required.";
        if (!center.email.trim()) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(center.email)) newErrors.email = "Invalid email format.";
        if (!center.description.trim()) newErrors.description = "Description is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setToastMsg({ type: 'error', text: 'Please correct the errors in the form.' });
            return;
        }
        setLoading(true);
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        if (!token || userRole !== 'SUPERADMIN') {
            setToastMsg({ type: 'error', text: 'No superadmin token found. Please log in.' });
            navigate('/superadmin/login');
            setLoading(false);
            return;
        }
        try {
            await axios.put(`http://localhost:8080/api/superadmin/pet-centers/${centerId}`, center, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setToastMsg({ type: 'success', text: 'Pet center updated successfully!' });
            setTimeout(() => navigate('/superadmin/pet-centers'), 1000);
        } catch (error) {
            setToastMsg({ type: 'error', text: 'Failed to update pet center.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">Edit Pet Center</h1>
                {toastMsg && (
                    <div className={`mb-4 p-3 rounded ${toastMsg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{toastMsg.text}</div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-2">
                        <label htmlFor="shelterName" className="block text-sm font-medium text-gray-700 mb-1">Shelter Name</label>
                        <input
                            id="shelterName"
                            name="shelterName"
                            value={center.shelterName}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.shelterName ? 'border-red-500' : ''}`}
                        />
                        {errors.shelterName && <p className="text-sm text-red-500">{errors.shelterName}</p>}
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            id="address"
                            name="address"
                            value={center.address}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : ''}`}
                        />
                        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            id="phone"
                            name="phone"
                            value={center.phone}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : ''}`}
                        />
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={center.email}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={center.description}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : ''}`}
                            rows={4}
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                            onClick={() => navigate('/superadmin/pet-centers')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPetCenter; 