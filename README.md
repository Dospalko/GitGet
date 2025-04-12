# GitHub Profile Visualizer

A web application that visualizes GitHub profiles and generates PDF CVs from GitHub data. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📊 GitHub profile visualization
- 📑 PDF CV generation from GitHub data
- 📱 Responsive design
- 🌓 Dark/Light mode support
- 📊 Language statistics
- 📈 Activity graphs

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18.17.0 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Git](https://git-scm.com/)

## Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/github-profile-visualizer.git
   cd github-profile-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create a .env.local file in the root directory
   cp .env.example .env.local

   # Add your GitHub Personal Access Token to .env.local
   GITHUB_ACCESS_TOKEN=your_github_token_here
   ```

   To create a GitHub Personal Access Token:
   1. Go to GitHub Settings > Developer Settings > Personal Access Tokens
   2. Generate a new token with the following scopes:
      - `read:user`
      - `repo`
      - `user`

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
├── app/                  # Next.js app directory
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and types
├── public/             # Static assets
└── styles/             # Global styles
```

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [React-PDF](https://react-pdf.org/) - PDF generation
- [Recharts](https://recharts.org/) - Data visualization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [GitHub API](https://docs.github.com/en/rest) for providing the data
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components