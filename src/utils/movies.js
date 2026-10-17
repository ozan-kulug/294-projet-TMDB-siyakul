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

// Tous les films de l'API. Elle limite à 100 films par page :
// on charge la 1re page, puis les suivantes en parallèle
export async function getAllMovies () {
  const first = await getMovies('limit=100&page=1')
  const otherPages = Array.from({ length: first.pagination.pages - 1 }, (_, i) => i + 2)
  const others = await Promise.all(otherPages.map(p => getMovies(`limit=100&page=${p}`)))
  return [first, ...others].flatMap(json => json.data)
}

// Nom de la langue en français, ex. « en » → « Anglais »
export function languageName (code) {
  if (!code) {
    return 'Inconnue'
  }
  try {
    const name = new Intl.DisplayNames(['fr'], { type: 'language' }).of(code)
    return name.charAt(0).toUpperCase() + name.slice(1)
  } catch {
    return code.toUpperCase()
  }
}

// Rang en français : 1 → « 1er », 12 → « 12e »
export function ordinal (n) {
  return n === 1 ? '1er' : `${n}e`
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
