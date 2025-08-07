import React from "react";

const TranslationOutput: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold text-purple-700 mb-1">
        Translation:
      </h3>
      <div className="min-h-[80px] p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl shadow-inner text-gray-800 text-lg transition-all duration-200">
        {text}
      </div>
    </div>
  );
};

export default TranslationOutput;
