import React from 'react';
import MapPicker from './MapPicker';

// Modal component for editing parking area details
const EditParkingAreaModal = ({ data, setData, onClose, onSave }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">

        <h2 className="text-xl font-semibold">Edit Parking Area</h2>

        <input
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="input"
          placeholder="Parking Area Name"
        />

        <input
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          className="input"
          placeholder="Address"
        />


        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={data.carSlots ?? 0}
            onChange={(e) => setData({ ...data, carSlots: Number(e.target.value) })}
            className="input"
            placeholder="Car Slots"
            min={0}
          />
          <input
            type="number"
            value={data.bikeSlots ?? 0}
            onChange={(e) => setData({ ...data, bikeSlots: Number(e.target.value) })}
            className="input"
            placeholder="Bike Slots"
            min={0}
          />
          <input
            type="number"
            value={data.vanSlots ?? 0}
            onChange={(e) => setData({ ...data, vanSlots: Number(e.target.value) })}
            className="input"
            placeholder="Van Slots"
            min={0}
          />
          <input
            type="number"
            value={data.threeWheelerSlots ?? 0}
            onChange={(e) => setData({ ...data, threeWheelerSlots: Number(e.target.value) })}
            className="input"
            placeholder="Three-wheeler Slots"
            min={0}
          />
          <div className="col-span-2 text-sm text-gray-600">Total (calculated): {Number(data.carSlots||0)+Number(data.bikeSlots||0)+Number(data.vanSlots||0)+Number(data.threeWheelerSlots||0) || data.totalSlots}</div>
        </div>


        <MapPicker
          latitude={data.latitude}
          longitude={data.longitude}
          onLocationChange={(lat, lng) =>
            setData({ ...data, latitude: lat, longitude: lng })
          }
        />

        <div className="flex gap-3 pt-4">
          <button
            onClick={onSave}
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
