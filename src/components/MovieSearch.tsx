import React, { useState, useEffect } from "react";
import { fetchMovies } from "../utils/api";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce } from "lodash";

interface MovieSearchProps {
  isDarkMode: boolean;
}

interface Movie {
  imdbID: string;
  Poster: string;
  Title: string;
  Year: string;
  Genre?: string;
}

const MovieSearch: React.FC<MovieSearchProps> = ({ isDarkMode }) => {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Debounced search function
  const debouncedSearch = debounce((query: string, page: number) => {
    if (query.trim()) {
      handleSearch(page);
    }
  }, 500);

  useEffect(() => {
    document.title = query ? `Results for "${query}"` : "Movie Search";
    if (query && hasSearched) {
      debouncedSearch(query, currentPage);
    }
    return () => debouncedSearch.cancel(); // Cleanup
  }, [query, currentPage, hasSearched, debouncedSearch]);

  // Handle search
  const handleSearch = async (page = 1) => {
    if (!query.trim()) return; // Avoid empty searches
    setError(null);
    setIsLoading(true);
    setHasSearched(true);
    try {
      const { movies: fetchedMovies, totalResults: fetchedTotalResults } = await fetchMovies(query, page);
      setMovies((prev) => (page === 1 ? fetchedMovies : [...prev, ...fetchedMovies]));
      setTotalResults(fetchedTotalResults);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setMovies([]);
    setHasSearched(false);
    setError(null);
  };

  // Load more movies for infinite scroll
  const loadMoreMovies = async () => {
    if (!isLoading && movies.length < totalResults) {
      await handleSearch(currentPage + 1);
    }
  };

  // Keyboard shortcut for search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(1);
    }
  };

  // Show/hide back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Loading skeleton for movie cards
  const MovieCardSkeleton = () => (
    <div className="p-4 rounded-lg shadow-lg animate-pulse">
      <div className="w-full h-64 bg-gray-300 rounded-lg mb-4"></div>
      <div className="h-6 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 bg-gray-300 rounded"></div>
    </div>
  );

  return (
    <div className={`flex flex-col ${hasSearched ? "min-h-screen" : "h-screen overflow-hidden"}`}>
      {/* Search Bar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: hasSearched ? 0 : 150, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center w-full max-w-2xl mx-auto mt-10"
      >
        <div className="flex items-center w-full">
          {/* Input */}
          <input
            type="text"
            placeholder="Search for movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`border p-2 rounded-l-lg w-full focus:outline-none focus:ring-2 ${
              isDarkMode
                ? "border-gray-700 bg-gray-800 text-white focus:ring-blue-500"
                : "border-gray-300 bg-white text-gray-900 focus:ring-blue-500"
            }`}
          />
          {/* Search Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSearch(1)}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg transition-all hover:bg-blue-600 focus:outline-none"
            aria-label="Search"
          >
            Search
          </motion.button>
          {/* Clear Button */}
          <button
            onClick={clearSearch}
            className="bg-red-500 text-white px-4 py-2 ml-2 rounded transition-all hover:bg-red-600 focus:outline-none"
            aria-label="Clear search"
          >
            Clear
          </button>
        </div>
      </motion.div>

      {/* Loading State with Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
          {Array.from({ length: 10 }).map((_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Error State with Retry Button */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-red-500 text-center mt-8"
        >
          <p className="text-lg">Error: {error}</p>
          <button
            onClick={() => handleSearch(currentPage)}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* No Results State */}
      {!isLoading && !error && hasSearched && movies.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-lg">No results found for "{query}". Try a different search!</p>
        </motion.div>
      )}

      {/* Movie Results with Infinite Scroll */}
      {!isLoading && !error && movies.length > 0 && (
        <InfiniteScroll
        dataLength={movies.length}
        next={loadMoreMovies}
        hasMore={movies.length < totalResults}
        loader={<p className="text-center mt-8">Loading more movies...</p>}
        endMessage={
          <p className="text-center mt-8">You have seen all the movies!</p>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
          {movies.map((movie, index) => (
            <motion.div
              key={`${movie.imdbID}-${index}`}
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <Link to={`/movie/${movie.imdbID}`}>
                <img
                  src={movie.Poster !== "N/A" ? movie.Poster : "/placeholder.jpg"}
                  alt={`${movie.Title} Poster`}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <h2
                  className={`text-lg font-semibold truncate ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {movie.Title}
                </h2>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {movie.Year}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </InfiniteScroll>
      )}

      {/* Back-to-Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600"
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default MovieSearch;