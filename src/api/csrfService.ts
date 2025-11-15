export const csrfService = {
    /**
     * Получает токен из cookie
     */
    getTokenFromCookie(): string | null {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] || null;
    }
};