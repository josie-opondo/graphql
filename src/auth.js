const AUTH_ENDPOINT = 'https://learn.zone01kisumu.ke/api/auth/signin';

export function login(usernameOrEmail, password) {
    const credentials = btoa(`${usernameOrEmail}:${password}`);
    return fetch(AUTH_ENDPOINT, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }
        return response.json();
    })
    .then(jwt => {
        setToken(jwt);
        return jwt;
    });
}

export function logout() {
    localStorage.removeItem('jwt');
}

export function getToken() {
    return localStorage.getItem('jwt');
}

export function setToken(jwt) {
    localStorage.setItem('jwt', jwt);
}
