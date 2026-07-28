import apiClient from "./apiClient";

export const companyService = {
  create: async (data) => {
    try {
      const response = await apiClient.post("/Company", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAll: async (filters = {}) => {
    try {
      const response = await apiClient.get("/Company", { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/Company/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/Company/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/Company/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getIndustries: async () => {
    try {
      const response = await apiClient.get("/Company/industries");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  search: async (q) => {
    try {
      const response = await apiClient.get("/Company/search", { params: { q } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getRecent: async (limit = 5) => {
    try {
      const response = await apiClient.get("/Company/recent", { params: { limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default companyService;
