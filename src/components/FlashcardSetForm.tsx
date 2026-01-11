import {useEffect, useState} from 'react';
import {useAuth} from '../hooks/UseAuth';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {Box, Button, Container, IconButton, TextField, Typography, Switch, FormControlLabel} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type {Card, FlashcardSet} from '../types/flashcardSetTypes';
import {createFlashcardSet, updateFlashcardSet} from "../api/flashcardSet.ts";
import {getFromCookie, saveToCookie} from "../utils/cookies.ts";
import { useTranslation } from 'react-i18next';
import {CloseButton} from "./CloseButton.tsx";

export const FlashcardSetForm = () => {
    const {t} = useTranslation();
    const {user} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const propData = location.state?.data;
    const isEditMode = !!propData;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { id: setId } = useParams<{ id: string }>();
    const [termVoice, setTermVoiceState] = useState(false);
    const [defVoice, setDefVoiceState] = useState(false);
    const [flashcardSet, setFlashcardSet] = useState<FlashcardSet>(() => {
        if (propData) {
            return {
                id: propData.id,
                name: propData.name,
                description: propData.description,
                cards: propData.cards?.map((c: Card) => ({
                    term: c.term,
                    definition: c.definition
                })) || [],
                userId: propData.userId || user?.id
            };
        }
        return {
            name: '',
            description: '',
            cards: [
                {term: '', definition: ''},
                {term: '', definition: ''},
            ],
            userId: user?.id
        };
    });

    useEffect(() => {
        const idToUse = setId ?? flashcardSet.id;
        if (!idToUse) return;
        setTermVoiceState(getFromCookie<boolean>('term_voice', String(idToUse)) ?? false);
        setDefVoiceState(getFromCookie<boolean>('def_voice', String(idToUse)) ?? false);
    }, [setId, flashcardSet.id]);

    const closeTo = isEditMode && flashcardSet.id
        ? `/flashcard-set/${flashcardSet.id}`
        : '/';

    const handleCardChange = (index: number, field: keyof Card, value: string) => {
        const newCards = [...flashcardSet.cards];
        newCards[index][field] = value;
        setFlashcardSet({...flashcardSet, cards: newCards});
    };

    const addCard = () => {
        setFlashcardSet({...flashcardSet, cards: [...flashcardSet.cards, {term: '', definition: ''}]});
    };

    const deleteCard = (index: number) => {
        setFlashcardSet({...flashcardSet, cards: flashcardSet.cards.filter((_, i) => i !== index)});
    };

    const handleFileImport = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result as string;
            const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
            const importedCards = lines.map(line => {
                const separator =
                    line.includes("-") ? "-" :
                        line.includes(",") ? "," :
                            line.includes(";") ? ";" : null;
                if (!separator) return null;
                const [term, definition] = line.split(separator).map(s => s.trim());
                if (!term || !definition) return null;
                return {term, definition};
            }).filter(Boolean) as Card[];
            setFlashcardSet(prev => ({...prev, cards: [...prev.cards, ...importedCards]}));
        };
        reader.readAsText(file);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!user?.id) {
            setError(t('flashcardSetForm.notAuthorized'));
            return;
        }

        if (!flashcardSet.name || !flashcardSet.description || !flashcardSet.cards.every(card => card.term && card.definition)) {
            setError(t('flashcardSetForm.fillAllFields'));
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditMode && flashcardSet.id) {
                await updateFlashcardSet(flashcardSet);
                saveToCookie('term_voice', String(flashcardSet.id), termVoice);
                saveToCookie('def_voice', String(flashcardSet.id), defVoice);
                navigate(`/flashcard-set/${flashcardSet.id}`);
            } else {
                const createdSet = await createFlashcardSet(flashcardSet);
                saveToCookie('term_voice', String(createdSet.id!), termVoice);
                saveToCookie('def_voice', String(createdSet.id!), defVoice);
                navigate('/');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('flashcardSetForm.fillAllFields'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <CloseButton to={closeTo} />
            <Typography variant="h4" gutterBottom>
                {isEditMode ? t('flashcardSetForm.editTitle') : t('flashcardSetForm.createTitle')}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                {error && <Typography color="error" sx={{mb: 2}}>{error}</Typography>}
                <TextField
                    label={t('flashcardSetForm.name')}
                    value={flashcardSet.name}
                    onChange={e => setFlashcardSet({...flashcardSet, name: e.target.value})}
                    fullWidth
                    required
                    margin="normal"
                />
                <TextField
                    label={t('flashcardSetForm.description')}
                    value={flashcardSet.description}
                    onChange={e => setFlashcardSet({...flashcardSet, description: e.target.value})}
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                />

                <Typography variant="h6" mt={2}>{t('flashcardSetForm.voiceSettings')}</Typography>
                <FormControlLabel
                    control={<Switch checked={termVoice} onChange={(_, v) => setTermVoiceState(v)} />}
                    label={t('flashcardSetForm.voiceTerms')}
                />
                <FormControlLabel
                    control={<Switch checked={defVoice} onChange={(_, v) => setDefVoiceState(v)} />}
                    label={t('flashcardSetForm.voiceDefinitions')}
                />

                <Typography variant="h6" gutterBottom mt={2}>
                    {t('flashcardSetForm.importCards')}
                </Typography>

                <Button variant="contained" component="label" color="inherit" sx={{mb: 2}}>
                    {t('flashcardSetForm.importFile')}
                    <input
                        type="file"
                        hidden
                        accept=".txt,.csv"
                        onChange={e => e.target.files?.[0] && handleFileImport(e.target.files[0])}
                    />
                </Button>

                <Typography variant="h6" gutterBottom mt={2}>
                    {t('flashcardSetForm.cards')}
                </Typography>
                {flashcardSet.cards.map((card, i) => (
                    <Box key={i} display="flex" gap={2} alignItems="center" mb={2}>
                        <TextField
                            label={t('flashcardSetForm.term')}
                            value={card.term}
                            onChange={e => handleCardChange(i, 'term', e.target.value)}
                            fullWidth
                            required
                        />
                        <TextField
                            label={t('flashcardSetForm.definition')}
                            value={card.definition}
                            onChange={e => handleCardChange(i, 'definition', e.target.value)}
                            fullWidth
                            required
                        />
                        <IconButton onClick={() => deleteCard(i)} color="default">
                            <DeleteIcon/>
                        </IconButton>
                    </Box>
                ))}
                <Button onClick={addCard} variant="contained" color="inherit" sx={{mt: 1, mb: 2}}>
                    {t('flashcardSetForm.addCard')}
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    color="inherit"
                    fullWidth
                    disabled={isSubmitting}
                >
                    {isSubmitting ? t('flashcardSetForm.saving') : isEditMode ? t('flashcardSetForm.saveChanges') : t('flashcardSetForm.createSetBtn')}
                </Button>
            </Box>
        </Container>
    );
};
