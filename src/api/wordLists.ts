export type WordList = {
    id: number;
    name: string;
};
export const fetchWordLists = async (token: string): Promise<WordList[]> => {
    const res = await fetch('http://localhost:8080/api/word-lists', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        throw new Error(`Ошибка: ${res.status}`);
    }
    return res.json();
};
