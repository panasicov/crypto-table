import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

class APIService {
  constructor() {
    this.sendGet = this.sendGet.bind(this);
    this.sendPost = this.sendPost.bind(this);
  }

  sendGet = (url_path) => {
    const url = API_URL + url_path;
    return axios.get(url);
  }

  sendPost = (url_path, data) => {
    const url = API_URL + url_path;
    return axios.post(url, data);
  }

  setDefaultHeaders = (key, value) => {
    axios.defaults.headers.common[key] = value;
  }

  deleteDefaultHeaders = (key) => {
    delete axios.defaults.headers.common[key];
  }
}

export default APIService;