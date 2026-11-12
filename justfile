# Copyright 2026 Delphi Tech. All Rights Reserved.
# Author: pstefanou12@
#
# Task runner for pstefanou12.github.io. Every recipe wraps npm, tsc or
# python, so local runs and CI (.github/workflows/pages.yml) do the same thing.

set shell := ["bash", "-euo", "pipefail", "-c"]
set positional-arguments

# Static pages served as they are, beside the built React apps.
static := "index.html css img js resources mma"

# List the recipes.
default:
    @just --list

# Install every workspace's dependencies from the lockfile.
install:
    npm ci

# Serve the delphi.ai docs with hot reload.
dev:
    npm run dev -w delphi-docs

# Build every app: the MMA scripts (tsc) and the delphi.ai docs (Vite).
build:
    npm run build
    npm run build -w delphi-docs

# Assemble _site/, exactly what GitHub Pages serves.
site: build
    rm -rf _site && mkdir _site
    cp -r {{static}} _site/
    cp -r apps/delphi-docs/dist _site/delphi

# Serve _site/ at http://localhost:8000/ (the docs at /delphi/).
preview port="8000": site
    python3 -m http.server "{{port}}" -d _site

# ESLint (gts) over the TypeScript, plus the CSS file headers.
lint: css-headers
    npx eslint .

# Apply ESLint's and Prettier's fixes.
fmt:
    npx eslint --fix .

# Type-check every workspace.
typecheck:
    npm run typecheck

# Unit tests of every workspace; extra arguments go to Vitest.
test *ARGS:
    npm run test --workspaces --if-present -- "$@"

# Browser smoke test of the assembled site.
e2e: site
    npx playwright test -c apps/delphi-docs/playwright.config.ts

# Everything CI checks before building.
check: lint typecheck test

# Regenerate the API manifest from delphi.ai (DELPHI_REF=<branch> for unmerged work).
docs-api delphi_ai=env_var_or_default("DELPHI_AI", "~/delphi.ai"):
    poetry -C {{delphi_ai}} run python "$PWD/apps/delphi-docs/scripts/extract_api.py" \
        --out "$PWD/apps/delphi-docs/src/generated/api.json" \
        ${DELPHI_REF:+--ref "$DELPHI_REF"}

# Every CSS file under packages/ and apps/ opens with the house header.
css-headers:
    #!/usr/bin/env bash
    set -euo pipefail
    missing=0
    for f in $(git ls-files --cached --others --exclude-standard 'packages/*.css' 'apps/*.css'); do
        if ! head -6 "$f" | grep -q '@fileoverview' || ! head -6 "$f" | grep -qE 'Copyright [0-9]{4} Delphi Tech\. All Rights Reserved\.' || ! head -6 "$f" | grep -q 'Author: '; then
            echo "missing file header: $f"; missing=1
        fi
    done
    exit $missing
