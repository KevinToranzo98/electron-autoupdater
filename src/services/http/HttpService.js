const axios = require("axios");
const { configUrl } = require("../configService.js");

class HttpService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: configUrl, // Cambia esto por la URL base de tu API
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          location.reload();
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token) {
    this.axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
  }

  async get(url) {
    try {
      const response = await this.axiosInstance.get(url);
      return response;
    } catch (error) {
      if (error.response) {
        return { error: error.response.data, status: error.response.status };
      } else if (error.request) {
        return error.request;
      } else {
        return error.message;
      }
    }
  }

  async post(url, data) {
    try {
      const res = await this.axiosInstance.post(url, data);
      return res;
    } catch (error) {
      throw error;
    }
  }

  async put(url, data) {
    try {
      const response = await this.axiosInstance.put(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new HttpService();
