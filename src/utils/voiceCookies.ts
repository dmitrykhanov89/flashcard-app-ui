import Cookies from 'js-cookie';

const termKey = (id: string | number) => `term_voice_${id}`;
const defKey  = (id: string | number) => `def_voice_${id}`;

export const getTermVoice = (id: string | number): boolean =>
    Cookies.get(termKey(id)) === 'true';

export const getDefVoice = (id: string | number): boolean =>
    Cookies.get(defKey(id)) === 'true';

export const setTermVoice = (id: string | number, value: boolean) =>
    Cookies.set(termKey(id), String(value), { expires: 365 });

export const setDefVoice = (id: string | number, value: boolean) =>
    Cookies.set(defKey(id), String(value), { expires: 365 });
