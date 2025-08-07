import React from "react";

interface TextInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  className?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder,
  className = "",
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-semibold text-purple-700 text-base mb-1">
        Enter Text:
      </label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`rounded-xl border-2 border-purple-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition text-lg p-3 bg-white/80 resize-none shadow-sm hover:border-pink-400 ${className}`}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export default TextInput;
