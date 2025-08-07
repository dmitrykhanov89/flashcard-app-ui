import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {fetchFlashcardSetsByOwner} from '../api/flashcardSet';
import {useAuth} from '../hooks/UseAuth';
import type {flashcardSet} from '../types/flashcardSetTypes';

/**
 * Компонент страницы с наборами карточек текущего пользователя.
 *
 * Загружает и отображает список наборов, принадлежащих пользователю.
 */
export const Library = () => {
    const { token, user } = useAuth();
    const [sets, setSets] = useState<flashcardSet[]>([]);

    useEffect(() => {
        if (!token || !user) return; // ждем, пока user и token загрузятся
        fetchFlashcardSetsByOwner(token, user.id).then(setSets).catch(console.error);
    }, [token, user]);

    return (
        <div>
            <h2>Мои наборы</h2>
            <ul>
                {sets.map(set => (
                    <li key={set.id}>
                        <Link to={`/flashcard-set/${set.id}`}>{set.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};
