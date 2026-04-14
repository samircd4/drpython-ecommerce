import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
