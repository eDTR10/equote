import axios from "axios";

// Base configuration
axios.defaults.baseURL = "http://localhost:8000/api/v1";

// Common headers
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Authorization'] = 'Token 650eda9ad3e37608685dab00e603fa22d179abab';

// GET request headers
axios.defaults.headers.get['Accept'] = 'application/json';
axios.defaults.headers.get['Authorization'] = 'Token 650eda9ad3e37608685dab00e603fa22d179abab';

// POST request headers
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.headers.post['Authorization'] = 'Token 650eda9ad3e37608685dab00e603fa22d179abab';

// PUT request headers
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.headers.put['Accept'] = 'application/json';
axios.defaults.headers.put['Authorization'] = 'Token 650eda9ad3e37608685dab00e603fa22d179abab';

export default axios;