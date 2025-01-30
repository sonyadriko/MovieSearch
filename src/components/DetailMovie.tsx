import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovieDetails } from "../utils/api";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json"; // File Lottie JSON
import Modal from "react-modal";
import { ReactTyped } from "react-typed"; // Correct import

interface MovieDetail {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: { Source: string; Value: string }[];
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  BoxOffice: string;
}

interface DetailMovieProps {
  isDarkMode: boolean;
}

const DetailMovie: React.FC<DetailMovieProps> = ({ isDarkMode }) => {
  const { imdbID } = useParams();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // For modal

  useEffect(() => {
    const fetchDetails = async () => {
      if (!imdbID) return;

      try {
        setIsLoading(true);
        const result = await fetchMovieDetails(imdbID);
        setMovie(result);
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error fetching movie details";
        setError(errorMessage);
        console.error("Movie details fetch error:", err);
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [imdbID]);

  useEffect(() => {
    if (movie?.Title) {
      document.title = `${movie.Title} - Movie Details`;
    } else {
      document.title = "Detail Movie";
    }
  }, [movie]);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStars = Math.ceil(rating - fullStars);
    const emptyStars = 5 - fullStars - halfStars;

    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <motion.span
          key={`full-${i}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: i * 0.2 }}
          className="text-yellow-500 text-2xl"
        >
          &#9733;
        </motion.span>
      );
    }
    for (let i = 0; i < halfStars; i++) {
      stars.push(
        <motion.span
          key={`half-${i}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: (fullStars + i) * 0.2 }}
          className="text-yellow-500 text-2xl"
        >
          &#9734;
        </motion.span>
      );
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <motion.span
          key={`empty-${i}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: (fullStars + halfStars + i) * 0.2 }}
          className="text-gray-400 text-2xl"
        >
          &#9734;
        </motion.span>
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Lottie animationData={loadingAnimation} loop className="w-40 h-40" />
      </div>
    );
  }

  if (error) return <div>{error}</div>;
  if (!movie) return <div>No details found</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`container mx-auto p-6 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Poster with Modal */}
        <motion.img
          src={movie.Poster}
          alt={movie.Title}
          className="w-60 h-auto rounded-lg shadow-lg cursor-pointer"
          onClick={() => setIsModalOpen(true)} // Open modal on click
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">
            <ReactTyped
              strings={[`${movie.Title} (${movie.Year})`]}
              typeSpeed={50}
              backSpeed={50}
              backDelay={500}
              loop
            />
          </h2>
          <p className="text-lg"><strong>Genre:</strong> {movie.Genre}</p>
          <p className="text-lg"><strong>Rated:</strong> {movie.Rated}</p>
          <p className="text-lg"><strong>Released:</strong> {movie.Released}</p>
          <p className="text-lg"><strong>Language:</strong> {movie.Language}</p>
          <p className="text-lg"><strong>Country:</strong> {movie.Country}</p>
          <p className="text-lg"><strong>Awards:</strong> {movie.Awards}</p>

          <div className="flex gap-2">
            <strong>IMDb Rating:</strong>
            {renderStars(parseFloat(movie.imdbRating) / 2)}
          </div>

          <p className="text-lg"><strong>Plot:</strong> {movie.Plot}</p>
        </div>
      </div>

      {/* Modal for Poster */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="relative mx-auto max-w-full max-h-full w-auto h-auto bg-transparent"
        overlayClassName="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-2 right-2 text-white text-2xl z-10"
          >
            ✖
          </button>
          
          {/* Image */}
          <img
            src={movie.Poster}
            alt={movie.Title}
            className="rounded-lg max-w-[90vw] max-h-[90vh] object-contain"
          />
        </motion.div>
      </Modal>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`mt-4 px-4 py-2 rounded shadow ${
          isDarkMode ? "bg-blue-500 text-white" : "bg-blue-700 text-white"
        }`}
        onClick={() => window.history.back()}
      >
        Back to Search
      </motion.button>
    </motion.div>
  );
};

export default DetailMovie;
