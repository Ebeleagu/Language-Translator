import React, { useState, useRef } from "react";
import LanguageSelector from "./LanguageSelector";
import TextInput from "./TextInput";
import TranslateButton from "./TranslateButton";
import TranslationOutput from "./TranslationOutput";

const ASSEMBLYAI_API_KEY = "48d77423ca20440793b7e33f7859c943";

const VoiceInput: React.FC<{ onResult: (text: string) => void }> = ({
  onResult,
}) => {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleVoiceInput = async () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      alert("Audio recording is not supported in this browser.");
      return;
    }

    if (!recording && !processing) {
      setRecording(true);
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setRecording(false);
        setProcessing(true); 
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const transcript = await transcribeWithAssemblyAI(audioBlob);
        setProcessing(false);
        if (transcript) onResult(transcript);
      };

      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach((track) => track.stop());
      }, 10000); 
    }
  };

  return (
    <button
      type="button"
      onClick={handleVoiceInput}
      disabled={recording || processing}
      className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold shadow-md transition-all duration-200 ${
        recording || processing
          ? "opacity-50 cursor-not-allowed"
          : "hover:scale-105 hover:from-purple-500 hover:to-pink-400"
      }`}
      aria-pressed={recording || processing}
      title="Voice Input"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-6 w-6 ${recording ? "animate-pulse" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="10" fill={recording ? "#f472b6" : "none"} />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18v3m0 0h3m-3 0H9"
        />
      </svg>
      {recording
        ? "Recording..."
        : processing
        ? "Processing..."
        : "Voice Input"}
    </button>
  );
};


async function transcribeWithAssemblyAI(
  audioBlob: Blob
): Promise<string | null> {

  const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: { authorization: ASSEMBLYAI_API_KEY },
    body: audioBlob,
  });
  const uploadData = await uploadRes.json();
  if (!uploadData.upload_url) return null;

  
  const transcriptRes = await fetch(
    "https://api.assemblyai.com/v2/transcript",
    {
      method: "POST",
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({ audio_url: uploadData.upload_url }),
    }
  );
  const transcriptData = await transcriptRes.json();
  const transcriptId = transcriptData.id;
  if (!transcriptId) return null;

  
  let transcriptText = null;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollingRes = await fetch(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      {
        headers: { authorization: ASSEMBLYAI_API_KEY },
      }
    );
    const pollingData = await pollingRes.json();
    if (pollingData.status === "completed") {
      transcriptText = pollingData.text;
      break;
    }
    if (pollingData.status === "failed") break;
  }
  return transcriptText;
}

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
    <div className="min-h-screen min-w-screen w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center py-2 px-1 font-mono text-base">
      <div
        className="
          w-full
          h-full
          max-w-screen-sm
          md:max-w-[95vw]
          xl:max-w-[1400px]
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
          overflow-auto
        "
      >
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-center mb-4 sm:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-md font-mono">
          Language Translator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8 text-base sm:text-xl">
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

        <div className="flex flex-col md:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6 text-base sm:text-xl">
          <div className="flex-1">
            <TextInput
              value={inputText}
              onChange={setInputText}
              placeholder="Input your text here..."
              className="w-full rounded-xl border-2 border-purple-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition text-base sm:text-lg md:text-2xl p-2 sm:p-4 bg-white/80"
            />
          </div>
          <div className="flex items-center justify-center mt-2 md:mt-0">
            <VoiceInput onResult={setInputText} />
          </div>
        </div>

        <div className="flex justify-center mb-4 sm:mb-8">
          <TranslateButton
            onClick={handleTranslate}
            isLoading={isLoading}
            className="px-4 sm:px-8 py-2 sm:py-3 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold text-base sm:text-xl shadow-lg transition-all duration-200 hover:scale-105 hover:from-pink-500 hover:to-blue-500 focus:outline-none"
          />
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 sm:p-6 shadow-inner min-h-[70px] sm:min-h-[120px] md:min-h-[160px] transition-all duration-200 hover:shadow-lg">
          <TranslationOutput text={translatedText} />
        </div>
      </div>
    </div>
  );
};

export default App;
