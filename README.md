# FindJob.nu – Job Search Website

FindJob.nu is a modern job search web application built with **React**, **TypeScript**, and **Vite**. It allows users to search, filter, and browse job postings with a fast and responsive UI.

## Features

- 🔍 **Search** for jobs by keyword, location, and category  
- 📄 **Browse** paginated job listings with detailed descriptions  
- 🎨 **Modern UI** using [Tailwind CSS](https://tailwindcss.com/) and [daisyUI](https://daisyui.com/)  
- ⚡ **Fast development** with [Vite](https://vitejs.dev/)  
- 🔗 **API integration** with [OpenAPI-generated client](https://findjob.nu/swagger/v1/swagger.json)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)

### Installation

```sh
npm install
```

### Development

Start the development server:

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

To build for production:

```sh
npm run build
```

### Lint

To run ESLint:

```sh
npm run lint
```

## API Client

The API client is generated using [OpenAPI Generator](https://openapi-generator.tech/):

```sh
npx @openapitools/openapi-generator-cli generate -i https://findjob.nu/swagger/v1/swagger.json -g typescript-fetch -o ./findjobnu-api
```

## Project Structure

```
src/
  components/      # Reusable UI components (Navbar, Footer, JobList, SearchForm)
  views/           # Page components (Home)
  findjobnu-api/   # OpenAPI-generated API client
  assets/          # Static assets
  App.tsx          # Main app component
  main.tsx         # Entry point
```

## Technologies

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [daisyUI](https://daisyui.com/)
- [OpenAPI Generator](https://openapi-generator.tech/)

## License

MIT

---

© {2025} FindJob.nu. All rights reserved.
