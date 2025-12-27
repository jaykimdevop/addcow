"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { LuMonitor } from "react-icons/lu";
import { AdminSection } from "./AdminSection";

interface DockSettingsSectionProps {
  delay?: number;
}

export function DockSettingsSection({
  delay = 0.05,
}: DockSettingsSectionProps) {
  const [panelHeight, setPanelHeight] = useState(68);
  const [baseItemSize, setBaseItemSize] = useState(50);
  const [magnification, setMagnification] = useState(70);
  const [backgroundColor, setBackgroundColor] = useState("#060010");
  const [backgroundOpacity, setBackgroundOpacity] = useState(100);

  // localStorage에서 Dock 설정 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPanelHeight = localStorage.getItem("dock_panelHeight");
      const savedBaseItemSize = localStorage.getItem("dock_baseItemSize");
      const savedMagnification = localStorage.getItem("dock_magnification");
      const savedBackgroundColor = localStorage.getItem("dock_backgroundColor");
      const savedBackgroundOpacity = localStorage.getItem("dock_backgroundOpacity");

      if (savedPanelHeight) setPanelHeight(Number(savedPanelHeight));
      if (savedBaseItemSize) setBaseItemSize(Number(savedBaseItemSize));
      if (savedMagnification) setMagnification(Number(savedMagnification));
      if (savedBackgroundColor) setBackgroundColor(savedBackgroundColor);
      if (savedBackgroundOpacity) setBackgroundOpacity(Number(savedBackgroundOpacity));
    }
  }, []);

  // Dock 설정 변경 시 localStorage에 저장 및 이벤트 발생
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dock_panelHeight", panelHeight.toString());
      localStorage.setItem("dock_baseItemSize", baseItemSize.toString());
      localStorage.setItem("dock_magnification", magnification.toString());
      localStorage.setItem("dock_backgroundColor", backgroundColor);
      localStorage.setItem("dock_backgroundOpacity", backgroundOpacity.toString());

      // 커스텀 이벤트 발생하여 GlobalDock에 실시간 반영
      window.dispatchEvent(
        new CustomEvent("dockSettingsChange", {
          detail: {
            panelHeight,
            baseItemSize,
            magnification,
            backgroundColor,
            backgroundOpacity,
          },
        }),
      );
    }
  }, [panelHeight, baseItemSize, magnification, backgroundColor, backgroundOpacity]);

  return (
    <AdminSection
      title="Dock 설정"
      description="Dock의 크기와 배경을 커스터마이즈하세요 (PC 전용)"
      icon={<LuMonitor size={14} />}
      delay={delay}
    >
      <div className="space-y-3 lg:block hidden">
        {/* Size Settings */}
        <div className="space-y-2.5">
          {/* Panel Height */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-white">
                Panel Height
              </label>
              <span className="text-xs text-neutral-400">{panelHeight}px</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              value={panelHeight}
              onChange={(e) => setPanelHeight(Number(e.target.value))}
              className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Item Size */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-white">Item Size</label>
              <span className="text-xs text-neutral-400">{baseItemSize}px</span>
            </div>
            <input
              type="range"
              min="30"
              max="80"
              value={baseItemSize}
              onChange={(e) => setBaseItemSize(Number(e.target.value))}
              className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Magnification */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-white">
                Magnification
              </label>
              <span className="text-xs text-neutral-400">{magnification}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="120"
              value={magnification}
              onChange={(e) => setMagnification(Number(e.target.value))}
              className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        {/* Background Settings */}
        <div className="pt-2 border-t border-neutral-700 space-y-2.5">
          <div className="mb-1">
            <label className="text-xs font-medium text-white">
              Background
            </label>
          </div>
          
          {/* Background Color & Opacity */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-400 whitespace-nowrap">
                Color:
              </label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border border-neutral-700"
              />
              <span className="text-xs text-neutral-400 font-mono">
                {backgroundColor}
              </span>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <label className="text-xs text-neutral-400 whitespace-nowrap">
                Opacity:
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={backgroundOpacity}
                onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
                className="flex-1 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-neutral-400 w-8 text-right">
                {backgroundOpacity}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Notice */}
      <div className="lg:hidden block">
        <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-700">
          <p className="text-xs text-neutral-400">
            Dock 설정은 PC에서만 가능합니다.
          </p>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
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
    </AdminSection>
  );
}

