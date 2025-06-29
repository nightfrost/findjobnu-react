import React from "react";

const Footer: React.FC = () => (
  <footer className="mt-8 py-4 text-center text-gray-500 border-t">
    © {new Date().getFullYear()} Rosenørn Solutions. All rights reserved.
  </footer>
);

export default Footer;