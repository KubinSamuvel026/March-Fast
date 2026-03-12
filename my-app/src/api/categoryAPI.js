// src/api/categoryAPI.js
// Fetch categories for use in dropdowns, etc.

import axiosClient from "./axiosClient";
import { ENDPOINTS } from "../config/apiConfig";

export async function getCategories() {
  const response = await axiosClient.get(ENDPOINTS.CATEGORIES);
  return response.data?.data ?? response.data;
}
