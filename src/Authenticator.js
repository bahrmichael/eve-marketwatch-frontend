const jwtDecode = require('jwt-decode');


export function isAuthenticated() {
    try {
        const decoded = decodeToken();
        return decoded.sub;
    } catch (e) {
        return false;
    } 
}

export function decodeToken() {
    try {
        return jwtDecode(getToken());
    } catch(e) {
        console.error(e);
        return {};
    }
}

export function getToken() {
    return localStorage.getItem('token')
}

export function clearToken() {
    localStorage.removeItem('token');
}