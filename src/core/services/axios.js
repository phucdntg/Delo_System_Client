import axios from "axios";
import { SYSTEM_CONSTANTS } from "../constants/system.constant";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const instance = axios.create({
  baseURL,
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

instance.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem(SYSTEM_CONSTANTS.ACCESS_TOKEN);
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  },
  (e) => Promise.reject(e),
);

instance.interceptors.response.use(
  (r) => r,
  async (error) => {
    const preReq = error.config;
    const status = error?.response?.status;

    if (status === 401 && preReq && !preReq._retry) {
      if (preReq.url?.includes("/auth/refresh-token")) {
        localStorage.removeItem(SYSTEM_CONSTANTS.ACCESS_TOKEN);
        localStorage.removeItem(SYSTEM_CONSTANTS.REFRESH_TOKEN);
        localStorage.removeItem(SYSTEM_CONSTANTS.QMS_USER);
        localStorage.removeItem(SYSTEM_CONSTANTS.ORG_ID);
        window.location.href = "/";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            preReq.headers.Authorization = `Bearer ${token}`;
            return instance(preReq);
          })
          .catch((err) => Promise.reject(err));
      }

      preReq._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(SYSTEM_CONSTANTS.REFRESH_TOKEN);

      if (!refreshToken) {
        localStorage.removeItem(SYSTEM_CONSTANTS.ACCESS_TOKEN);
        localStorage.removeItem(SYSTEM_CONSTANTS.QMS_USER);
        localStorage.removeItem(SYSTEM_CONSTANTS.ORG_ID);
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken: refreshToken,
        });

        const { access_token } = response.data?.data;
        localStorage.setItem(SYSTEM_CONSTANTS.ACCESS_TOKEN, access_token);
        preReq.headers.Authorization = `Bearer ${access_token}`;
        preReq.headers[SYSTEM_CONSTANTS.HEADER_ORG_ID] =
          localStorage.getItem(SYSTEM_CONSTANTS.ORG_ID) || "0";
        processQueue(null, access_token);

        isRefreshing = false;

        return instance(preReq);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        localStorage.removeItem(SYSTEM_CONSTANTS.ACCESS_TOKEN);
        localStorage.removeItem(SYSTEM_CONSTANTS.REFRESH_TOKEN);
        localStorage.removeItem(SYSTEM_CONSTANTS.QMS_USER);
        localStorage.removeItem(SYSTEM_CONSTANTS.ORG_ID);
        window.location.href = "/";

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
