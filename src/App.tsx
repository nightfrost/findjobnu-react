import React from "react";
import Navbar from "./components/Navbar";
import Home from "./views/Home";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <Home />
    </div>
  );
};

export default App;