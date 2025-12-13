import React from 'react';
import MapPicker from './MapPicker';

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

        <input
          type="number"
          value={data.totalSlots}
          onChange={(e) =>
            setData({ ...data, totalSlots: Number(e.target.value) })
          }
          className="input"
          placeholder="Total Slots"
        />

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
