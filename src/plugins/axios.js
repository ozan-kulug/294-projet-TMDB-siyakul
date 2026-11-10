/**
 * plugins/axios.js
 *
 * Instance Axios configurée pour l'API des films
 */

import axios from 'axios'

// URL de l'API lue depuis le fichier .env (valeur par défaut si la variable n'existe pas)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://apis.divtec.me/api/tmdb-api'

// Toutes les requêtes partent de cette URL : api.get('/movies') → .../api/tmdb-api/movies
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
