# GitHub Profile Visualizer

A powerful web application that transforms GitHub profiles into beautiful, interactive visualizations and professional CVs. Built with modern web technologies to provide deep insights into GitHub activity, coding patterns, and contributions.

## ✨ Features

- 📊 Interactive GitHub profile visualization
- 📑 PDF CV generation from GitHub data
- 🔍 Detailed language statistics and breakdown
- 📈 Contribution activity heatmap
- 🌟 Top repositories showcase
- 🎨 Dark/Light theme support
- 📱 Fully responsive design

## 🛠️ Tech Stack

- **Frontend Framework**: [Next.js 14](https://nextjs.org/) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Data Visualization**: 
  - [Recharts](https://recharts.org/) for charts and graphs
  - [React-PDF](https://react-pdf.org/) for PDF generation
- **State Management**: React Hooks
- **API Integration**: GitHub REST API
- **Authentication**: GitHub OAuth
- **Deployment**: Vercel (recommended)

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18.17.0 or higher)
- npm (comes with Node.js)
- GitHub Personal Access Token

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/github-profile-visualizer.git
cd github-profile-visualizer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your GitHub token to `.env.local`:
```
GITHUB_ACCESS_TOKEN=your_github_token_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔑 GitHub Token Setup

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Generate new token with the following scopes:
   - `read:user`
   - `repo`
   - `user`

## 📁 Project Structure

```
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── components/         # React components
├── lib/               # Utility functions and API
├── public/            # Static assets
└── styles/            # Global styles
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Core Features Explained

### Profile Visualization
- Comprehensive GitHub profile overview
- Interactive language distribution charts
- Contribution activity heatmap
- Repository statistics and insights

### CV Generation
- Professional PDF CV generation
- Automatic skills extraction from repositories
- Project highlights and contributions
- Contact information and social links

### Data Analysis
- Language usage statistics
- Contribution patterns
- Activity trends
- Repository impact metrics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [GitHub API](https://docs.github.com/en/rest) for providing the data
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for hosting and deployment

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.
