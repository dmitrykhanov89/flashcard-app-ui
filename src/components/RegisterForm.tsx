import {useState} from 'react';
import {createUser} from '../api/user'; // проверь, что путь правильный
import {login} from '../api/auth'; // импорт функции логина
import type {CreateUserDto} from '../types/User';
import {useAuth} from "../hooks/UseAuth.ts";
import axios from 'axios';

interface RegisterFormProps {
    onSuccess?: () => void; // например, переход на главную страницу
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
    const [form, setForm] = useState<CreateUserDto>({
        name: '',
        surname: '',
        login: '',
        password: '',
    });

    const [error, setError] = useState('');
    const {login: saveToken} = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // сбрасываем ошибку перед отправкой
        try {
            // 1. Создаем пользователя
            await createUser(form);

            // 2. Логинимся с тем же логином и паролем
            const res = await login(form.login, form.password);

            if (res.token) {
                saveToken(res.token);  // сохраняем токен в контекст и localStorage
                onSuccess?.();         // вызываем callback (например, переход)
            } else {
                setError(res.errorMessage || 'Ошибка при входе после регистрации');
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Ошибка при регистрации');
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Неизвестная ошибка');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-3 p-4 border rounded">
            <h2 className="text-xl font-bold text-center">Регистрация</h2>

            <input
                name="name"
                placeholder="Имя"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
            />
            <input
                name="surname"
                placeholder="Фамилия"
                value={form.surname}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
            />
            <input
                name="login"
                placeholder="Логин"
                value={form.login}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
            />
            <input
                name="password"
                type="password"
                placeholder="Пароль"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
            />

            {error && <p className="text-red-500">{error}</p>}

            <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
                Зарегистрироваться
            </button>
        </form>
    );
}
export default RegisterForm;
