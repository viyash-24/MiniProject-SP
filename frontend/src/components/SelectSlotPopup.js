import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

const SelectSlotPopup = ({ isOpen, slots, onClose, onSelect }) => {
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
              <h3 className="text-lg font-semibold text-foreground">Available Slots</h3>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {!slots || slots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No slots available for the selected parking area.
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a slot to assign to this vehicle.
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.slotNumber}
                        onClick={() => onSelect(slot.slotNumber)}
                        className="group relative flex items-center justify-center px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        <span className="relative z-10">Slot {slot.slotNumber}</span>
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
