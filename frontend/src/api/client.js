import axios from "axios";

const api = axios.create({
  baseURL: "https://clearminutes.onrender.com",  
});

export const uploadAudio = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/api/upload", formData);
};

export const getJob = (jobId) => api.get(`/api/jobs/${jobId}`);

export const exportJob = (jobId) => {
  window.open(`$https://clearminutes.onrender.com/api/jobs/${jobId}/export`, "_blank");
};

export default api;
