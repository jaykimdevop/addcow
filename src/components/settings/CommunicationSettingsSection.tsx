"use client";

import { useState, useRef, useEffect } from "react";
import { LuMessageSquare, LuVolume2, LuChevronDown } from "react-icons/lu";
import { motion, AnimatePresence } from "motion/react";
import { SettingSection } from "./SettingSection";

interface CommunicationSettingsSectionProps {
  delay?: number;
}

type CommunicationType = "text" | "audio";

export function CommunicationSettingsSection({
  delay = 0.2,
}: CommunicationSettingsSectionProps) {
  const [selectedType, setSelectedType] =
    useState<CommunicationType>("text");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    {
      type: "text" as CommunicationType,
      label: "텍스트",
      icon: LuMessageSquare,
    },
    {
      type: "audio" as CommunicationType,
      label: "오디오",
      icon: LuVolume2,
    },
  ];

  const selectedOption = options.find((opt) => opt.type === selectedType) || options[0];

  const handleSelect = (type: CommunicationType) => {
    setSelectedType(type);
    setIsOpen(false);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <SettingSection
      title="에이전트 설정"
      description="에이전트와의 소통 방식을 선택하세요"
      icon={<LuMessageSquare size={16} />}
      delay={delay}
    >
      <div className="relative" ref={dropdownRef}>
        {/* 드롭다운 버튼 */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors text-left"
        >
          <selectedOption.icon
            size={18}
            className="text-white"
          />
          <span className="text-sm font-medium text-white flex-1">
            {selectedOption.label}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <LuChevronDown size={16} className="text-neutral-400" />
          </motion.div>
        </motion.button>

        {/* 드롭다운 메뉴 */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#060010] border border-neutral-700 rounded-lg shadow-lg z-10 overflow-hidden"
            >
              {options.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedType === option.type;

                return (
                  <motion.button
                    key={option.type}
                    whileHover={{ backgroundColor: "rgba(55, 48, 163, 0.2)" }}
                    onClick={() => handleSelect(option.type)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left ${
                      isSelected
                        ? "bg-purple-900/20 text-white"
                        : "text-white hover:bg-neutral-800"
                    }`}
                  >
                    <Icon
                      size={18}
                      className="text-white"
                    />
                    <span className="text-sm font-medium flex-1">
                      {option.label}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SettingSection>
  );
}

