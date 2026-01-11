import {useState} from 'react';
import {useAuth} from '../hooks/UseAuth';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {Box, Button, Link, Paper, Stack, TextField, Typography} from '@mui/material';
import {UserTypes} from "../types/UserTypes.ts";
import {login} from "../api/authentication.ts";
import {getCurrentUser} from "../api/user.ts";

/**
 * Страница входа пользователя.
 *
 * Позволяет ввести логин и пароль, пройти валидацию,
 * выполнить запрос на авторизацию и получить текущего пользователя.
 * После успешного входа перенаправляет на главную страницу.
 */
export const LoginPage = () => {
    const [form, setForm] = useState({login: '', password: ''});
    const [fieldErrors, setFieldErrors] = useState({login: false, password: false});
    const {updateUser: updateUser, updateToken: updateToken} = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    /**
     * Обрабатывает отправку формы входа.
     *
     * Выполняет валидацию полей и отправляет запросы на авторизацию и получение текущего пользователя.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const hasLogin = form.login.trim() !== '';
        const hasPassword = form.password.trim() !== '';
        setFieldErrors({
            login: !hasLogin, password: !hasPassword,
        });
        if (!hasLogin || !hasPassword) {
            setError('Обязательные поля не заполнены');
            return;
        }
        try {
            const token: string = await login(form);
            updateToken(token);
            const user: UserTypes = await getCurrentUser();
            updateUser(user);
            navigate('/');

        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Неизвестная ошибка');
            }
        }
    };

    /**
     * Обрабатывает изменение полей ввода.
     *
     * @param e Событие изменения input-поля
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
        setFieldErrors((prev) => ({...prev, [name]: false}));
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <Paper elevation={3} sx={{p: 4, width: 360}}>
                <Typography variant="h5" align="center" gutterBottom>
                    Вход
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            name="login"
                            label="Логин"
                            value={form.login}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={fieldErrors.login}
                            helperText={fieldErrors.login ? 'Введите логин' : ''}
                        />
                        <TextField
                            name="password"
                            label="Пароль"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={fieldErrors.password}
                            helperText={fieldErrors.password ? 'Введите пароль' : ''}
                        />
                        <Typography
                            color="error"
                            sx={{
                                minHeight: '20px', visibility: error ? 'visible' : 'hidden'
                            }}
                        >
                            {error || 'placeholder'}
                        </Typography>
                        <Button type="submit" variant="contained" color="inherit" fullWidth>
                            Войти
                        </Button>
                    </Stack>
                </form>

                <Typography variant="body2"  align="center" mt={2}>
                    Нет аккаунта?{' '}
                    <Link component={RouterLink} color="inherit" to="/register">
                        Зарегистрироваться
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
};
