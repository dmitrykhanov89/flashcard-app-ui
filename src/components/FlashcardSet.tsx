import {useParams, useNavigate} from 'react-router-dom';
import {useState, useCallback, useEffect} from 'react';
import {useGetFlashcardById} from "../hooks/UseFlashcardFetch.ts";
import {CardFlipper} from "./CardFlipper";
import {Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import {KeyboardButtons} from "../Constants/KeyboardButtons.ts";
import {deleteFlashcardSet} from "../api/flashcardSet.ts";
import {speakText} from "../services/textToSpeech";
import {getFromCookie, saveToCookie} from "../utils/cookies.ts";
import { useTranslation } from 'react-i18next';
import {CloseButton} from "./CloseButton.tsx";

export const FlashcardSet = () => {
    const { t } = useTranslation();
    const {id} = useParams<{ id: string }>();
    const {data, loading, error} = useGetFlashcardById(id || '');
    const navigate = useNavigate();
    const [isTerm, setIsTerm] = useState(true);
    useEffect(() => {
        if (!id) return;
        const savedSide = getFromCookie<boolean>('card_side', id);
        setIsTerm(savedSide ?? true);
    }, [id]);
    const [flipped, setFlipped] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const cardsLength = data?.cards?.length || 0;
    const currentCard = data?.cards?.[currentIndex];
    const toggleCardSide = () => {
        if (!id) return;
        const next = !isTerm;
        setIsTerm(next);
        saveToCookie('card_side', id, next);
    };

    const goNext = useCallback(() => {
        if (!cardsLength || animating) return;

        setFlipped(false);
        setAnimating(true);
        setSlideDirection('next');

        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cardsLength);
            setSlideDirection('prev');

            setTimeout(() => {
                setSlideDirection(null);
                setAnimating(false);
            }, 200);
        }, 150);
    }, [cardsLength, animating]);

    const goPrev = useCallback(() => {
        if (!cardsLength || animating) return;

        setFlipped(false);
        setAnimating(true);
        setSlideDirection('prev');

        setTimeout(() => {
            setCurrentIndex((prev) =>
                prev === 0 ? cardsLength - 1 : prev - 1
            );
            setSlideDirection('next');

            setTimeout(() => {
                setSlideDirection(null);
                setAnimating(false);
            }, 200);
        }, 150);
    }, [cardsLength, animating]);

    const toggleFlip = useCallback(() => setFlipped((prev) => !prev), []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === KeyboardButtons.ARROW_RIGHT ||
                e.key === KeyboardButtons.ARROW_LEFT ||
                e.key === KeyboardButtons.SPACE ||
                e.key === KeyboardButtons.ARROW_UP
            ) e.preventDefault();

            if (e.key === KeyboardButtons.ARROW_RIGHT) goNext();
            else if (e.key === KeyboardButtons.ARROW_LEFT) goPrev();
            else if (e.key === KeyboardButtons.SPACE || e.key === KeyboardButtons.ARROW_UP) toggleFlip();
        };

        window.addEventListener("keydown", handleKeyDown, {passive: false});
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [goNext, goPrev, toggleFlip]);

    useEffect(() => {
        if (!currentCard || !id) return;
        const termVoice = getFromCookie<boolean>('term_voice', id) ?? false;
        const defVoice  = getFromCookie<boolean>('def_voice', id) ?? false;

        if (termVoice && isTerm !== flipped) {
            speakText(currentCard.term);
        }
        if (defVoice && isTerm === flipped) {
            speakText(currentCard.definition);
        }
    }, [currentCard, flipped, id, isTerm]);

    const handleDelete = async () => {
        if (!id) return;
        try {
            await deleteFlashcardSet(id);
            navigate('/');
        } catch {
            alert(t('flashcardSet.deleteError'));
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CloseButton to={`/`} />
            {!id && <Typography color="error">{t('flashcardSet.idNotFound')}</Typography>}
            {loading && <Typography>{t('flashcardSet.loading')}</Typography>}
            {error && <Typography color="error">{error.message}</Typography>}
            {!loading && !error && !data && <Typography>{t('flashcardSet.notFound')}</Typography>}
            {!loading && !error && data && cardsLength === 0 && <Typography>{t('flashcardSet.noCards')}</Typography>}

            {!loading && !error && data && cardsLength > 0 && currentCard && (
                <>
                    <Typography variant="h4" gutterBottom>{data.name}</Typography>
                    <Typography>{currentIndex + 1} / {cardsLength}</Typography>

                    <Box display="flex" gap={2} mt={2}>
                        <Button variant="contained" color="inherit" onClick={() => navigate(`/flashcard-set/${id}/written`)}>{t('flashcardSet.written')}</Button>
                        <Button variant="contained" color="inherit" onClick={() => navigate(`/flashcard-set/${id}/multipleChoice`)}>{t('flashcardSet.multipleChoice')}</Button>
                        <Button variant="contained" color="inherit" onClick={() =>
                            navigate(`/flashcard-set/${id}/edit`, { state: { data } })}>{t('flashcardSet.edit')}</Button>
                        <Button variant="contained" color="inherit" onClick={() => setDeleteDialogOpen(true)}>{t('flashcardSet.delete')}</Button>
                    </Box>

                    <Box>
                        <CardFlipper
                            first={isTerm ? currentCard.term : currentCard.definition}
                            second={isTerm ? currentCard.definition : currentCard.term}
                            flipped={flipped}
                            onFlip={toggleFlip}
                            slideDirection={
                                slideDirection && flipped
                                    ? slideDirection === 'next' ? 'prev' : 'next'
                                    : slideDirection
                            }
                        />
                    </Box>
                    <Box display="flex" gap={2} mt={2}>
                        <Button variant="contained" color="inherit" onClick={goPrev}>⇐ {t('flashcardSet.prev')}</Button>
                        <Button variant="contained" color="inherit" onClick={goNext}>{t('flashcardSet.next')} ⇒</Button>
                        <Button variant="contained" color="inherit" onClick={toggleCardSide}>{isTerm ? t('flashcardSet.toDef') : t('flashcardSet.toTerm')}</Button>
                        <Button variant="contained" color="inherit" onClick={() =>speakText(flipped
                            ? (isTerm ? currentCard.definition : currentCard.term)
                            : (isTerm ? currentCard.term : currentCard.definition))}>{t('flashcardSet.voice')} 🔈</Button>
                    </Box>

                    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                        <DialogTitle>{t('flashcardSet.deleteConfirmTitle')}</DialogTitle>
                        <DialogContent>
                            {t('flashcardSet.deleteConfirm', { name: data.name })}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDelete} color="inherit" disabled={isDeleting}>
                                {isDeleting ? t('flashcardSet.deleting') : t('flashcardSet.yes')}
                            </Button>
                            <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" disabled={isDeleting}>{t('flashcardSet.no')}</Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </Box>
    );
};
