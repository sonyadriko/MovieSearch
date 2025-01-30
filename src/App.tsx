import React, { useState } from "react";
import { motion } from "framer-motion";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MovieSearch from "./components/MovieSearch";
import DetailMovie from "./components/DetailMovie";
import { FiMoon, FiSun } from "react-icons/fi"; // Import the icons
import "./App.css";

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <Router>
      <div
        className={`flex flex-col min-h-screen ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`py-6 shadow-lg ${
            isDarkMode ? "bg-gray-800" : "bg-gray-200"
          }`}
        >
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold">Movie Search App</h1>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className={`px-4 py-2 rounded shadow ${
                isDarkMode ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
              }`}
            >
              {isDarkMode ? <FiSun size={24} /> : <FiMoon size={24} />} {/* Use icons */}
            </motion.button>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/" element={<MovieSearch isDarkMode={isDarkMode} />} />
            <Route path="/movie/:imdbID" element={<DetailMovie isDarkMode={isDarkMode} />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className={`py-4 ${isDarkMode ? "bg-gray-800" : "bg-gray-200"} text-center`}>
          <div className="container mx-auto px-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Movie Search App. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;