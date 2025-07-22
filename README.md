# CS2 Memory Game

## About the Project

CS2 Memory Game is an interactive memory game inspired by Counter-Strike 2, built using Vue.js. The game involves matching pairs of tiles featuring weapons and skins from CS2. The project employs advanced canvas rendering techniques to create dynamic and responsive game tiles with visual effects.

### Key Features

- Four difficulty levels (Easy, Medium, Hard, Expert)
- Board generation based on seed (allows recreation of the same board)
- Responsive design optimized for both mobile and desktop devices
- Dynamic visual effects for tiles (parallax, gradient, shadows)
- Game statistics and history tracking
- Distinctive CS2 style with orange theme

## Technologies Used

The project utilizes the following main technologies and libraries:

- **Vue 3** - frontend UI framework
- **TypeScript** - statically typed JavaScript
- **Pinia** - state management library
- **Anime.js** - animation library
- **TailwindCSS** - CSS framework for styling
- **Canvas API** - for rendering game tiles
- **Vite** - fast build tool
- **seedrandom** - for generating deterministic random game boards
- **uuid** - unique identifier generation

## Installation and Usage

### Prerequisites

- Node.js (version 18 or newer)
- npm (Node.js package manager)

### Installation

```sh
# Clone the repository (if not already downloaded)
# git clone [repo-url] memory-game
# cd memory-game

# Install dependencies
npm install
```

### Running in Development Mode

```sh
npm run dev
```

The application will be available at http://localhost:5173

### Building for Production

```sh
npm run build
```

Compiled files will be available in the `dist` directory

### Running Production Preview

```sh
npm run preview
```

### Linting and Code Formatting

```sh
npm run lint     # Run ESLint
npm run format   # Format code using Prettier
```
