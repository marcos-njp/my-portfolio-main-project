export interface Project {
  title: string
  description: string
  image: string
  githubLink: string
  liveLink?: string
  tags: string[]
}

export const projects: Project[] = [
  {
    title: "Person Search",
    description: "OAuth-secured Next.js 15.5 application with Google authentication, Prisma ORM, and PostgreSQL. Features protected routes, database-backed CRUD operations, and comprehensive security documentation.",
    image: "https://v1.screenshot.11ty.dev/https%3A%2F%2Fm-njp-person-search.vercel.app/opengraph/",
    githubLink: "https://github.com/marcos-njp/person-search",
    liveLink: "https://m-njp-person-search.vercel.app",
    tags: ["Next.js 15.5", "React 19", "OAuth 2.0", "Prisma", "PostgreSQL", "TypeScript"]
  },
  {
    title: "My CV Portfolio",
    description: "Modern, responsive portfolio website with dark/light mode, smooth animations, and professional layout. Single-page design showcasing projects, skills, and experience with Next.js 15.",
    image: "https://v1.screenshot.11ty.dev/https%3A%2F%2Fm-njp-simple.vercel.app/opengraph/",
    githubLink: "https://github.com/marcos-njp/my-cv",
    liveLink: "https://m-njp-simple.vercel.app",
    tags: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Shadcn UI"]
  },
  {
    title: "AI Agent Dev Setup",
    description: "Development environment verification for AI Agent workshop. Demonstrates MCP (Model Context Protocol) integration with Claude Desktop, including 5 connected servers for RAG, GitHub, and CRUD operations.",
    image: "/images/placeholder-mcp.svg",
    githubLink: "https://github.com/marcos-njp/ai-agent-dev-setup-marcosnjp",
    tags: ["MCP", "Claude Desktop", "AI Agents", "Node.js", "GitHub Copilot"]
  },
  {
    title: "Movie App",
    description: "Laravel-based web application for browsing and managing movies. Built with PHP, MySQL, and Laravel framework demonstrating backend development skills and database management.",
    image: "/images/placeholder-movie.svg",
    githubLink: "https://github.com/marcos-njp/movie-app",
    tags: ["Laravel", "PHP", "MySQL", "Backend"]
  }
]
