const domains = {
  prod: "assos.utc.fr",
  dev: "192.168.1.154",  // IP du serveur de développement à changer pour chaque machine
  local: "127.0.0.1"
}
const DOMAIN = domains.dev;      // Changer ici si prod, dev ou local pour le login

const urls = {
  prod: "https://assos.utc.fr/skiutc",
  dev: "http://192.168.1.154:8000/skiutc",  // IP du serveur de développement à changer pour chaque machine
  local: "http://192.168.1.154:8000/skiutc"
}

const BASE_URL = urls.dev;   // Changer ici si prod, dev ou local pour toute autre requête

const API_BASE_URL = `${BASE_URL}/api`;

const BYPASS_LOGIN = true;

export { DOMAIN , BASE_URL, API_BASE_URL, BYPASS_LOGIN };
