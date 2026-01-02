import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./views/Home";
import Login from "./views/Login";
import Register from "./views/Register";
import Footer from "./components/Footer";
import Profile from "./views/Profile";
import JobSeeker from "./views/JobSeeker";
import LinkedInAuthHandler from "./views/LinkedInAuthHandler";
import { checkAndClearExpiredToken } from "./helpers/AuthHelper";
import { useUser } from "./context/UserContext.shared";
import { UserProvider } from "./context/UserContext";
import JobSearch from "./views/JobSearch";
import MyJobs from "./views/MyJobs";
import GoodCv from "./views/GoodCv";
import About from "./views/About";
import Contact from "./views/Contact";
import PrivacyPolicy from "./views/PrivacyPolicy";
import CookieInformation from "./views/CookieInformation";
import Sitemap from "./views/Sitemap";

const App: React.FC = () => {
  return (
    <Router>
      <UserProvider>
        <AppWithAuthCheck />
      </UserProvider>
    </Router>
  );
};

const AppWithAuthCheck: React.FC = () => {
  const { setUser } = useUser();
  const location = useLocation();
  useEffect(() => {
    checkAndClearExpiredToken(setUser);
    const interval = setInterval(() => {
      checkAndClearExpiredToken(setUser);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [setUser]);

  // Scroll to top on route change to reinforce the transition and avoid mid-page jumps
  useEffect(() => {
    globalThis.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-base-300 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper pathKey={location.pathname}><Home /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper pathKey={location.pathname}><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper pathKey={location.pathname}><Register /></PageWrapper>} />
            <Route path="/jobseeker" element={<PageWrapper pathKey={location.pathname}><JobSeeker /></PageWrapper>} />
            <Route path="/arbejdssogende" element={<PageWrapper pathKey={location.pathname}><JobSeeker /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper pathKey={location.pathname}><Profile /></PageWrapper>} />
            <Route path="/profile/linkedin-auth" element={<PageWrapper pathKey={location.pathname}><LinkedInAuthHandler /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper pathKey={location.pathname}><About /></PageWrapper>} />
            <Route path="/contact" element={<PageWrapper pathKey={location.pathname}><Contact /></PageWrapper>} />
            <Route path="/jobsearch" element={<PageWrapper pathKey={location.pathname}><JobSearch /></PageWrapper>} />
            <Route path="/myjobs" element={<PageWrapper pathKey={location.pathname}><MyJobs /></PageWrapper>} />
            <Route path="/cv" element={<PageWrapper pathKey={location.pathname}><GoodCv /></PageWrapper>} />
            <Route path="/privatlivspolitik" element={<PageWrapper pathKey={location.pathname}><PrivacyPolicy /></PageWrapper>} />
            <Route path="/cookie-information" element={<PageWrapper pathKey={location.pathname}><CookieInformation /></PageWrapper>} />
            <Route path="/sitemap" element={<PageWrapper pathKey={location.pathname}><Sitemap /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

const PageWrapper: React.FC<{ children: React.ReactNode; pathKey: string }> = ({ children, pathKey }) => (
  <motion.div
    key={pathKey}
    className="min-h-full"
    initial={{ opacity: 0, x: 36, scale: 0.995 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: -36, scale: 0.997 }}
    transition={{ duration: 0.28, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default App;