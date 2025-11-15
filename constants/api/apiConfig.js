const domains = {
  prod: "assos.utc.fr",
  staging: "skiut.mdlmr.fr",
  dev: "192.168.1.185",  // IP du serveur de développement à changer pour chaque machine
  local: "127.0.0.1"
}
const DOMAIN = domains.dev;      // Changer ici si prod, dev ou local pour le login

const urls = {
  prod: "https://assos.utc.fr/skiutc",
  staging: "https://skiut.mdlmr.fr/skiutc",
  dev: "http://192.168.1.185:8000/skiutc",  // IP du serveur de développement à changer pour chaque machine
  local: "http://127.0.0.1:8000/skiutc"
}

const BASE_URL = urls.dev;   // Changer ici si prod, dev ou local pour toute autre requête

const API_BASE_URL = `${BASE_URL}/api`;

export { DOMAIN, BASE_URL, API_BASE_URL };
