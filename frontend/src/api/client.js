import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  
});

export const uploadAudio = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/api/upload", formData);
};

export const getJob = (jobId) => api.get(`/api/jobs/${jobId}`);

export const exportJob = (jobId) => {
  window.open(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}/export`, "_blank");
};

export default api;
