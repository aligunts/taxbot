/**
 * Translation utilities for multi-language support
 */

export type SupportedLanguage = 'english' | 'pidgin' | 'yoruba' | 'hausa' | 'igbo';

// Translation dictionary for common UI phrases
export const translations: Record<string, Record<SupportedLanguage, string>> = {
  "Type your message...": {
    "english": "Type your message...",
    "pidgin": "Type your message...",
    "yoruba": "Te ifiránṣẹ rẹ...",
    "hausa": "Rubuta sakon ka...",
    "igbo": "Dee ozi gị..."
  },
  "Send": {
    "english": "Send",
    "pidgin": "Send",
    "yoruba": "Firanṣẹ",
    "hausa": "Aika",
    "igbo": "Zipu"
  },
  "Voice input": {
    "english": "Voice input",
    "pidgin": "Talk am",
    "yoruba": "Fi ohùn sí i",
    "hausa": "Shiga murya",
    "igbo": "Tinye olu"
  },
  "Calculating tax...": {
    "english": "Calculating tax...",
    "pidgin": "Dey calculate tax...",
    "yoruba": "Ń ṣe iṣirò orí...",
    "hausa": "Ƙididdiga haraji...",
    "igbo": "Na-agụta ụtụ isi..."
  },
  "Calculate": {
    "english": "Calculate",
    "pidgin": "Calculate",
    "yoruba": "Ṣiro",
    "hausa": "Ƙididdiga",
    "igbo": "Gụọ"
  },
  "Reset": {
    "english": "Reset",
    "pidgin": "Clear am",
    "yoruba": "Tún ṣe",
    "hausa": "Sake saiti",
    "igbo": "Tọgharia"
  },
  "Loading...": {
    "english": "Loading...",
    "pidgin": "Loading...",
    "yoruba": "Ń gbé...",
    "hausa": "Ana lodi...",
    "igbo": "Ọ na-ebu..."
  }
};

/**
 * Translates a given text to the selected language
 * @param text The text to translate
 * @param language The target language
 * @returns Translated text or original text if translation not found
 */
export const translate = (text: string, language: SupportedLanguage): string => {
  return translations[text]?.[language] || text;
};

/**
 * Creates a translation function for a specific language
 * @param language The target language
 * @returns A function that translates text to the specified language
 */
export const createTranslator = (language: SupportedLanguage) => {
  return (text: string): string => translate(text, language);
}; 