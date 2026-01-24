import {useState} from 'react';
import type {CreateUserDto} from '../types/UserTypes';
import {useAuth} from '../hooks/UseAuth';
import {Alert, Box, Button, CircularProgress, Stack, TextField, Typography} from '@mui/material';
import {User} from "../types/authTypes.ts";
import {useNavigate} from "react-router-dom";
import {login, register} from "../api/authentication.ts";

/**
 * Компонент формы регистрации нового пользователя.
 *
 * Выполняет создание пользователя, авторизацию, сохранение токена и информации о пользователе.
 * Обрабатывает ошибки регистрации и входа.
 */
export const RegisterForm = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<CreateUserDto>({
        name: '',
        surname: '',
        login: '',
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const {updateToken: updateToken, updateUser: updateUser} = useAuth(); // сохраняем и токен, и пользователя

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const isFormValid = Object.values(form).every(value => value.trim() !== '');
        if (!isFormValid) {
            setError('Не все обязательные поля заполнены');
            return;
        }
        setLoading(true);
        const MAX_RETRIES = 3;
        let attempt = 0;
        while (attempt < MAX_RETRIES) {
            try {
                const user: User = await register(form);
                updateUser(user);
                const token: string = await login(form);
                updateToken(token);
                navigate('/')
                break;
            } catch (error: unknown) {
                attempt++;
                if (attempt >= MAX_RETRIES) {
                    if (error instanceof Error) {
                        setError(error.message);
                    } else {
                        setError('Неизвестная ошибка');
                    }
                    setLoading(false);
                } else {
                    await new Promise(res => setTimeout(res, 2000));
                }
            }
        }
    };

    const isFieldEmpty = (field: string) =>
        form[field as keyof CreateUserDto].trim() === '' && error !== '';

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{mt: 2, width: '100%', maxWidth: 450, mx: 'auto', px: 2, boxSizing: 'border-box',}}>
            <Stack spacing={2}>
                <Typography variant="h5" align="center">
                    Регистрация
                </Typography>

                {[
                    { name: 'name' as const, label: 'Имя', type: 'text' },
                    { name: 'surname' as const, label: 'Фамилия', type: 'text' },
                    { name: 'login' as const, label: 'Логин', type: 'text' },
                    { name: 'email' as const, label: 'Email', type: 'email' },
                    { name: 'password' as const, label: 'Пароль', type: 'password' },
                ].map(({ name, label, type }) => (
                    <TextField
                        key={name}
                        label={label}
                        name={name}
                        type={type}
                        value={form[name]}
                        onChange={handleChange}
                        required
                        fullWidth
                        error={isFieldEmpty(name)}
                        disabled={loading}
                    />
                ))}
                {/* Ошибка */}
                <Box sx={{minHeight: 52}}>
                    {error && (
                        <Alert severity="error">{error}</Alert>
                    )}
                </Box>
                <Button type="submit" variant="contained" color="inherit" fullWidth disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}>
                    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
            </Stack>
        </Box>
    );
};