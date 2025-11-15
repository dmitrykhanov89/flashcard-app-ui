import { csrfService } from './csrfService';
/** Поддерживаемые HTTP методы */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Опции для HTTP запроса
 * @template T - Тип тела запроса
 */
interface FetchOptions<T> {
    /** HTTP метод (по умолчанию GET) */
    method?: HttpMethod;
    /** Дополнительные заголовки */
    headers?: Record<string, string>;
    /** Тело запроса */
    body?: T | null;
    /** Требуется ли авторизация (по умолчанию true) */
    requireAuth?: boolean;
}

/**
 * HTTP клиент для выполнения запросов к API
 * Автоматически добавляет токен авторизации из localStorage (если requireAuth !== false)
 *
 * @template B - Тип тела запроса
 * @template R - Тип ответа
 * @param url - URL для запроса
 * @param options - Опции запроса
 * @returns Promise с данными ответа
 * @throws Error при неуспешном запросе (статус не 2xx)
 */
export const httpClient = async <B = unknown, R = unknown>(url: string, options?: FetchOptions<B>): Promise<R> => {
    const storedToken = localStorage.getItem('token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options?.headers,
    };

    if (options?.requireAuth !== false && storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
    }

    const isModifying = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options?.method || 'GET');
    if (isModifying) {
        const csrfToken = csrfService.getTokenFromCookie();
        if (csrfToken) {
            headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
        }
    }

    const response = await fetch(url, {
        method: options?.method || 'GET',
        headers,
        body: options?.body ? JSON.stringify(options.body) : null,
        credentials: 'include', // нужно для отправки cookie
    });

    // Если сервер вернул новый токен — сохраняем его
    const newToken = response.headers.get('Authorization');
    if (newToken?.startsWith('Bearer ')) {
        const token = newToken.substring(7);
        localStorage.setItem('token', token);
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        return response.text() as Promise<R>;
    }
};