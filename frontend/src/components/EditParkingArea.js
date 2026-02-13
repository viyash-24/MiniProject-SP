import React, { useState } from 'react';
import MapPicker from './MapPicker';
import toast from 'react-hot-toast';

const EditParkingAreaModal = ({ data, setData, onClose, onSave }) => {
  const [fieldErrors, setFieldErrors] = useState({});

  if (!data) return null;

  const handleSave = () => {
    const errors = {};
    
    if (!data.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!data.address?.trim()) {
      errors.address = 'Address is required';
    }
    
    if (data.carSlots === undefined || data.carSlots === '' || data.carSlots < 0) {
      errors.carSlots = 'Car slots is required';
    }
    
    if (data.bikeSlots === undefined || data.bikeSlots === '' || data.bikeSlots < 0) {
      errors.bikeSlots = 'Bike slots is required';
    }
    
    if (data.vanSlots === undefined || data.vanSlots === '' || data.vanSlots < 0) {
      errors.vanSlots = 'Van slots is required';
    }
    
    if (data.threeWheelerSlots === undefined || data.threeWheelerSlots === '' || data.threeWheelerSlots < 0) {
      errors.threeWheelerSlots = 'Three-wheeler slots is required';
    }
    
    if (!data.latitude || !data.longitude) {
      errors.location = 'Please select a location on the map';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fill in all required fields');
      return;
    }
    
    setFieldErrors({});
    onSave();
  };

  const clearFieldError = (field) => {
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const getInputClass = (field) => {
    return fieldErrors[field] 
      ? 'input border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'input';
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">

        <h2 className="text-xl font-semibold">Edit Parking Area</h2>

        <div>
          <input
            value={data.name}
            onChange={(e) => {
              setData({ ...data, name: e.target.value });
              clearFieldError('name');
            }}
            className={getInputClass('name')}
            placeholder="Parking Area Name"
          />
          {fieldErrors.name && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <input
            value={data.address}
            onChange={(e) => {
              setData({ ...data, address: e.target.value });
              clearFieldError('address');
            }}
            className={getInputClass('address')}
            placeholder="Address"
          />
          {fieldErrors.address && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="number"
              value={data.carSlots ?? 0}
              onChange={(e) => {
                setData({ ...data, carSlots: Number(e.target.value) });
                clearFieldError('carSlots');
              }}
              className={getInputClass('carSlots')}
              placeholder="Car Slots"
              min={0}
            />
            {fieldErrors.carSlots && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.carSlots}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              value={data.bikeSlots ?? 0}
              onChange={(e) => {
                setData({ ...data, bikeSlots: Number(e.target.value) });
                clearFieldError('bikeSlots');
              }}
              className={getInputClass('bikeSlots')}
              placeholder="Bike Slots"
              min={0}
            />
            {fieldErrors.bikeSlots && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.bikeSlots}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              value={data.vanSlots ?? 0}
              onChange={(e) => {
                setData({ ...data, vanSlots: Number(e.target.value) });
                clearFieldError('vanSlots');
              }}
              className={getInputClass('vanSlots')}
              placeholder="Van Slots"
              min={0}
            />
            {fieldErrors.vanSlots && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.vanSlots}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              value={data.threeWheelerSlots ?? 0}
              onChange={(e) => {
                setData({ ...data, threeWheelerSlots: Number(e.target.value) });
                clearFieldError('threeWheelerSlots');
              }}
              className={getInputClass('threeWheelerSlots')}
              placeholder="Three-wheeler Slots"
              min={0}
            />
            {fieldErrors.threeWheelerSlots && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.threeWheelerSlots}</p>
            )}
          </div>
          <div className="col-span-2 text-sm text-gray-600">Total (calculated): {Number(data.carSlots||0)+Number(data.bikeSlots||0)+Number(data.vanSlots||0)+Number(data.threeWheelerSlots||0) || data.totalSlots}</div>
        </div>

        <div>
          <MapPicker
            latitude={data.latitude}
            longitude={data.longitude}
            onLocationChange={(lat, lng) => {
              setData({ ...data, latitude: lat, longitude: lng });
              clearFieldError('location');
            }}
          />
          {fieldErrors.location && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.location}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
          >
            Save Changes
          </button>

          <button
            onClick={onClose}
            className="flex-1 border py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditParkingAreaModal;
