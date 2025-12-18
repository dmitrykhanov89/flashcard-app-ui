import {useParams, useNavigate} from 'react-router-dom';
import {useState, useCallback, useEffect} from 'react';
import {useGetFlashcardById} from "../hooks/UseFlashcardFetch.ts";
import {CardFlipper} from "./CardFlipper";
import {Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import {KeyboardButtons} from "../Constants/KeyboardButtons.ts";
import {deleteFlashcardSet} from "../api/flashcardSet.ts";

export const FlashcardSet = () => {
    const {id} = useParams<{ id: string }>();
    const {data, loading, error} = useGetFlashcardById(id || '');
    const navigate = useNavigate();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting] = useState(false);

    const cardsLength = data?.cards?.length || 0;
    const currentCard = data?.cards?.[currentIndex];

    const goNext = useCallback(() => {
        if (!cardsLength) return;
        setFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % cardsLength);
    }, [cardsLength]);

    const goPrev = useCallback(() => {
        if (!cardsLength) return;
        setFlipped(false);
        setCurrentIndex((prev) => (prev === 0 ? cardsLength - 1 : prev - 1));
    }, [cardsLength]);

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

    const speakCard = (term: string, definition: string, flipped: boolean) => {
        const text = flipped ? definition : term;
        const lang = flipped ? "ru-RU" : "en-US";

        if (!text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            await deleteFlashcardSet(id);
            navigate('/');
        } catch {
            alert('Не удалось удалить набор');
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={4}>
            {!id && <Typography color="error">ID набора не найден в URL</Typography>}
            {loading && <Typography>Загрузка...</Typography>}
            {error && <Typography color="error">{error.message}</Typography>}
            {!loading && !error && !data && <Typography>Набор не найден</Typography>}
            {!loading && !error && data && cardsLength === 0 && <Typography>Карточки отсутствуют</Typography>}

            {!loading && !error && data && cardsLength > 0 && currentCard && (
                <>
                    <Typography variant="h4" gutterBottom>{data.name}</Typography>
                    <Typography>{currentIndex + 1} / {cardsLength}</Typography>

                    <Box display="flex" gap={2} mt={2}>
                        <Button variant="outlined" onClick={() => navigate(`/flashcard-set/${id}/written`)}>Written</Button>
                        <Button variant="outlined" onClick={() => navigate(`/flashcard-set/${id}/learn`)}>Multiple Choice</Button>
                        <Button variant="contained" color="primary" onClick={() =>
                            navigate(`/flashcard-set/${id}/edit`, { state: { data } })}>Edit</Button>
                        <Button variant="contained" color="error" onClick={() => setDeleteDialogOpen(true)}>Delete</Button>
                    </Box>

                    <Box>
                        <CardFlipper
                            term={currentCard.term}
                            definition={currentCard.definition}
                            flipped={flipped}
                            onFlip={toggleFlip}
                        />
                    </Box>

                    <Box display="flex" gap={2} mt={2}>
                        <Button variant="outlined" onClick={goPrev}>Предыдущая</Button>
                        <Button variant="outlined" onClick={goNext}>Следующая</Button>
                        <Button variant="contained" color="secondary" onClick={() =>
                            speakCard(currentCard.term, currentCard.definition, flipped)}>🔊 Слушать</Button>
                    </Box>

                    {/* Диалог подтверждения удаления */}
                    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                        <DialogTitle>Подтверждение удаления</DialogTitle>
                        <DialogContent>
                            Вы действительно хотите удалить набор карточек "{data.name}"?
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDelete} color="error" disabled={isDeleting}>
                                {isDeleting ? 'Удаление...' : 'Да'}
                            </Button>
                            <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Нет</Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </Box>
    );
};
