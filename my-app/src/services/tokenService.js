export const getAccessToken = () => {
    return localStorage.getItem('access');
};

export const setAccessToken = (token) => {
    localStorage.setItem('access', token);
};

export const getRefreshToken = () => {
    return localStorage.getItem('refresh');
};

export const setRefreshToken = (token) => {
    localStorage.setItem('refresh', token);
};

export const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
};
