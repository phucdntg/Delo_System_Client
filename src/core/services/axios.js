import {
  ACCESS_TOKEN,
  HEADER_ORG_ID,
  ORG_ID,
  REFRESH_TOKEN,
  USER_INFO,
} from "@shared/constants/systemConstants";
import axios from "axios";
import { config } from "../config";

const instance = axios.create({
  baseURL: config.baseUrl,
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
    const token = localStorage.getItem(ACCESS_TOKEN);
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
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        localStorage.removeItem(USER_INFO);
        localStorage.removeItem(ORG_ID);
        window.location.href = PATH.AUTH;
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

      const refreshToken = localStorage.getItem(REFRESH_TOKEN);

      if (!refreshToken) {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(USER_INFO);
        localStorage.removeItem(ORG_ID);
        window.location.href = PATH.AUTH;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${config.baseUrl}/auth/refresh-token`,
          {
            refreshToken: refreshToken,
          },
        );

        const { access_token } = response.data?.data;
        localStorage.setItem(ACCESS_TOKEN, access_token);
        preReq.headers.Authorization = `Bearer ${access_token}`;
        preReq.headers[HEADER_ORG_ID] = localStorage.getItem(ORG_ID) || "0";
        processQueue(null, access_token);

        isRefreshing = false;

        return instance(preReq);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        localStorage.removeItem(USER_INFO);
        localStorage.removeItem(ORG_ID);
        window.location.href = PATH.AUTH;

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
