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

// Clé utilisée pour enregistrer les favoris dans le localStorage
const FAVORITES_KEY = 'cineclap_favorites'

export const useMovieStore = defineStore('movie', {
  state: () => ({
    movies: [],
    genres: [],
    isLoading: false,
    error: null,
    // Ids des films favoris (pas les objets complets)
    favorites: [],
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
    moviesByRating: state => state.movies.toSorted((a, b) => b.voteAverage - a.voteAverage),

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
    getRandomMovie: state => {
      return () => {
        if (state.movies.length === 0) {
          return null
        }
        const index = Math.floor(Math.random() * state.movies.length)
        return state.movies[index]
      }
    },

    // Nombre de favoris
    totalFavorites: state => state.favorites.length,

    // Savoir si un film est dans les favoris
    isFavorite: state => {
      return movie => state.favorites.includes(movie.id)
    },

    // Films favoris complets, retrouvés à partir de leurs ids
    getFavorites: state => {
      const favoriteMovies = state.favorites.map(favoriteId => {
        return state.movies.find(movie => movie.id === favoriteId)
      })
      // Un favori peut ne plus exister dans l'API : find() renvoie alors undefined
      return favoriteMovies.filter(movie => movie !== undefined)
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
      this.cleanupFavorites()
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
      // Les favoris sont chargés avant les films, pour que cleanupFavorites() puisse les nettoyer
      this.loadFavorites()
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

    /**
     * Charge les favoris enregistrés dans le localStorage
     */
    loadFavorites () {
      try {
        const savedFavorites = localStorage.getItem(FAVORITES_KEY)
        this.favorites = savedFavorites ? JSON.parse(savedFavorites) : []
      } catch (error) {
        console.error('Erreur lors du chargement des favoris :', error)
        this.favorites = []
      }
    },

    /**
     * Enregistre les favoris dans le localStorage (en texte, avec JSON.stringify)
     */
    saveFavorites () {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(this.favorites))
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des favoris :', error)
      }
    },

    /**
     * Ajoute le film aux favoris, ou le retire s'il y est déjà
     */
    toggleFavorite (movie) {
      const favoriteIndex = this.favorites.indexOf(movie.id)

      if (favoriteIndex === -1) {
        // Pas encore favori : on l'ajoute
        this.favorites.push(movie.id)
      } else {
        // Déjà favori : on le retire
        this.favorites.splice(favoriteIndex, 1)
      }

      this.saveFavorites()
    },

    /**
     * Retire des favoris les films qui n'existent plus dans l'API
     */
    cleanupFavorites () {
      const initialCount = this.favorites.length

      this.favorites = this.favorites.filter(favoriteId => {
        return this.movies.some(movie => movie.id === favoriteId)
      })

      if (this.favorites.length !== initialCount) {
        this.saveFavorites()
      }
    },
  },
})
