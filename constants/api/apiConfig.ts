const domains = {
  prod: "assos.utc.fr",
  staging: "skiut.mdlmr.fr",
  dev: "192.168.1.33",  // IP du serveur de développement à changer pour chaque machine
  local: "127.0.0.1"
}
const DOMAIN = domains.dev;      // Changer ici si prod, dev ou local pour le login

const BASE_URL = DOMAIN.includes(".fr") ? `https://${DOMAIN}/skiutc` : `http://${DOMAIN}:8000/skiutc`

const API_BASE_URL = `${BASE_URL}/api`;

export { DOMAIN, BASE_URL, API_BASE_URL };
