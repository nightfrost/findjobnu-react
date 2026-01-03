import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType, Navigate } from "react-router-dom";
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
  const navigationType = useNavigationType();
  const [direction, setDirection] = useState<"forward" | "back" | "neutral">("neutral");
  const previousIndexRef = useRef<number | null>(null);
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

  useEffect(() => {
    const raw = sessionStorage.getItem("fj-nav-history");
    let history: { counter: number; map: Record<string, number> } = { counter: 0, map: {} };
    try {
      history = raw ? JSON.parse(raw) : history;
    } catch {
      history = { counter: 0, map: {} };
    }

    const existingIndex = history.map[location.key];
    let nextIndex = existingIndex;

    if (nextIndex == null) {
      history.counter += 1;
      nextIndex = history.counter;
      history.map[location.key] = nextIndex;
      sessionStorage.setItem("fj-nav-history", JSON.stringify(history));
    }

    const prev = previousIndexRef.current;

    if (prev == null) {
      setDirection("neutral");
    } else if (nextIndex < prev) {
      setDirection("back");
    } else if (nextIndex > prev) {
      setDirection("forward");
    } else {
      setDirection(navigationType === "POP" ? "back" : "neutral");
    }

    previousIndexRef.current = nextIndex;
  }, [location.key, navigationType]);

  return (
    <div className="min-h-screen bg-base-300 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper direction={direction} pathKey={location.pathname}><Home /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper direction={direction} pathKey={location.pathname}><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper direction={direction} pathKey={location.pathname}><Register /></PageWrapper>} />
            <Route path="/jobseeker" element={<PageWrapper direction={direction} pathKey={location.pathname}><JobSeeker /></PageWrapper>} />
            <Route path="/arbejdssogende" element={<PageWrapper direction={direction} pathKey={location.pathname}><JobSeeker /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper direction={direction} pathKey={location.pathname}><Profile /></PageWrapper>} />
            <Route path="/settings" element={<Navigate to="/profile?panel=settings" replace />} />
            <Route path="/profile/linkedin-auth" element={<PageWrapper direction={direction} pathKey={location.pathname}><LinkedInAuthHandler /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper direction={direction} pathKey={location.pathname}><About /></PageWrapper>} />
            <Route path="/contact" element={<PageWrapper direction={direction} pathKey={location.pathname}><Contact /></PageWrapper>} />
            <Route path="/jobsearch" element={<PageWrapper direction={direction} pathKey={location.pathname}><JobSearch /></PageWrapper>} />
            <Route path="/myjobs" element={<PageWrapper direction={direction} pathKey={location.pathname}><MyJobs /></PageWrapper>} />
            <Route path="/cv" element={<PageWrapper direction={direction} pathKey={location.pathname}><GoodCv /></PageWrapper>} />
            <Route path="/privatlivspolitik" element={<PageWrapper direction={direction} pathKey={location.pathname}><PrivacyPolicy /></PageWrapper>} />
            <Route path="/cookie-information" element={<PageWrapper direction={direction} pathKey={location.pathname}><CookieInformation /></PageWrapper>} />
            <Route path="/sitemap" element={<PageWrapper direction={direction} pathKey={location.pathname}><Sitemap /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

const PageWrapper: React.FC<{ children: React.ReactNode; pathKey: string; direction: "forward" | "back" | "neutral" }> = ({ children, pathKey, direction }) => {
  const { initialX, exitX } = useMemo(() => {
    if (direction === "back") return { initialX: -36, exitX: 36 };
    if (direction === "forward") return { initialX: 36, exitX: -36 };
    return { initialX: 0, exitX: 0 };
  }, [direction]);

  return (
    <motion.div
      key={pathKey}
      className="min-h-full"
      initial={{ opacity: 0, x: initialX, scale: 0.995 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: exitX, scale: 0.997 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default App;