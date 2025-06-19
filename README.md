# 🚀 Claude Kickstart

**Save 30-45 minutes on every new project!** Generate perfect `claude-kickstart.md` files that make Claude Code's `/init` command work flawlessly.

## 🎯 What is this?

Claude Kickstart is a CLI tool that generates highly detailed setup instructions for Claude Code. Instead of spending 30+ minutes explaining your project structure, dependencies, and preferences to Claude, this tool asks you 15 smart questions and generates a complete project blueprint in < 3 minutes.

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/tfolkman/claude-kickstart.git

# Navigate to the project
cd claude-kickstart

# Install dependencies
npm install

# Make it available globally on your system
npm link

# Verify installation
claude-kickstart --version
```

Now you can use `claude-kickstart` or `ck` from any project directory!

## 🚀 Quick Start

### First Time Setup (Interactive Mode)
```bash
# Navigate to your new project directory
cd my-awesome-project

# Run Claude Kickstart
claude-kickstart

# Answer the questions, get your perfect setup file!
```

### Using Saved Profiles (After First Use)
```bash
# See all your saved profiles
ck -p

# Use a specific profile
ck -p nextjs-typescript

# Use your last configuration
ck -q
```

## 📖 Complete Usage Guide

### The Setup Process

1. **Start the Tool**
   ```bash
   claude-kickstart
   ```

2. **Choose Your Action**
   - 🚀 **Start new project setup** - Answer questions for a new project
   - 📁 **Use saved profile** - Reuse a previous configuration
   - ⚡ **Quick setup** - Uses your last configuration instantly

3. **Answer Questions** (New Setup)
   The tool will ask about:
   - Project type (Full-Stack, Backend, Frontend, etc.)
   - Tech stack (Next.js, Express, FastAPI, etc.)
   - Language preference (TypeScript, JavaScript, Python, etc.)
   - Database choice
   - Authentication strategy
   - Styling approach
   - Testing framework
   - Deployment target
   - Code style preferences
   - How you want Claude to work with you

4. **Save Your Profile** (Optional but Recommended)
   - Give it a memorable name like `nextjs-saas` or `express-api`
   - Reuse it for similar projects

5. **Get Your File**
   - Creates `claude-kickstart.md` in your current directory
   - This file contains everything Claude needs to know!

### Using with Claude Code

1. Open your project in Claude Code
2. Run the magic command:
   ```
   /init examine claude-kickstart.md
   ```
   **Note**: This tells Claude to use your generated setup file instead of creating its own
3. Claude will read your `claude-kickstart.md` and set up everything perfectly!

### Pro Workflow 🏆

```bash
# 1. Create new project directory
mkdir my-new-saas && cd my-new-saas

# 2. Generate setup file
ck -p nextjs-saas  # Using a saved profile

# 3. Open in Claude Code
claude .

# 4. In Claude Code, run:
# /init examine claude-kickstart.md

# 5. Watch Claude create your entire project structure in minutes!
```

## 💡 Power User Tips

### 1. Profile Naming Strategy
Create profiles for your common project types:
- `nextjs-saas` - Your go-to SaaS starter
- `express-api` - Quick REST API setup
- `react-landing` - Marketing landing pages
- `python-ml` - Data science projects

### 2. Quick Commands
```bash
# See all available options
ck --help

# Quick setup with last config (fastest!)
ck -q

# List all profiles (when you forget names)
ck -p
```

### 3. Reference Your Setup Anytime
In Claude Code, you can always reference your setup:
```
@claude-kickstart.md
```
This reminds Claude about your project preferences!

### 4. Modify Generated Files
The generated `claude-kickstart.md` is just markdown - feel free to edit it before running `/init` if you want to tweak anything!

### 5. Team Collaboration
Share profiles with your team:
1. Your profiles are saved in `~/.claude-kickstart/profiles/`
2. Share the JSON files with teammates
3. They can place them in the same directory

## 🛠️ Supported Tech Stacks

### Full-Stack
- Next.js 14 (App/Pages Router)
- Remix
- T3 Stack
- MERN/MEAN Stack

### Backend
- Node.js (Express/Fastify)
- Python (FastAPI/Django)
- Go (Gin)
- Ruby on Rails

### Frontend
- React
- Vue.js
- Svelte
- Angular
- Vanilla JS

### Databases
- PostgreSQL
- MySQL
- MongoDB
- SQLite
- Supabase
- Firebase

### And Much More!
- Authentication (NextAuth, Clerk, Auth0, etc.)
- Styling (Tailwind, CSS Modules, Styled Components, etc.)
- Testing (Jest, Vitest, Playwright, Cypress, etc.)
- Component Libraries (shadcn/ui, MUI, Mantine, etc.)

## 🔧 Troubleshooting

### "Command not found" after installation
```bash
# Make sure you ran npm link
cd claude-kickstart
npm link

# Verify it's in your PATH
which claude-kickstart
```

### Want to uninstall?
```bash
# Remove global link
npm unlink -g claude-kickstart

# Delete the project folder
rm -rf path/to/claude-kickstart
```

### Profiles not saving?
- Check permissions for `~/.claude-kickstart/`
- Make sure you have write access to your home directory

## 🎓 Example Scenarios

### Scenario 1: Starting a New SaaS
```bash
cd my-saas-app
ck  # Start fresh
# Choose: Full-Stack → Next.js 14 → TypeScript → PostgreSQL → Clerk → Tailwind → shadcn/ui
# Save as: "saas-starter"
```

### Scenario 2: Quick API
```bash
cd api-service
ck -p express-api  # Use existing profile
# Done in 5 seconds!
```

### Scenario 3: Client Project
```bash
cd client-website
ck -q  # Use whatever you used last time
```

## 📊 Time Savings Calculator

- Manual setup explanation to Claude: ~30-45 minutes
- With Claude Kickstart: ~3 minutes
- **You save: 27-42 minutes per project!**

If you create 2 projects per week, that's **2-3 hours saved weekly**!

## 🤝 Contributing

Found a bug or want a new feature? Open an issue on GitHub!

## 📄 License

Copyright (c) 2024 Tyler Folkman

This source code is made available for viewing and educational purposes only.
Commercial use, modification, or redistribution requires a paid license.
Visit tylerfolkman.substack.com for licensing details.

---

**Remember:** The goal is a perfect development environment in < 5 minutes. This tool gets you there! 🚀
