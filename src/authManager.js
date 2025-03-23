export class AuthManager {
    static AUTH_ENDPOINT = 'https://learn.zone01kisumu.ke/api/auth/signin';

    static async login(usernameOrEmail, password) {
        const credentials = btoa(`${usernameOrEmail}:${password}`);
        const response = await fetch(this.AUTH_ENDPOINT, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Invalid credentials');
        const jwt = await response.json();
        this.setToken(jwt);
        return jwt;
    }

    static logout() {
        localStorage.removeItem('jwt');
    }

    static getToken() {
        return localStorage.getItem('jwt');
    }

    static setToken(jwt) {
        localStorage.setItem('jwt', jwt);
    }

    static isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch (error) {
            return true; // Treat invalid tokens as expired
        }
    }
}