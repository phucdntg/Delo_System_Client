import { DEVICE_ID, ORG_ID } from "../../shared/constants/systemConstants";
import axios from "./axios";

export const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
  async ({ url, method, data, params, headers }) => {
    try {
      let shouldSkipOrgId = false;
      if (params?.skipOrgId !== undefined) {
        shouldSkipOrgId = params.skipOrgId;
        delete params.skipOrgId;
      }

      const requestHeaders = {
        ...headers,
      };

      const deviceId = localStorage.getItem(DEVICE_ID);
      if (deviceId) {
        requestHeaders["x-device-id"] = "Bearer " + deviceId;
      }

      if (!shouldSkipOrgId) {
        requestHeaders["x-organization-id"] =
          localStorage.getItem(ORG_ID) || "0";
      }

      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers: requestHeaders,
      });
      return { data: result.data };
    } catch (axiosError) {
      let err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
