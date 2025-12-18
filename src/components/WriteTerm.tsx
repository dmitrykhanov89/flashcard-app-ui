import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { useGetFlashcardById } from "../hooks/UseFlashcardFetch";

export const WriteTerm = () => {
    const { id } = useParams<{ id: string }>(); // Получаем ID набора из URL
    const navigate = useNavigate(); // Хук для навигации между страницами
    const { data, loading, error } = useGetFlashcardById(id || ""); // Получаем набор карточек по ID
    const cards = data?.cards || [];  // Массив карточек набора, если нет - пустой
    const [index, setIndex] = useState(0);  // Текущий индекс карточки
    const [userAnswer, setUserAnswer] = useState(""); // Ввод пользователя
    const [message, setMessage] = useState<"correct" | "incorrect" | null>(null); // Сообщение о правильности ответа
    const [completed, setCompleted] = useState(false); // Статус завершения теста
    const [errors, setErrors] = useState(0);  // Количество неправильных ответов
    const [hintCount, setHintCount] = useState(0); // Количество открытых букв подсказки
    const inputRef = useRef<HTMLInputElement>(null); // Реф для доступа к полю ввода и установки фокуса
    const currentCard = cards[index]; // Текущая карточка по индексу
    const currentTerm = currentCard?.term || ""; // Термин текущей карточки

    // Фокусировка на поле ввода
    const focusInput = () => {
        inputRef.current?.focus();
        const length = inputRef.current?.value.length || 0;
        inputRef.current?.setSelectionRange(length, length);
    };

    // Сброс поля ввода и подсказки при смене карточки
    useEffect(() => {
        setUserAnswer("");
        setHintCount(0);
        focusInput();
    }, [index]);

    // Проверка ответа
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

    // Подсказка: показывает следующую букву
    const handleHint = () => {
        if (hintCount < currentTerm.length) setHintCount(prev => prev + 1);
        focusInput();
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={4}>
            {!id && (<Typography color="error">ID набора не найден в URL</Typography>)}
            {loading && <Typography>Загрузка...</Typography>}
            {error && (<Typography color="error">{error.message}</Typography>)}
            {!loading && !error && !data && (<Typography>Набор не найден</Typography>)}
            {!loading && !error && data && cards.length === 0 && (<Typography>Карточки отсутствуют</Typography>)}
            {!loading && !error && data && cards.length > 0 && currentCard && (<>
            <Typography variant="h4">{data.name}</Typography>
            <Typography mt={1}>{index + 1} / {cards.length}</Typography>

            {/* Определение */}
            <Box mt={4} p={3} border="1px solid #ccc" borderRadius="8px">
                <Typography variant="h6">{currentCard.definition}</Typography>
            </Box>

            {/* Поле ввода и кнопки */}
            <Box mt={4} display="flex" flexDirection="column" alignItems="center" gap={2}>
                <TextField
                    label="Ваш ответ"
                    value={userAnswer}
                    inputRef={inputRef}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnswerSubmit()}
                    fullWidth
                />

                <Box display="flex" justifyContent="center" gap={2} width="100%">
                    <Button variant="contained" onClick={handleAnswerSubmit}>Проверить</Button>
                    <Button variant="contained" onClick={handleHint}>Подсказка</Button>
                </Box>

                {/* Подсказка ниже кнопок по центру */}
                {hintCount > 0 && (
                    <Box mt={1}>
                        <Typography color="green" fontWeight="bold">
                            {currentTerm.slice(0, hintCount)}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Сообщения */}
            {message === "correct" && <Typography mt={2} color="green">Правильный ответ!</Typography>}
            {message === "incorrect" && <Typography mt={2} color="red">Неверный ответ</Typography>}

            {/* Финальный popup */}
            <Dialog open={completed}>
                <DialogTitle>Поздравляем!</DialogTitle>
                <DialogContent>
                    <Typography>
                        Вы прошли тест!<br />
                        Ошибки: {errors}<br /><br />
                        Нажмите ниже, чтобы вернуться к набору карточек "{data.name}".
                    </Typography>
                    <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={() => navigate(`/flashcard-set/${id}`)}>
                        Вернуться
                    </Button>
                </DialogContent>
            </Dialog></>)}
        </Box>
    );
};
