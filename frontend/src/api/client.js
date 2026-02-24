import axios from "axios";

const api = axios.create({
  baseURL: "https://clearminutes.onrender.com",
  timeout: 120000, // 2 minutes — important for Render's free tier
});

export const uploadAudio = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onUploadProgress) onUploadProgress(percent);
      }
    },
  });
};

export const getJob = (jobId) => api.get(`/api/jobs/${jobId}`);

export const exportJob = (jobId) => {
  window.open(
    `https://clearminutes.onrender.com/api/jobs/${jobId}/export`,
    "_blank"
  );
};

export default api;
