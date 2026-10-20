/**
 * stores/movieStore.js
 *
 * Store des films : charge les films et les genres une seule fois
 * et les partage entre toutes les pages
 */

import { defineStore } from 'pinia'
import api from '@/plugins/axios'

// URL du serveur des images, lue depuis le fichier .env
const IMAGES_URL = import.meta.env.VITE_IMAGES_URL || 'https://apis.divtec.me'

// Nombre maximum de films par requête autorisé par l'API
const LIMIT = 100

export const useMovieStore = defineStore('movie', {
  state: () => ({
    movies: [],
    genres: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    // Nombre total de films
    totalMovies: state => state.movies.length,

    // Retrouver un film par son id
    getMovieById: state => {
      return movieId => state.movies.find(movie => movie.id === movieId)
    },

    // Films triés du plus populaire au moins populaire
    moviesByPopularity: state => state.movies.toSorted((a, b) => b.popularity - a.popularity),

    // Films triés de la meilleure note à la moins bonne
    moviesByRating: state => state.movies.toSorted((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0)),

    // Noms des genres d'un film (genreIds contient le sourceId des genres)
    getGenreNames: state => {
      return movie => {
        const genreIds = movie.genreIds || []
        return state.genres
          .filter(genre => genreIds.includes(genre.sourceId))
          .map(genre => genre.name)
      }
    },

    // URL complète d'une image à partir de son chemin (ex. /images/...)
    getImageUrl: () => {
      return path => path ? `${IMAGES_URL}${path}` : ''
    },
  },

  actions: {
    /**
     * Charge tous les films. L'API renvoie au maximum 100 films par page :
     * on charge la 1re page, puis les pages suivantes en parallèle.
     */
    async fetchMovies () {
      const response = await api.get(`/movies?limit=${LIMIT}&page=1`)
      const movies = response.data.data

      // Prépare une requête pour chaque page suivante
      const requests = []
      for (let page = 2; page <= response.data.pagination.pages; page++) {
        requests.push(api.get(`/movies?limit=${LIMIT}&page=${page}`))
      }

      // Ajoute les films des pages suivantes à la liste
      const responses = await Promise.all(requests)
      for (const pageResponse of responses) {
        for (const movie of pageResponse.data.data) {
          movies.push(movie)
        }
      }

      this.movies = movies
    },

    /**
     * Charge la liste des genres (Action, Comédie, etc.)
     */
    async fetchGenres () {
      const response = await api.get(`/genres?limit=${LIMIT}`)
      this.genres = response.data.data
    },

    /**
     * Charge les films et les genres en parallèle au démarrage de l'application
     */
    async init () {
      this.isLoading = true
      this.error = null
      try {
        await Promise.all([
          this.fetchMovies(),
          this.fetchGenres(),
        ])
      } catch (error) {
        this.error = 'Erreur lors du chargement des films'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
