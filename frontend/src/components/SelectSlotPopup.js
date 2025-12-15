import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

// Normalize various vehicle type inputs to canonical categories used in slots
const normalizeType = (input) => {
  const t = String(input || '').trim().toLowerCase();
  if (!t) return null;
  if (t === 'car' || t === 'suv') return 'Car';
  if (t === 'bike' || t === 'bicycle' || t === 'scooter') return 'Bike';
  if (t === 'van' || t === 'truck') return 'Van';
  if (t === 'three-wheeler' || t === 'three wheeler' || t === 'auto' || t === 'rickshaw') return 'Three-wheeler';
  // Fall back to title-case first letter if matches our canon set
  const canon = ['car','bike','van','three-wheeler'].includes(t) ? t : null;
  return canon ? (canon === 'three-wheeler' ? 'Three-wheeler' : canon.charAt(0).toUpperCase() + canon.slice(1)) : null;
};

// Extract and normalize type from varying slot shapes
const getSlotType = (slot) => {
  const raw = slot?.vehicleType ?? slot?.type ?? slot?.vehicle_type ?? slot?.category;
  return normalizeType(raw);
};

const SelectSlotPopup = ({ isOpen, slots, vehicleType, typeDistribution, slotNumberBase, onClose, onSelect }) => {
  const requestedType = normalizeType(vehicleType);
  // Compute type ranges from distribution counts, assuming slot numbers are laid out sequentially
  const dist = typeDistribution || null;
  const ranges = (() => {
    if (!dist) return null;
    const car = Number(dist.Car || dist.carSlots || 0);
    const bike = Number(dist.Bike || dist.bikeSlots || 0);
    const van = Number(dist.Van || dist.vanSlots || 0);
    const three = Number(dist['Three-wheeler'] || dist.threeWheelerSlots || 0);
    let start = 1;
    const r = [];
    if (car > 0) { r.push({ type: 'Car', start, end: start + car - 1 }); start += car; }
    if (bike > 0) { r.push({ type: 'Bike', start, end: start + bike - 1 }); start += bike; }
    if (van > 0) { r.push({ type: 'Van', start, end: start + van - 1 }); start += van; }
    if (three > 0) { r.push({ type: 'Three-wheeler', start, end: start + three - 1 }); start += three; }
    return r.length ? r : null;
  })();

  const inferTypeFromNumber = (num) => {
    if (!ranges) return null;
    // If we know the base (minimum) slot number for the area, map to 1-based index
    const base = Number.isFinite(slotNumberBase) ? Number(slotNumberBase) : null;
    if (base !== null) {
      const idx = (Number(num) - base + 1); // 1-based position in the area
      if (idx < 1) return null;
      // Build cumulative windows from counts
      const car = ranges.find(r => r.type === 'Car')?.end - (ranges.find(r => r.type === 'Car')?.start || 1) + 1 || 0;
      const bike = ranges.find(r => r.type === 'Bike')?.end - (ranges.find(r => r.type === 'Bike')?.start || (car+1)) + 1 || 0;
      const van = ranges.find(r => r.type === 'Van')?.end - (ranges.find(r => r.type === 'Van')?.start || (car+bike+1)) + 1 || 0;
      const three = ranges.find(r => r.type === 'Three-wheeler')?.end - (ranges.find(r => r.type === 'Three-wheeler')?.start || (car+bike+van+1)) + 1 || 0;
      const c1 = car;
      const c2 = car + bike;
      const c3 = car + bike + van;
      if (idx >= 1 && idx <= c1) return 'Car';
      if (idx > c1 && idx <= c2) return 'Bike';
      if (idx > c2 && idx <= c3) return 'Van';
      if (idx > c3 && idx <= c3 + three) return 'Three-wheeler';
      return null;
    }
    // Fallback to absolute number ranges (start at 1)
    for (const r of ranges) {
      if (num >= r.start && num <= r.end) return r.type;
    }
    return null;
  };

  const getEffectiveType = (slot) => {
    // If we have a distribution, always trust the inferred range mapping
    if (ranges) return inferTypeFromNumber(slot.slotNumber);
    // Otherwise fall back to whatever the slot object carries
    return getSlotType(slot);
  };

  const filteredSlots = Array.isArray(slots)
    ? (requestedType
        ? slots.filter(s => getEffectiveType(s) === requestedType)
        : slots)
    : [];
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Available Slots{requestedType ? ` · ${requestedType}` : ''}</h3>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {filteredSlots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No slots available for the selected {requestedType ? `${requestedType.toLowerCase()} ` : ''}vehicle type.
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a slot to assign to this vehicle.
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2">
                    {filteredSlots.map((slot) => (
                      <button
                        key={slot.slotNumber}
                        onClick={() => onSelect(slot.slotNumber)}
                        className="group relative flex items-center justify-center px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        <span className="relative z-10">Slot {slot.slotNumber}</span>
                        {getEffectiveType(slot) && (
                          <span className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {getEffectiveType(slot)}
                          </span>
                        )}
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-end px-6 py-4 border-t border-border bg-muted/30">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SelectSlotPopup;
