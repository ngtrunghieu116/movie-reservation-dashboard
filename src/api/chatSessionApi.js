import axios from 'axios';

const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8001';

const chatSessionApi = {
    getSessions: async (params = {}) => {
        const response = await axios.get(`${CHATBOT_API_URL}/api/chat/sessions`, { params });
        return response.data;
    },

    getSessionHistory: async (sessionId) => {
        if (!sessionId) return { session_id: sessionId, messages: [] };
        const response = await axios.get(`${CHATBOT_API_URL}/api/chat/history/${sessionId}`);
        return response.data;
    },

    deleteSession: async (sessionId) => {
        const response = await axios.delete(`${CHATBOT_API_URL}/api/chat/sessions/${sessionId}`);
        return response.data;
    }
};

export default chatSessionApi;
