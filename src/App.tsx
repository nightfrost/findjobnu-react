import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./views/Home";
import Login from "./views/Login";
import Register from "./views/Register";
import Footer from "./components/Footer";
import Profile from "./views/Profile";
import LinkedInAuthHandler from "./views/LinkedInAuthHandler";
import { checkAndClearExpiredToken } from "./helpers/AuthHelper";
import { useUser, UserProvider } from "./context/UserContext";

const App: React.FC = () => {
  return (
    <UserProvider>
      <AppWithAuthCheck />
    </UserProvider>
  );
};

const AppWithAuthCheck: React.FC = () => {
  const { setUser } = useUser();
  useEffect(() => {
    checkAndClearExpiredToken(setUser);
    const interval = setInterval(() => {
      checkAndClearExpiredToken(setUser);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [setUser]);

  return (
    <Router>
      <div className="min-h-screen bg-base-200 flex flex-col">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/linkedin-auth" element={<LinkedInAuthHandler />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;