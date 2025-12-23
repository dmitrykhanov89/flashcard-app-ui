import { franc } from 'franc';

const LANG_MAP: Record<string, string> = {
    eng: 'en-US',
    rus: 'ru-RU',
    fra: 'fr-FR',
    deu: 'de-DE',
};

const hasCyrillic = (text: string): boolean =>
    /[а-яё]/i.test(text);

const hasFrenchChars = (text: string): boolean =>
    /[àâæçéèêëîïôœùûüÿ]/i.test(text);

const hasGermanChars = (text: string): boolean =>
    /[äöüß]/i.test(text);

export const speakText = (text: string) => {
    if (!text) return;

    let lang: string;

    // 🇷🇺 Русский — приоритет
    if (hasCyrillic(text)) {
        lang = 'ru-RU';
    }
    // 🇫🇷 Французский — диакритика
    else if (hasFrenchChars(text)) {
        lang = 'fr-FR';
    }
    // 🇩🇪 Немецкий — умлауты
    else if (hasGermanChars(text)) {
        lang = 'de-DE';
    }
    // 🌍 fallback через franc
    else {
        const langCode = franc(text);
        lang = LANG_MAP[langCode] ?? 'en-US';
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
};
