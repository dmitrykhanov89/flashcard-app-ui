import { useEffect, useState } from 'react';
import { fetchWordLists, WordList } from '../api/wordLists';
import {useAuth} from "../hooks/UseAuth.ts";

export const HomePage = () => {
    const { logout } = useAuth();
    const [wordLists, setWordLists] = useState<WordList[]>([]);

    useEffect(() => {
        const loadWordLists = async () => {
            const token = localStorage.getItem('token') || '';
            const data = await fetchWordLists(token);
            setWordLists(data);
        };

        loadWordLists();
    }, []);

    return (
        <div>
            <h1>Добро пожаловать!</h1>
            <button onClick={logout}>Выйти</button>

            <h2>Ваши списки слов:</h2>
            <ul>
                {wordLists.map(list => (
                    <li key={list.id}>{list.name}</li>
                ))}
            </ul>
        </div>
    );
};
