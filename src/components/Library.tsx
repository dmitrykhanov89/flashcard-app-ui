import { useAuth } from '../hooks/UseAuth';
import { useGetFlashcardSetsByUserId } from "../hooks/UseFlashcardFetch";
import { FlashcardSetSelectCard } from "./FlashcardSetSelectCard.tsx";
import type { FlashcardSet } from "../types/flashcardSetTypes";
import { useTranslation } from 'react-i18next';
import { CloseButton } from "./CloseButton.tsx";
import { Box, Typography } from "@mui/material";
import flashcardImage from "../assets/flashcard.png";

/**
 * Компонент страницы с наборами карточек текущего пользователя.
 *
 * Загружает и отображает список наборов, принадлежащих пользователю.
 */
export const Library = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { data, loading } = useGetFlashcardSetsByUserId(user?.id);

    return (
        <Box>
            <CloseButton to={`/`} />

            <Typography variant="h4" gutterBottom>
                {t('library.mySets')}
            </Typography>

            {loading && <Typography>{t('library.loading')}</Typography>}

            {!loading && (!data || data.length === 0) && (
                <Typography>{t('library.noSets')}</Typography>
            )}

            {!loading && data && (
                <Box display="flex" gap={2} flexWrap="wrap">
                    {data
                        .filter(
                            (set): set is FlashcardSet & { id: number } =>
                                set.id !== undefined
                        )
                        .map(set => (
                            <FlashcardSetSelectCard
                                key={set.id}
                                id={set.id}
                                name={set.name}
                                cardsCount={set.cards.length}
                                ownerName={set.ownerName}
                                imageUrl={flashcardImage}
                            />
                        ))}
                </Box>
            )}
        </Box>
    );
};
