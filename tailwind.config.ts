import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [daisyui],
  daisyui: {
    themes: ["dracula"],
  },
};

export default config as Config;