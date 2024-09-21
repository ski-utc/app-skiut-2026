//Api urls
const urls = {
  prod: "https://assos.utc.fr/skiutc",
  dev: "http://192.168.1.103:8000/skiutc",  // IP du serveur de développement à changer pour chaque machine
};

// Api Url Variable
const BASE_URL = urls.dev;
const API_BASE_URL = `${BASE_URL}/api`;

export { API_BASE_URL, BASE_URL };