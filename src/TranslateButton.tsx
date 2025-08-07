import React from "react";

interface TranslateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  className?: string;
}

const TranslateButton: React.FC<TranslateButtonProps> = ({
  onClick,
  isLoading,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold text-xl shadow-lg transition-all duration-200 hover:scale-105 hover:from-pink-500 hover:to-blue-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? "Translating..." : "Translate"}
    </button>
  );
};

export default TranslateButton;
