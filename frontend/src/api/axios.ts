import axios from "axios";

// Add this type definition to extend ImportMeta for Vite env variables
declare global {
  interface ImportMetaEnv {
    VITE_API_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // important for cookie-based JWT
});

// optional: basic 401 handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {

      // you could clear auth store or redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
