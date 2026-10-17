// Fonctions partagées pour l'API des films

export const API_URL = 'https://apis.divtec.me'

// Appelle l'API et renvoie le JSON, ou lance une erreur avec le message de l'API
export async function apiGet (path) {
  const response = await fetch(`${API_URL}/api/tmdb-api${path}`)
  const json = await response.json()
  if (!response.ok) {
    throw new Error(json?.error?.message ?? `Erreur ${response.status}`)
  }
  return json
}

export function getMovies (query) {
  return apiGet(`/movies?${query}`)
}

export function imageUrl (path) {
  return path ? `${API_URL}${path}` : undefined
}

// Certains films de l'API n'ont pas d'affiche (posterPath absent) :
// on utilise alors l'image de fond (backdropPath) à la place
export function posterUrl (movie) {
  return imageUrl(movie.posterPath ?? movie.backdropPath)
}

export function releaseYear (movie) {
  return movie.releaseDate?.slice(0, 4) ?? '–'
}

// Date de sortie en français, ex. « 29 juillet 2026 »
export function releaseDate (movie) {
  if (!movie.releaseDate) {
    return 'Date inconnue'
  }
  return new Date(movie.releaseDate).toLocaleDateString('fr-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function rating (movie) {
  return movie.voteAverage?.toFixed(1) ?? '–'
}
