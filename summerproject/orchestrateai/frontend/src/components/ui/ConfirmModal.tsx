import React from 'react';
import { Button } from './Button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, top: '45%' }}
            animate={{ opacity: 1, scale: 1, top: '50%' }}
            exit={{ opacity: 0, scale: 0.95, top: '45%' }}
            className="fixed left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-secondary rounded-xl shadow-2xl border border-border"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{title}</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-muted-foreground mb-6">{description}</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose}>{cancelText}</Button>
              <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }}>
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
