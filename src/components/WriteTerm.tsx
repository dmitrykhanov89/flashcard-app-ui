import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { useGetFlashcardById } from "../hooks/UseFlashcardFetch";
import { useTranslation } from "react-i18next";
import {CloseButton} from "./CloseButton.tsx";

export const WriteTerm = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, loading, error } = useGetFlashcardById(id || "");
    const cards = data?.cards || [];
    const [index, setIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [message, setMessage] = useState<"correct" | "incorrect" | null>(null);
    const [completed, setCompleted] = useState(false);
    const [errors, setErrors] = useState(0);
    const [hintCount, setHintCount] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const currentCard = cards[index];
    const currentTerm = currentCard?.term || "";

    const focusInput = () => {
        inputRef.current?.focus();
        const length = inputRef.current?.value.length || 0;
        inputRef.current?.setSelectionRange(length, length);
    };

    useEffect(() => {
        setUserAnswer("");
        setHintCount(0);
        focusInput();
    }, [index, currentCard]);

    const handleAnswerSubmit = () => {
        if (!currentCard) return;

        if (userAnswer.trim().toLowerCase() === currentTerm.toLowerCase()) {
            setMessage("correct");
            setTimeout(() => {
                setMessage(null);
                if (index + 1 < cards.length) setIndex(prev => prev + 1);
                else setCompleted(true);
            }, 1000);
        } else {
            setMessage("incorrect");
            setErrors(prev => prev + 1);
            setTimeout(() => setMessage(null), 1000);
        }
        focusInput();
    };

    const handleHint = () => {
        if (hintCount < currentTerm.length) setHintCount(prev => prev + 1);
        focusInput();
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={4}>
            <CloseButton to={`/flashcard-set/${id}`} />
            {!id && <Typography color="error">{t('written.idNotFound')}</Typography>}
            {loading && <Typography>{t('written.loading')}</Typography>}
            {error && <Typography color="error">{error.message}</Typography>}
            {!loading && !error && !data && <Typography>{t('written.notFound')}</Typography>}
            {!loading && !error && data && cards.length === 0 && <Typography>{t('written.noCards')}</Typography>}

            {!loading && !error && data && cards.length > 0 && currentCard && (
                <>
                    <Typography variant="h4">{data.name}</Typography>
                    <Typography mt={1}>{index + 1} / {cards.length}</Typography>

                    <Box mt={4} p={3} border="1px solid #ccc" borderRadius="8px" display="flex" flexDirection="column"
                         justifyContent="center" alignItems="center" gap={2} width="700px" height="400px" margin="0 auto" bgcolor="white">
                        <Typography variant="h6">{currentCard.definition}</Typography>
                    </Box>

                    <Box mt={4} display="flex" flexDirection="column" alignItems="center" gap={2}>
                        <TextField
                            label={t('written.yourAnswer')}
                            value={userAnswer}
                            inputRef={inputRef}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAnswerSubmit()}
                            fullWidth
                            variant="outlined"
                            sx={{color: 'inherit', '& .MuiOutlinedInput-root': {
                                    color: 'inherit', '& fieldset': {
                                        borderColor: 'currentColor',
                                    }, '&.Mui-focused fieldset': {borderColor: 'currentColor',},
                                },
                                '& .MuiInputLabel-root': {color: 'inherit',},
                            }}
                        />

                        <Box display="flex" justifyContent="center" gap={2} width="100%">
                            <Button variant="contained" color="inherit" onClick={handleAnswerSubmit}>{t('written.check')}</Button>
                            <Button variant="contained" color="inherit" onClick={handleHint}>{t('written.hint')}</Button>
                        </Box>

                        {hintCount > 0 && (
                            <Box mt={1}>
                                <Typography color="inherit" fontWeight="bold">
                                    {currentTerm.slice(0, hintCount)}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {message === "correct" && <Typography mt={2} color="green">{t('written.correct')}</Typography>}
                    {message === "incorrect" && <Typography mt={2} color="red">{t('written.incorrect')}</Typography>}

                    <Dialog open={completed}>
                        <DialogTitle>{t('written.completedTitle')}</DialogTitle>
                        <DialogContent>
                            <Typography>
                                {t('written.completedMessage', { errors })}<br /><br />
                                {t('written.completedFooter', { name: data.name })}
                            </Typography>
                            <Button fullWidth variant="contained" color="inherit" sx={{ mt: 2 }} onClick={() =>
                                navigate(`/flashcard-set/${id}`)}>{t('written.return')}
                            </Button>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </Box>
    );
};
