# Robo Run Web

A modern React-based web application built with Vite, TypeScript, and shadcn/ui.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.x or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** or **bun**
- **Git** - [Download Git](https://git-scm.com/)

### Recommended: Install Node.js using nvm

For easier Node.js version management, we recommend using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating):

```sh
# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 18
nvm install 18
nvm use 18
```

## 🚀 Installation

Follow these steps to set up the project on your local machine:

### Step 1: Clone the Repository

```sh
# Clone the repository using the project's Git URL
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd robo-run-web
```

### Step 2: Install Dependencies

Choose one of the following package managers:

**Using npm:**
```sh
npm install
```

**Using yarn:**
```sh
yarn install
```

**Using bun:**
```sh
bun install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory:

```sh
# Copy the example environment file (if it exists)
cp .env.example .env

# Or create a new .env file
touch .env
```

Edit the `.env` file with your API credentials:

```env
VITE_API_BASE_URL=https://2qlyp5edzh.execute-api.us-east-1.amazonaws.com
VITE_API_KEY=my-secret-api-key
VITE_AUTH_TOKEN=your-auth-token-here
```

### Step 4: Start the Development Server

```sh
# Using npm
npm run dev

# Using yarn
yarn dev

# Using bun
bun run dev
```

The development server will start on **http://localhost:8080**

## 🌐 Running on Other Devices (Local Network)

The server is configured to be accessible on your local network, allowing you to access the app from other devices (phones, tablets, other computers) connected to the same Wi-Fi network.

### Accessing from Other Devices

1. **Find your computer's local IP address:**

   **On macOS:**
   ```sh
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Or go to System Preferences → Network → Wi-Fi → Advanced → TCP/IP

   **On Windows:**
   ```sh
   ipconfig
   ```
   Look for "IPv4 Address" under your active network adapter

   **On Linux:**
   ```sh
   hostname -I
   ```
   Or
   ```sh
   ip addr show
   ```

2. **Start the development server:**
   ```sh
   npm run dev
   ```

3. **Access from other devices:**
   - Open a web browser on your phone/tablet/other computer
   - Navigate to: `http://YOUR_LOCAL_IP:8080`
   - Example: `http://192.168.1.100:8080`

### Troubleshooting Network Access

If you can't access the app from other devices:

1. **Check Firewall Settings:**
   - **macOS:** System Preferences → Security & Privacy → Firewall → Firewall Options → Allow incoming connections for Node
   - **Windows:** Windows Defender Firewall → Allow an app → Check Node.js
   - **Linux:** Configure firewall to allow port 8080:
     ```sh
     sudo ufw allow 8080
     ```

2. **Verify Network Connection:**
   - Ensure all devices are on the same Wi-Fi network
   - Try pinging your computer's IP from another device

3. **Check Vite Configuration:**
   - The `vite.config.ts` already has `host: "::"` which allows external connections
   - If issues persist, you can explicitly set the host:
     ```ts
     server: {
       host: '0.0.0.0', // or your specific IP
       port: 8080,
     }
     ```

## 📜 Available Scripts

- `npm run dev` - Start the development server (runs on port 8080)
- `npm run build` - Build the project for production
- `npm run build:dev` - Build the project in development mode
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## 🛠️ Development

### Project Structure

```
robo-run-web/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── store/         # Redux store and API
│   └── assets/        # Static assets
├── public/            # Public assets
└── package.json       # Dependencies and scripts
```

### Hot Module Replacement (HMR)

The development server supports Hot Module Replacement, so changes to your code will automatically refresh in the browser without a full page reload.

## 🏗️ Build for Production

To create a production build:

```sh
npm run build
```

The production files will be generated in the `dist/` directory. You can preview the production build locally with:

```sh
npm run preview
```

## 🔧 Troubleshooting

### Common Issues

**Port 8080 already in use:**
```sh
# Kill the process using port 8080
# On macOS/Linux:
lsof -ti:8080 | xargs kill -9

# On Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Dependencies installation fails:**
```sh
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```sh
# Restart TypeScript server in your IDE
# Or rebuild the project
npm run build
```

**Module not found errors:**
- Ensure all dependencies are installed: `npm install`
- Check that you're using the correct Node.js version (18.x or higher)
- Try deleting `node_modules` and reinstalling

**Can't access from other devices:**
- Verify firewall settings allow port 8080
- Ensure all devices are on the same network
- Check that the server is running with `host: "::"` in `vite.config.ts`
- Try accessing using your computer's local IP address instead of `localhost`

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_BASE_URL=https://2qlyp5edzh.execute-api.us-east-1.amazonaws.com
VITE_API_KEY=my-secret-api-key
VITE_AUTH_TOKEN=your-auth-token-here
```

**Note:** All environment variables in Vite must be prefixed with `VITE_` to be accessible in the browser.

### Environment Variables Template

If you need to create a `.env` file from scratch, use this template:

```env
# API Configuration
VITE_API_BASE_URL=your-api-base-url
VITE_API_KEY=your-api-key
VITE_AUTH_TOKEN=your-auth-token
```

## 🛠️ Technology Stack

This project is built with a modern frontend stack:

### Core Framework
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool and dev server

### UI & Styling
- **shadcn/ui** - Component library built on Radix UI
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **next-themes** - Theme switching (dark/light mode)

### State Management
- **Redux Toolkit 2.11.2** - Global state management
- **TanStack Query (React Query) 5.83.0** - Server state management

### Routing & Forms
- **React Router DOM 6.30.1** - Client-side routing
- **React Hook Form 7.61.1** - Form handling
- **Zod 3.25.76** - Schema validation

### Additional Libraries
- **Recharts** - Data visualization and charts
- **date-fns** - Date utility library
- **@dnd-kit** - Drag and drop functionality
- **jspdf** - PDF generation
- **sonner** - Toast notifications
