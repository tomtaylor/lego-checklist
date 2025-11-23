# LEGO Checklist

A simple single-page React application that helps you track LEGO parts as you build your sets.

## Features

- 🔍 **Search by Set Number**: Enter any LEGO set number (e.g., `75192-1`) to load the parts list
- ✅ **Interactive Checklist**: Check off parts as you find them during your build
- 🖼️ **Part Images**: Visual reference for each part from the Rebrickable database
- 💾 **Persistent State**: Your progress is automatically saved in your browser's localStorage
- 📊 **Progress Tracking**: See your completion percentage with a visual progress bar
- 🎨 **Clean UI**: Modern, responsive design built with Tailwind CSS

## Technology Stack

- **React 18**: User interface framework
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Rebrickable API**: LEGO parts database
- **localStorage**: Client-side persistence

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root (you can copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Add your Rebrickable API key to the `.env` file:
   ```
   REACT_APP_REBRICKABLE_API_KEY=your_api_key_here
   ```
   
   Get your free API key from [Rebrickable](https://rebrickable.com/api/)

### Development

Run the development server:

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Production Build

Create an optimized production build:

```bash
npm run build
```

The static files will be generated in the `build/` folder, ready to be deployed to any static hosting service (Netlify, Vercel, GitHub Pages, AWS S3, etc.).

### Deployment

Since this is a fully client-side application, you can deploy it to any static hosting service:

**Using serve (local testing):**
```bash
npm install -g serve
serve -s build
```

**Using Netlify:**
- Drag and drop the `build` folder to Netlify

**Using GitHub Pages:**
- Add `"homepage": "https://yourusername.github.io/lego-checklist"` to package.json
- Use a deployment tool like `gh-pages`

## How to Use

1. **Enter a Set Number**: Type a LEGO set number in the format shown (e.g., `75192-1`, `10294-1`)
2. **Load the Set**: Click "Load Set" to fetch the parts list from Rebrickable
3. **Check Off Parts**: As you build, check the boxes next to each part you've found
4. **Track Progress**: Watch the progress bar at the top fill up as you complete your set
5. **Resume Anytime**: Your progress is automatically saved - refresh the page and load the same set to continue where you left off

## API Information

This application uses the [Rebrickable API](https://rebrickable.com/api/v3/docs/) to fetch LEGO set data. You'll need a free API key from Rebrickable:

1. Create a free account at [Rebrickable.com](https://rebrickable.com/)
2. Go to your [API settings](https://rebrickable.com/users/{yourusername}/settings/#api) to get your API key
3. Add the key to your `.env` file as `REACT_APP_REBRICKABLE_API_KEY`

**Note:** The API key is used for direct client-side calls, so it will be visible in the browser. Rebrickable API keys are free and rate-limited, so this is acceptable for personal use.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- LEGO parts data provided by [Rebrickable](https://rebrickable.com/)
- Built with Create React App and Tailwind CSS

