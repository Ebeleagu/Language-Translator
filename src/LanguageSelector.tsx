import React from "react";

const LanguageSelector: React.FC<{
  label: string;
  selectedLanguage: string;
  onChange: (lang: string) => void;
  languages: { code: string; label: string }[];
}> = ({ label, selectedLanguage, onChange, languages }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-semibold text-purple-700 text-lg mb-1">
        {label}:
      </label>
      <select
        value={selectedLanguage}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border-2 border-purple-300 bg-white px-4 py-2 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition hover:border-pink-400"
      >
        <option value="" disabled>
          Select language
        </option>
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
