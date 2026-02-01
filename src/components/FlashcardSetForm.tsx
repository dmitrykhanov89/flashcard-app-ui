import {useEffect, useState, useRef} from 'react';
import {useAuth} from '../hooks/UseAuth';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {Box, Button, IconButton, TextField, Typography, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions} from '@mui/material';
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
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [importText, setImportText] = useState('');
    const [separator, setSeparator] = useState('');
    const [importError, setImportError] = useState('');
    const cardsContainerRef = useRef<HTMLDivElement>(null);
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
        setTimeout(() => {
            cardsContainerRef.current?.scrollTo({
                top: cardsContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }, 0);
    };

    const deleteCard = (index: number) => {
        setFlashcardSet({...flashcardSet, cards: flashcardSet.cards.filter((_, i) => i !== index)});
    };


    const handleTextImport = () => {
        setImportError('');
        if (!importText.trim()) {
            setImportError(t('flashcardSetForm.importError'));
            return;
        }

        const lines = importText.split("\n").map(l => l.trim()).filter(Boolean);
        const importedCards: Card[] = [];

        // If separator is empty, use tab or whitespace(s) as separator
        const isAutoSeparator = !separator.trim();

        for (const line of lines) {
            let term: string;
            let definition: string;

            if (isAutoSeparator) {
                // Try to split by tab first, then by multiple whitespaces
                if (line.includes('\t')) {
                    const parts = line.split('\t');
                    term = parts[0].trim();
                    definition = parts.slice(1).join('\t').trim();
                } else {
                    // Split by one or more whitespaces
                    const match = line.match(/^(\S+)\s+(.+)$/);
                    if (!match) {
                        setImportError(t('flashcardSetForm.importError'));
                        return;
                    }
                    term = match[1].trim();
                    definition = match[2].trim();
                }
            } else {
                // Use custom separator
                if (!line.includes(separator)) {
                    setImportError(t('flashcardSetForm.importError'));
                    return;
                }
                const parts = line.split(separator);
                if (parts.length < 2) {
                    setImportError(t('flashcardSetForm.importError'));
                    return;
                }
                term = parts[0].trim();
                definition = parts.slice(1).join(separator).trim();
            }

            if (!term || !definition) {
                setImportError(t('flashcardSetForm.importError'));
                return;
            }
            importedCards.push({term, definition});
        }

        if (importedCards.length === 0) {
            setImportError(t('flashcardSetForm.importError'));
            return;
        }

        setFlashcardSet(prev => {
            // Find empty cards that can be filled
            const existingCards = [...prev.cards];
            let importIndex = 0;

            // Fill existing empty cards first
            for (let i = 0; i < existingCards.length && importIndex < importedCards.length; i++) {
                if (!existingCards[i].term.trim() && !existingCards[i].definition.trim()) {
                    existingCards[i] = importedCards[importIndex];
                    importIndex++;
                }
            }

            // Add remaining imported cards
            const remainingCards = importedCards.slice(importIndex);

            return {...prev, cards: [...existingCards, ...remainingCards]};
        });
        setIsImportDialogOpen(false);
        setImportText('');
        setSeparator('');
        setImportError('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!user?.id) {
            setError(t('flashcardSetForm.notAuthorized'));
            return;
        }

        if (!flashcardSet.name || !flashcardSet.cards.every(card => card.term && card.definition)) {
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
        <Box sx={{ display: 'flex', gap: 4, p: 2, height: 'calc(100vh - 73px - 48px)' }}>
            <CloseButton to={closeTo} />

            {/* Left Panel - Fixed */}
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{
                    minWidth: '150px',
                    maxWidth: '400px',
                    flex: '1 1 300px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                {error && <Typography color="error">{error}</Typography>}
                <TextField
                    label={t('flashcardSetForm.name')}
                    value={flashcardSet.name}
                    onChange={e => setFlashcardSet({...flashcardSet, name: e.target.value})}
                    fullWidth
                    required
                    size="small"
                />
                <TextField
                    label={t('flashcardSetForm.description')}
                    value={flashcardSet.description}
                    onChange={e => setFlashcardSet({...flashcardSet, description: e.target.value})}
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                />

                <Typography variant="h6" mt={1}>{t('flashcardSetForm.voiceSettings')}</Typography>
                <FormControlLabel
                    control={<Switch checked={termVoice} onChange={(_, v) => setTermVoiceState(v)} />}
                    label={t('flashcardSetForm.voiceTerms')}
                />
                <FormControlLabel
                    control={<Switch checked={defVoice} onChange={(_, v) => setDefVoiceState(v)} />}
                    label={t('flashcardSetForm.voiceDefinitions')}
                />

                <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => setIsImportDialogOpen(true)}
                    fullWidth
                >
                    {t('flashcardSetForm.import')}
                </Button>

                <Button
                    type="submit"
                    variant="contained"
                    color="inherit"
                    disabled={isSubmitting}
                    fullWidth
                    sx={{ mt: 'auto' }}
                >
                    {isSubmitting ? t('flashcardSetForm.saving') : isEditMode ? t('flashcardSetForm.save') : t('flashcardSetForm.create')}
                </Button>
            </Box>

            {/* Right Panel - Scrollable Cards */}
            <Box
                ref={cardsContainerRef}
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Typography variant="h6" mb={2}>
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
                            size="small"
                        />
                        <TextField
                            label={t('flashcardSetForm.definition')}
                            value={card.definition}
                            onChange={e => handleCardChange(i, 'definition', e.target.value)}
                            fullWidth
                            required
                            size="small"
                        />
                        <IconButton onClick={() => deleteCard(i)} color="default">
                            <DeleteIcon/>
                        </IconButton>
                    </Box>
                ))}

                <Button onClick={addCard} variant="contained" color="inherit" sx={{ alignSelf: 'flex-start' }}>
                    {t('flashcardSetForm.addCard')}
                </Button>
            </Box>

            <Dialog
                open={isImportDialogOpen}
                onClose={() => {
                    setIsImportDialogOpen(false);
                    setImportError('');
                    setImportText('');
                    setSeparator('');
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{t('flashcardSetForm.importTextDialogTitle')}</DialogTitle>
                <DialogContent>
                    <TextField
                        label={t('flashcardSetForm.pasteText')}
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        fullWidth
                        multiline
                        rows={8}
                        margin="normal"
                    />
                    <TextField
                        label={t('flashcardSetForm.separator')}
                        value={separator}
                        onChange={(e) => setSeparator(e.target.value)}
                        fullWidth
                        margin="normal"
                        slotProps={{ htmlInput: { maxLength: 5 } }}
                        helperText={t('flashcardSetForm.separatorHint')}
                    />
                    {importError && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {importError}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setIsImportDialogOpen(false);
                            setImportError('');
                            setImportText('');
                            setSeparator('');
                        }}
                        color="inherit"
                    >
                        {t('flashcardSetForm.cancel')}
                    </Button>
                    <Button
                        onClick={handleTextImport}
                        variant="contained"
                        color="inherit"
                    >
                        {t('flashcardSetForm.submit')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
