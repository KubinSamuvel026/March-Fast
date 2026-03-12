import axiosClient from '../axiosClient.js'

export const loginUser = async (credentials) => {
    const response = await axiosClient.post('/auth/login/', credentials)
    return response.data
}

export const registerUser = async (data) => {
    const response = await axiosClient.post('/auth/register/', {
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm ?? data.password2,
    })
    return response.data
}
