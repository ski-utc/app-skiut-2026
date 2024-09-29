const urls = {
  prod: "https://assos.utc.fr/skiutc",
  dev: "http://192.168.1.156:8000/skiutc",  // IP du serveur de développement à changer pour chaque machine
};

const BASE_URL = urls.dev;
const API_BASE_URL = `${BASE_URL}/api`;

export { API_BASE_URL, BASE_URL };