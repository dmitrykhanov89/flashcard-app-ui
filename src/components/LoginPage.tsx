import { useState } from 'react';
import { login } from '../api/auth';
import {useAuth} from "../hooks/UseAuth.ts";
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage = () => {
    const [form, setForm] = useState({ login: '', password: '' });
    const { login: saveToken } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await login(form.login, form.password);
            if (res.token) {
                saveToken(res.token);
                navigate('/');
            } else {
                alert(res.errorMessage || 'Ошибка входа');
            }
        } catch {
            alert('Неверный логин или пароль');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    value={form.login}
                    onChange={e => setForm({ ...form, login: e.target.value })}
                    placeholder="Login"
                />
                <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Password"
                />
                <button type="submit">Войти</button>
            </form>
            <p>
                Нет аккаунта?{' '}
                <Link to="/register" style={{ color: 'blue', textDecoration: 'underline' }}>
                    Зарегистрироваться
                </Link>
            </p>
        </div>
    );
};
