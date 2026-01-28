import { useGetLastSeenFlashcardSet } from "../hooks/UseFlashcardFetch";
import { FlashcardSetSelectCard } from "./FlashcardSetSelectCard.tsx";
import { useTranslation } from 'react-i18next';
import { Box, Typography } from "@mui/material";
import flashcardImage from "../assets/flashcard.png";

/**
 * Компонент главной страницы.
 *
 * Отображает недавно просмотренные наборы карточек.
 * Позволяет перейти к созданию нового набора.
 */
export const Home = () => {
    const { t } = useTranslation();
    const { data, loading } = useGetLastSeenFlashcardSet();

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {t('home.recent')}
            </Typography>

            {loading && <Typography>{t('home.loading')}</Typography>}

            {!loading && (!data || data.length === 0) && (
                <Typography>{t('home.noRecentSets')}</Typography>
            )}

            {!loading && data && (
                <Box display="flex" gap={2} flexWrap="wrap">
                    {data.map(set => (
                        <FlashcardSetSelectCard
                            key={set.flashcardSetId}
                            id={set.flashcardSetId}
                            name={set.flashcardSetName}
                            cardsCount={set.cardsCount}
                            ownerName={set.ownerName}
                            imageUrl={flashcardImage}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};
