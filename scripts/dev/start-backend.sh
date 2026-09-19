#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
VENV_UVICORN="${BACKEND_DIR}/.venv/bin/uvicorn"

if [[ ! -d "${BACKEND_DIR}" ]]; then
    echo "Error: backend directory not found at ${BACKEND_DIR}" >&2
    exit 1
fi

if [[ ! -x "${VENV_UVICORN}" ]]; then
    echo "Error: backend virtual environment is missing or incomplete." >&2
    echo "Expected Uvicorn at ${VENV_UVICORN}" >&2
    echo "Create it and install backend/requirements.txt first." >&2
    exit 1
fi

if [[ -z "${DATABASE_URL:-}" && ! -f "${BACKEND_DIR}/.env" ]]; then
    echo "Error: DATABASE_URL is not set and ${BACKEND_DIR}/.env does not exist." >&2
    echo "Set DATABASE_URL or create backend/.env before starting the backend." >&2
    exit 1
fi

cd "${BACKEND_DIR}"
exec "${VENV_UVICORN}" app.main:app --reload --host 0.0.0.0 --port 8000
