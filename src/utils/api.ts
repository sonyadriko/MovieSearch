const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const fetchMovies = async (query: string, page: number = 1) => {
  try {
    const response = await fetch(`${API_URL}?s=${query}&page=${page}&apikey=${API_KEY}`);
    if (!response.ok) {
      throw new Error("Failed to fetch movies");
    }
    const data = await response.json();
    if (data.Response === "False") {
      throw new Error(data.Error);
    }
    return {
      movies: data.Search,
      totalResults: parseInt(data.totalResults, 10), // Parse totalResults as a number
    };
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

export const fetchMovieDetails = async (imdbID: string) => {
  const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`);
  const data = await response.json();
  return data;
};

