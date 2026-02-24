import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const uploadAudio = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/api/upload", formData);
};

export const getJob = (jobId) => api.get(`/api/jobs/${jobId}`);

export const exportJob = (jobId) => {
  window.open(`http://localhost:8000/api/jobs/${jobId}/export`, "_blank");
};

export default api;
