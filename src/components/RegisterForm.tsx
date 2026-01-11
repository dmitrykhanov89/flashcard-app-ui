import {useState} from 'react';
import type {CreateUserDto} from '../types/UserTypes';
import {useAuth} from '../hooks/UseAuth';
import {Alert, Box, Button, Stack, TextField, Typography} from '@mui/material';
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
        try {
            const user: User = await register(form);
            updateUser(user);
            const token: string = await login(form);
            updateToken(token);
            navigate('/')
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Неизвестная ошибка');
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
            sx={{
                mt: 2,
                width: '100%',
                maxWidth: 450,
                mx: 'auto',
                px: 2,
                boxSizing: 'border-box',
            }}
        >
            <Stack spacing={2}>
                <Typography variant="h5" align="center">
                    Регистрация
                </Typography>

                <TextField
                    label="Имя"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={isFieldEmpty('name')}
                />
                <TextField
                    label="Фамилия"
                    name="surname"
                    value={form.surname}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={isFieldEmpty('surname')}
                />
                <TextField
                    label="Логин"
                    name="login"
                    value={form.login}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={isFieldEmpty('login')}
                />
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={isFieldEmpty('email')}
                />
                <TextField
                    label="Пароль"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={isFieldEmpty('password')}
                />
                {/* Ошибка */}
                <Box sx={{minHeight: 52}}>
                    {error && (
                        <Alert severity="error">{error}</Alert>
                    )}
                </Box>
                <Button type="submit" variant="contained" color="inherit" fullWidth>
                    Зарегистрироваться
                </Button>
            </Stack>
        </Box>
    );
};
