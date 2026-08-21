import apiClient from "./apiClient";

export const idManagementService = {
  create: async (data) => {
    try {
      const response = await apiClient.post("/IDManage", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAll: async (filters = {}) => {
    try {
      const response = await apiClient.get("/IDManage", { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/IDManage/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getByPhone: async (phone) => {
    try {
      const response = await apiClient.get(`/IDManage/phone/${phone}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/IDManage/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/IDManage/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getActive: async () => {
    try {
      const response = await apiClient.get("/IDManage/active");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getExpired: async () => {
    try {
      const response = await apiClient.get("/IDManage/expired");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get("/IDManage/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tag Management Methods (ID Name & Nickname)
  getAllTags: async () => {
    try {
      const response = await apiClient.get("/IDManage/tags");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAvailableTags: async () => {
    try {
      const response = await apiClient.get("/IDManage/tags/available");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createTag: async (tagData) => {
    try {
      const response = await apiClient.post("/IDManage/tags", tagData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateTag: async (id, tagData) => {
    try {
      const response = await apiClient.put(`/IDManage/tags/${id}`, tagData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteTag: async (id) => {
    try {
      const response = await apiClient.delete(`/IDManage/tags/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // On Visit Tag Assignment & End Visit
  assignTag: async (id, idNumber, company) => {
    try {
      const response = await apiClient.put(`/IDManage/${id}/assign-tag`, { idNumber, company });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  endVisit: async (id) => {
    try {
      const response = await apiClient.put(`/IDManage/${id}/end-visit`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default idManagementService;
