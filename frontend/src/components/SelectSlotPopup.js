import React from 'react';

const SelectSlotPopup = ({ isOpen, slots, onClose, onSelect }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Available Slots</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>
        <div className="p-4 space-y-4">
          {!slots || slots.length === 0 ? (
            <p className="text-sm text-gray-500">
              No slots available for the selected parking area.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Select a slot to assign to this vehicle.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {slots.map((slot) => (
                  <button
                    key={slot.slotNumber}
                    type="button"
                    onClick={() => onSelect(slot.slotNumber)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Slot {slot.slotNumber}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end px-4 py-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectSlotPopup;
