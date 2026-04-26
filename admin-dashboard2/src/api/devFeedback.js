import api from './axiosConfig';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sarker.shop/api';

// Public endpoint (no auth needed)
export const createFeedback = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            formData.append(key, value);
        }
    });
    const response = await axios.post(`${BASE_URL}/dev-feedback/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// Admin endpoints (JWT auth required)
export const getFeedbacks = async (params = {}) => {
    const response = await api.get('/dev-feedback/', { params });
    return response.data;
};

export const getFeedback = async (id) => {
    const response = await api.get(`/dev-feedback/${id}/`);
    return response.data;
};

export const updateFeedback = async (id, data) => {
    const response = await api.patch(`/dev-feedback/${id}/`, data);
    return response.data;
};

export const deleteFeedback = async (id) => {
    const response = await api.delete(`/dev-feedback/${id}/`);
    return response.data;
};
