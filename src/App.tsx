import React, { useState } from "react";
import LanguageSelector from "./LanguageSelector";
import TextInput from "./TextInput";
import TranslateButton from "./TranslateButton";
import TranslationOutput from "./TranslationOutput";

const VoiceInput: React.FC<{ onResult: (text: string) => void }> = ({
  onResult,
}) => {
  const [listening, setListening] = useState(false);

  const handleVoiceInput = () => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = () => setListening(false);

    recognition.start();
  };

  return (
    <button
      type="button"
      onClick={handleVoiceInput}
      className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold shadow-md transition-all duration-200 hover:scale-105 hover:from-purple-500 hover:to-pink-400 focus:outline-none ${
        listening ? "ring-4 ring-pink-300" : ""
      }`}
      aria-pressed={listening}
      title="Voice Input"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-6 w-6 ${listening ? "animate-pulse" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18v3m0 0h3m-3 0H9m6-3a6 6 0 01-12 0V9a6 6 0 0112 0v6z"
        />
      </svg>
      {listening ? "Listening..." : "Voice Input"}
    </button>
  );
};

const App: React.FC = () => {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
    { code: "zh", label: "Chinese" },
    { code: "ja", label: "Japanese" },
    { code: "ru", label: "Russian" },
    { code: "ar", label: "Arabic" },
    { code: "hi", label: "Hindi" },
    { code: "pt", label: "Portuguese" },
    { code: "it", label: "Italian" },
    { code: "ko", label: "Korean" },
    { code: "nl", label: "Dutch" },
    { code: "sv", label: "Swedish" },
    { code: "no", label: "Norwegian" },
  ];

  const speakText = (text: string, lang: string) => {
    if ("speechSynthesis" in window && text) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setTranslatedText("Please enter text to translate.");
      return;
    }
    if (!sourceLanguage || !targetLanguage) {
      setTranslatedText("Please select both source and target languages.");
      return;
    }
    setIsLoading(true);
    try {
      setTranslatedText("");
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          inputText
        )}&langpair=${sourceLanguage}|${targetLanguage}`
      );
      const data = await response.json();
      const translated =
        data.responseData?.translatedText || "Translation failed";
      setTranslatedText(translated);
      setInputText("");

      speakText(translated, targetLanguage);
    } catch (error) {
      setTranslatedText("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center py-4 px-1 font-mono">
      <div
        className="
          w-full
          h-full
          max-w-full
          max-h-full
          md:max-w-[95vw]
          md:max-h-[90vh]
          xl:max-w-[1400px]
          xl:max-h-[900px]
          min-h-[96vh]
          min-w-[96vw]
          bg-white/90
          rounded-2xl
          shadow-2xl
          p-2
          sm:p-4
          md:p-8
          border border-purple-200
          flex flex-col
          justify-between
        "
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6 sm:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-md font-mono">
          Language Translator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 text-lg sm:text-xl">
          <LanguageSelector
            label="Source"
            selectedLanguage={sourceLanguage}
            onChange={setSourceLanguage}
            languages={languages}
          />
          <LanguageSelector
            label="Target"
            selectedLanguage={targetLanguage}
            onChange={setTargetLanguage}
            languages={languages}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6 text-lg sm:text-xl">
          <div className="flex-1">
            <TextInput
              value={inputText}
              onChange={setInputText}
              placeholder="Input your text here..."
              className="w-full rounded-xl border-2 border-purple-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition text-base sm:text-lg md:text-2xl p-3 sm:p-4 bg-white/80"
            />
          </div>
          <div className="flex items-center justify-center">
            <VoiceInput onResult={setInputText} />
          </div>
        </div>

        <div className="flex justify-center mb-6 sm:mb-8">
          <TranslateButton
            onClick={handleTranslate}
            isLoading={isLoading}
            className="px-6 sm:px-8 py-2 sm:py-3 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold text-lg sm:text-xl shadow-lg transition-all duration-200 hover:scale-105 hover:from-pink-500 hover:to-blue-500 focus:outline-none"
          />
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 sm:p-6 shadow-inner min-h-[90px] sm:min-h-[120px] md:min-h-[160px] transition-all duration-200 hover:shadow-lg">
          <TranslationOutput text={translatedText} />
        </div>
      </div>
    </div>
  );
};

export default App;
