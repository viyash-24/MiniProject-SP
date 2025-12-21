import EditParkingAreaModal from '../components/EditParkingArea';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import MapPicker from '../components/MapPicker';
import PhotoUpload from '../components/PhotoUpload';

const ParkingAreasPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [parkingAreas, setParkingAreas] = useState([]);
  const [showForm, setShowForm] = useState(location.state?.openForm || false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    photo: '',
    slotAmount: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  // This component for wrap getAuthHeader in useCallback
const getAuthHeader = useCallback(() => {
  const headers = { 'Content-Type': 'application/json' };
  if (user?.email) {
      headers['x-admin-email'] = (user.email || '').toLowerCase();
  }
  if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
  }
  return headers;
}, [user]);

  const fetchParkingAreas = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/parking-areas`, { 
        headers: getAuthHeader() 
      });
      
      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch parking areas');
      }
      
      setParkingAreas(data.parkingAreas || []);
    } catch (error) {
      console.error('Error fetching parking areas:', error);
      toast.error(error.message || 'Failed to fetch parking areas');
    } finally {
      setIsLoading(false);
    }
  }, [user, logout, navigate, API_URL, getAuthHeader]);
  
// Update the useEffect dependency array

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to view parking areas');
      navigate('/login');
      return;
    }
    fetchParkingAreas();
  }, [user, navigate, fetchParkingAreas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.latitude || 
        !formData.longitude || !formData.slotAmount) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const parkingAreaData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        location: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        },
        photo: formData.photo,
        slotAmount: parseInt(formData.slotAmount, 10)
      };

      const response = await fetch(`${API_URL}/parking-areas`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(parkingAreaData)
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create parking area');
      }

      toast.success('Parking area created successfully!');
      setParkingAreas(prev => [data.parkingArea, ...prev]);
      setFormData({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        photo: '',
        slotAmount: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating parking area:', error);
      toast.error(error.message || 'Failed to create parking area');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (area) => {
  setEditingArea({
    _id: area._id,
    name: area.name,
    address: area.address,
    totalSlots: area.totalSlots,
    latitude: area.location.latitude,
    longitude: area.location.longitude,
    photo: area.photo || ''
  });
  setIsEditOpen(true);
};


const handleUpdateParkingArea = async () => {
  try {
    const res = await fetch(
      `${API_URL}/parking-areas/${editingArea._id}`,
      {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({
          name: editingArea.name,
          address: editingArea.address,
          totalSlots: editingArea.totalSlots,
          location: {
            latitude: editingArea.latitude,
            longitude: editingArea.longitude
          },
          photo: editingArea.photo
        })
      }
    );

    if (!res.ok) throw new Error('Update failed');

    const { parkingArea } = await res.json();

    setParkingAreas((prev) =>
      prev.map((p) =>
        p._id === parkingArea._id ? parkingArea : p
      )
    );

    toast.success('Parking area updated');
    setIsEditOpen(false);
  } catch (err) {
    toast.error(err.message);
  }
};


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parking area?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/parking-areas/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete parking area');
      }

      toast.success('Parking area deleted successfully!');
      setParkingAreas(prev => prev.filter(area => area._id !== id));
    } catch (error) {
      console.error('Error deleting parking area:', error);
      toast.error(error.message || 'Failed to delete parking area');
    }
  };

  const handleToggleActive = async (area) => {
    try {
      const response = await fetch(`${API_URL}/parking-areas/${area._id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ ...area, active: !area.active })
      });

      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update parking area');
      }
      setParkingAreas(prev => 
        prev.map(a => a._id === area._id ? data.parkingArea : a)
      );
      toast.success(`Parking area ${area.active ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      console.error('Error updating parking area:', error);
      toast.error(error.message || 'Failed to update parking area');
    }
  };

  const handleLocationChange = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString()
    }));
  };

  const handlePhotoChange = (photoData) => {
    setFormData(prev => ({
      ...prev,
      photo: photoData
    }));
  };

  const handleRowClick = (id) => {
    navigate(`/admin/parking-areas/${id}`);
  };

  const filteredParkingAreas = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    return parkingAreas.filter(area =>
      area.name.toLowerCase().includes(term) ||
      area.address.toLowerCase().includes(term)
    );
  }, [parkingAreas, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parking Areas</h1>
          <p className="text-gray-600">Manage parking areas and their details.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
        >
          {showForm ? 'Cancel' : 'Add New Parking Area'}
        </button>
      </div>

      {showForm && (
        <div className="mt-6 bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Parking Area</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parking Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                  placeholder="e.g., Central Mall Parking"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                  placeholder="e.g., 123 Main Street, City"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.latitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                  className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                  placeholder="e.g., 12.9716"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.longitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                  className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                  placeholder="e.g., 77.5946"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slot Amount *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.slotAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, slotAmount: e.target.value }))}
                className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                placeholder="e.g., 50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Map
              </label>
              <MapPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={handleLocationChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parking Area Photo
              </label>
              <PhotoUpload
                onPhotoChange={handlePhotoChange}
                currentPhoto={formData.photo}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Parking Area'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 bg-white border rounded-2xl shadow-sm">
        <div className="p-4 border-b flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Existing Parking Areas</h2>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or address"
            className="w-60 rounded-md border-gray-300 focus:border-primary focus:ring-primary text-sm"
          />
        </div>
        
        {parkingAreas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No parking areas found. Create your first parking area above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Slots</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParkingAreas.map((area) => (
                  <tr key={area._id} onClick={() => handleRowClick(area._id)} className="hover:bg-gray-100 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{area.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{area.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {area.location?.latitude != null ? Number(area.location.latitude).toFixed(6) : 'N/A'}, {area.location?.longitude != null ? Number(area.location.longitude).toFixed(6) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{area.availableSlots ?? 0}</span>
                        <span className="text-gray-500"> / {area.totalSlots ?? area.slotAmount ?? 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        area.active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {area.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {new Date(area.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleActive(area)}
                          className={`px-2 py-1 rounded-md border text-xs ${
                            area.active 
                              ? 'border-red-300 text-red-700 hover:bg-red-50' 
                              : 'border-green-300 text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {area.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
  onClick={() => openEditModal(area)}
  className="px-4 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50"
>
  Edit
</button>

                        <button
                          onClick={() => handleDelete(area._id)}
                          className="px-2 py-1 rounded-md border border-red-300 text-red-700 text-xs hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
       {isEditOpen && (
        <EditParkingAreaModal
          data={editingArea}
          setData={setEditingArea}
          onClose={() => setIsEditOpen(false)}
          onSave={handleUpdateParkingArea}
        />
      )}
    </div>
  );
};

export default ParkingAreasPage;