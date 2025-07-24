import React, { useState } from 'react';

// Mock pet centers data
const petCenters = [
  { id: 1, name: 'Happy Paws Shelter', location: 'Downtown' },
  { id: 2, name: 'Safe Haven Center', location: 'Uptown' },
  { id: 3, name: 'Furry Friends Rescue', location: 'Midtown' },
  { id: 4, name: 'Paws & Claws', location: 'Eastside' },
];

function getNearestCenter(userLocation) {
  // Mock: just return the first center for now
  return petCenters[0];
}

const LostFound = () => {
  const [form, setForm] = useState({
    image: null,
    location: '',
    description: '',
    petCenterId: '',
  });
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would send the form data to your backend
  };

  const nearestCenter = form.location ? getNearestCenter(form.location) : null;

  return (
    <div className="lost-found-page" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 32, background: '#f8fafc' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#4f46e5', marginBottom: 24 }}>Lost & Found</h1>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px #e0e7ff', marginBottom: 32, width: '100%', maxWidth: 520, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontWeight: 500, color: '#4b5563' }}>Image of Found Dog</label>
          <input type="file" accept="image/*" name="image" onChange={handleImageChange} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }} />
          {preview && <img src={preview} alt="Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, margin: '12px auto 0 auto', boxShadow: '0 2px 8px #e0e7ff' }} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontWeight: 500, color: '#4b5563' }}>Location Found</label>
          <input type="text" name="location" value={form.location} onChange={handleChange} required style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, fontSize: 16 }} placeholder="e.g. Bhaisipati, Lalitpur" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontWeight: 500, color: '#4b5563' }}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={3} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, fontSize: 16, resize: 'vertical' }} placeholder="Describe the dog, its condition, etc." />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontWeight: 500, color: '#4b5563', marginBottom: 4 }}>Select Pet Center to Notify</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {petCenters.map(center => (
              <label key={center.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', borderRadius: 8, padding: '8px 12px', border: form.petCenterId === String(center.id) ? '2px solid #8b5cf6' : '1px solid #e5e7eb', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="petCenterId"
                  value={center.id}
                  checked={form.petCenterId === String(center.id)}
                  onChange={handleChange}
                  style={{ accentColor: '#8b5cf6', marginRight: 8 }}
                  required
                />
                <span style={{ fontWeight: 500 }}>{center.name}</span>
                <span style={{ color: '#6b7280', fontSize: 14, marginLeft: 4 }}>({center.location}{nearestCenter && nearestCenter.id === center.id ? ' - Nearest' : ''})</span>
              </label>
            ))}
          </div>
        </div>
        <button type="submit" style={{ background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 600, fontSize: 16, marginTop: 8, boxShadow: '0 2px 8px #e0e7ff', letterSpacing: 1 }}>Post Found Dog</button>
        {submitted && <div style={{ color: '#10b981', marginTop: 8, textAlign: 'center', fontWeight: 500 }}>Thank you for reporting! We'll notify the selected pet center.</div>}
      </form>
  </div>
);
};

export default LostFound; 