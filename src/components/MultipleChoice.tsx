import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { useGetFlashcardById } from "../hooks/UseFlashcardFetch";
import { useTranslation } from 'react-i18next';
import { CloseButton } from "./CloseButton.tsx";

type Mode = "definitionToTerm" | "termToDefinition";

export const MultipleChoice = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, loading, error } = useGetFlashcardById(id || "");
    const cards = useMemo(() => data?.cards || [], [data?.cards]);
    const [mode, setMode] = useState<Mode | null>(null);
    const [errors, setErrors] = useState(0);
    const [index, setIndex] = useState(0);
    const [message, setMessage] = useState<"correct" | "incorrect" | null>(null);
    const [completed, setCompleted] = useState(false);
    const [options, setOptions] = useState<string[]>([]);
    const currentCard = cards[index];

    useEffect(() => {
        if (!currentCard || !mode) return;

        const correctAnswer = mode === "definitionToTerm"
            ? currentCard.term
            : currentCard.definition;

        const wrong = cards
            .filter(c => mode === "definitionToTerm"
                ? c.term !== currentCard.term
                : c.definition !== currentCard.definition
            )
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const wrongMapped = wrong.map(c =>
            mode === "definitionToTerm" ? c.term : c.definition
        );

        setOptions([...wrongMapped, correctAnswer].sort(() => Math.random() - 0.5));
    }, [currentCard, cards, mode]);

    const handleAnswer = (answer: string) => {
        if (!currentCard || !mode) return;

        const correctAnswer = mode === "definitionToTerm"
            ? currentCard.term
            : currentCard.definition;

        if (answer === correctAnswer) {
            setMessage("correct");
            setTimeout(() => {
                setMessage(null);
                if (index + 1 < cards.length) {
                    setIndex(prev => prev + 1);
                } else {
                    setCompleted(true);
                }
            }, 1000);
        } else {
            setMessage("incorrect");
            setErrors(prev => prev + 1);
            setTimeout(() => setMessage(null), 1000);
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={4}>
            <CloseButton to={`/flashcard-set/${id}`} />
            {!id && <Typography color="error">{t('flashcardSet.idNotFound')}</Typography>}
            {loading && <Typography>{t('flashcardSet.loading')}</Typography>}
            {error && <Typography color="error">{error.message}</Typography>}
            {!loading && !error && !data && <Typography>{t('flashcardSet.notFound')}</Typography>}
            {!loading && !error && data && cards.length === 0 && <Typography>{t('flashcardSet.noCards')}</Typography>}

            {!loading && !error && data && cards.length > 0 && !mode && (
                <>
                    <Typography variant="h4" gutterBottom>{data.name}</Typography>
                    <Typography>{t('multipleChoice.selectMode')}</Typography>

                    <Box display="flex" flexDirection="column" gap={2} width="300px">
                        <Button variant="contained" color="inherit" onClick={() => setMode("termToDefinition")}>
                            {t('multipleChoice.termToDefinition')}
                        </Button>
                        <Button variant="contained" color="inherit" onClick={() => setMode("definitionToTerm")}>
                            {t('multipleChoice.definitionToTerm')}
                        </Button>
                    </Box>

                    <Button color="inherit" onClick={() => navigate(`/flashcard-set/${id}`)}>{t('multipleChoice.back')}</Button>
                </>
            )}

            {!loading && !error && data && cards.length > 0 && mode && currentCard && (
                <>
                    <Typography variant="h4">{data.name}</Typography>
                    <Typography>{index + 1} / {cards.length}</Typography>

                    <Box mt={4} p={3} border="1px solid #ccc" borderRadius="8px" display="flex" flexDirection="column"
                         justifyContent="space-between" alignItems="center" gap={2} width="700px" height="400px" margin="0 auto" bgcolor="white">
                        <Typography variant="h6" textAlign="center" sx={{ marginTop: "auto", marginBottom: "auto" }}>
                            {mode === "definitionToTerm" ? currentCard.definition : currentCard.term}
                        </Typography>

                        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} width="100%">
                            {options.map((opt, i) => (
                                <Button key={i} variant="contained" color="inherit" onClick={() => handleAnswer(opt)}>{opt}</Button>
                            ))}
                        </Box>
                    </Box>

                    {message === "correct" && <Typography mt={3} color="green">{t('multipleChoice.correct')}</Typography>}
                    {message === "incorrect" && <Typography mt={3} color="red">{t('multipleChoice.incorrect')}</Typography>}

                    <Dialog open={completed}>
                        <DialogTitle>{t('multipleChoice.completedTitle')}</DialogTitle>
                        <DialogContent>
                            <Typography>
                                {t('multipleChoice.completedMessage', { errors })}
                                <br /><br />
                                {t('multipleChoice.completedFooter', { name: data.name })}
                            </Typography>
                            <Button fullWidth variant="contained" color="inherit" sx={{ mt: 2 }} onClick={() =>
                                navigate(`/flashcard-set/${id}`)}>{t('multipleChoice.return')}
                            </Button>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </Box>
    );
};
