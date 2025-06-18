import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export interface AuthResponse {
    token: string | null;
    errorMessage: string | null;
}

export const login = async (login: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await axios.post<string>(`${API_URL}/login`, { login, password });
        return { token: response.data, errorMessage: null };
    }catch (error) {
        console.error(error);
        return { token: null, errorMessage: "Ошибка входа" };
    }
};
