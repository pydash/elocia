
# How to Run the App

This document shows how to run the two main pieces in this repository:

- The desktop app: `apps/student-desktop/desktop` (Python)
- The web app: `apps/web` (React + Vite + TypeScript)

Prerequisites
 - macOS / Linux / Windows WSL
 - Node.js (recommended >= 18) and npm
 - Python 3.10+ and pip

1) Desktop (student-desktop)

Path: `apps/student-desktop/desktop`

Steps:
```zsh
# change to the /student-desktop/frontend folder
cd "YOUR_PATH/elocia-app/apps/student-desktop/frontend"

# install node dependencies
npm install

# run the dev server (Vite)
# make sure this is running on background before starting the desktop app
# the port is 5173
npm run dev

# open a new terminal and change to the desktop app folder
cd "YOUR_PATH/elocia-app/apps/student-desktop/desktop"

# create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# run the desktop application
python main.py
```

Notes:
 - If you're on Windows, activate the virtualenv with `.venv\Scripts\activate` instead of `source`.
 - If `main.py` expects environment variables or extra files, check the `desktop/README.md` (if present)

2) Web (apps/web)

Path: `apps/web`

Steps (development):

```zsh
# change to the web app folder
cd "YOUR_PATH/elocia-app/apps/web"

# install node dependencies
npm install

# run the dev server (Vite)
# the port is 5174
npm run dev
```

The dev server will print a local URL (by default http://localhost:5174). Open that in your browser.

Steps (build and preview):

```zsh
cd "YOUR_PATH/elocia-app/apps/web"

# build (TypeScript is compiled as part of this script)
npm run build

# preview the production build locally
npm run preview
```

Troubleshooting
 - If `npm install` fails, check your Node.js and npm versions and delete `node_modules` then retry.
 - If TypeScript build errors occur during `npm run build`, run `npm run build` from the `apps/web` folder and read the error output — it will typically point to the file and line to fix.