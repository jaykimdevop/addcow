"use client";

import { useState, useEffect } from "react";
import { LuSettings } from "react-icons/lu";
import { motion } from "motion/react";
import { SettingSection } from "./SettingSection";

interface DockSettingsSectionProps {
  delay?: number;
}

export function DockSettingsSection({ delay = 0.05 }: DockSettingsSectionProps) {
  const [panelHeight, setPanelHeight] = useState(68);
  const [baseItemSize, setBaseItemSize] = useState(50);
  const [magnification, setMagnification] = useState(70);

  // localStorage에서 Dock 설정 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPanelHeight = localStorage.getItem("dock_panelHeight");
      const savedBaseItemSize = localStorage.getItem("dock_baseItemSize");
      const savedMagnification = localStorage.getItem("dock_magnification");

      if (savedPanelHeight) setPanelHeight(Number(savedPanelHeight));
      if (savedBaseItemSize) setBaseItemSize(Number(savedBaseItemSize));
      if (savedMagnification) setMagnification(Number(savedMagnification));
    }
  }, []);

  // Dock 설정 변경 시 localStorage에 저장 및 이벤트 발생
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dock_panelHeight", panelHeight.toString());
      localStorage.setItem("dock_baseItemSize", baseItemSize.toString());
      localStorage.setItem("dock_magnification", magnification.toString());

      // 커스텀 이벤트 발생하여 GlobalDock에 실시간 반영
      window.dispatchEvent(
        new CustomEvent("dockSettingsChange", {
          detail: {
            panelHeight,
            baseItemSize,
            magnification,
          },
        })
      );
    }
  }, [panelHeight, baseItemSize, magnification]);

  return (
    <SettingSection
      title="Dock 설정"
      description="Dock의 크기와 동작을 커스터마이즈하세요"
      icon={<LuSettings size={16} />}
      delay={delay}
    >
      <div className="space-y-4">
        {/* Background Height */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-white">
              Background Height
            </label>
            <span className="text-xs text-neutral-400">{panelHeight}</span>
          </div>
          <input
            type="range"
            min="50"
            max="200"
            value={panelHeight}
            onChange={(e) => setPanelHeight(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </motion.div>

        {/* Item Size */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.15 }}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-white">Item Size</label>
            <span className="text-xs text-neutral-400">{baseItemSize}</span>
          </div>
          <input
            type="range"
            min="30"
            max="80"
            value={baseItemSize}
            onChange={(e) => setBaseItemSize(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </motion.div>

        {/* Magnification */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-white">
              Magnification
            </label>
            <span className="text-xs text-neutral-400">{magnification}</span>
          </div>
          <input
            type="range"
            min="50"
            max="120"
            value={magnification}
            onChange={(e) => setMagnification(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </motion.div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
    </SettingSection>
  );
}
