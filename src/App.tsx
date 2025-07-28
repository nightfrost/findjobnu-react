import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./views/Home";
import Login from "./views/Login";
import Register from "./views/Register";
import Footer from "./components/Footer";
import Profile from "./views/Profile";
import { checkAndClearExpiredToken } from "./helpers/AuthHelper";

const App: React.FC = () => {
  // Check for expired token on app initialization and periodically
  useEffect(() => {
    // Check immediately when app loads
    checkAndClearExpiredToken();

    // Set up interval to check every 5 minutes
    const interval = setInterval(() => {
      checkAndClearExpiredToken();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-base-200 flex flex-col">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile/>} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;