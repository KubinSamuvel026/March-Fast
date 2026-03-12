import axiosClient from './axiosClient';
import { unwrapResponse } from '../utils/apiResponseHandler';

/**
 * Log in a user.
 * @param {Object} credentials - The login credentials (email, password).
 */
export const loginUser = async (credentials) => {
  const response = await axiosClient.post('/auth/login/', credentials);
  return unwrapResponse(response) || response.data;
};

/**
 * Register a new user.
 * @param {Object} userData - The registration data (username, email, password, password_confirm, store_name, phone_number, account_holder_name).
 */
export const registerUser = async (userData) => {
  const response = await axiosClient.post('/auth/register/', userData);
  return unwrapResponse(response) || response.data;
};

/**
 * Get current vendor profile.
 */
export const getProfile = async () => {
  const response = await axiosClient.get('/auth/profile/');
  return unwrapResponse(response) || response.data;
};
