"use client";

import { AnimatePresence, motion } from "motion/react";
import { VscClose } from "react-icons/vsc";

interface DockSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  panelHeight: number;
  baseItemSize: number;
  magnification: number;
  onPanelHeightChange: (value: number) => void;
  onBaseItemSizeChange: (value: number) => void;
  onMagnificationChange: (value: number) => void;
}

export function DockSettings({
  isOpen,
  onClose,
  panelHeight,
  baseItemSize,
  magnification,
  onPanelHeightChange,
  onBaseItemSizeChange,
  onMagnificationChange,
}: DockSettingsProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] pointer-events-auto"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#060010] border border-neutral-700 rounded-2xl shadow-2xl z-[101] pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-700">
              <h2 className="text-xl font-semibold text-white">Dock 설정</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <VscClose size={20} className="text-neutral-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Background Height */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-white">
                    Background Height
                  </label>
                  <span className="text-sm text-neutral-400">
                    {panelHeight}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={panelHeight}
                  onChange={(e) => onPanelHeightChange(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Item Size */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-white">
                    Item Size
                  </label>
                  <span className="text-sm text-neutral-400">
                    {baseItemSize}
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={baseItemSize}
                  onChange={(e) => onBaseItemSizeChange(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Magnification */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-white">
                    Magnification
                  </label>
                  <span className="text-sm text-neutral-400">
                    {magnification}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="120"
                  value={magnification}
                  onChange={(e) =>
                    onMagnificationChange(Number(e.target.value))
                  }
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-neutral-700">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                완료
              </button>
            </div>
          </motion.div>

          <style jsx>{`
            .slider::-webkit-slider-thumb {
              appearance: none;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #9333ea;
              cursor: pointer;
            }
            .slider::-moz-range-thumb {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #9333ea;
              cursor: pointer;
              border: none;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
