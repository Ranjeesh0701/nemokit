# Nemokit

> **Private, zero-latency developer utilities and vector design studio — 100% in-browser, offline-ready, and available as a Model Context Protocol (MCP) server.**

Nemokit is a modern utility suite engineered for everyday engineering workflows. Every calculation, transformation, and vector generation executes entirely in-memory on your device. Zero data leaves your browser, zero external API keys are required, and zero telemetry is collected.

In addition to the web app and PWA, Nemokit ships an **MCP Server** (`@nemokit/mcp`), enabling AI assistants (Claude Desktop, Cursor, Zed, Cline, Antigravity) to call 26 developer tools directly over local standard I/O (`stdio`).

---

## Features

- **100% Local & Private**: No analytics, no backend storage, no cloud telemetry. Safe for proprietary tokens, credentials, and schemas.
- **PWA & Offline-First**: Installable Progressive Web App powered by Service Workers with full offline support.
- **Model Context Protocol (MCP) Server**: 26 developer tools registered with strong Zod typing, executable locally by LLMs via `npx -y @nemokit/mcp`.
- **Keyboard-First Workflow**:
  - `⌘K` or `Ctrl+K`: Global command palette.
  - `⌘↵` or `Ctrl+↵`: Execute active tool.
  - `Esc`: Return to dashboard.
- **Modular Monorepo**: Decoupled core engine (`@nemokit/core`), standalone MCP package (`@nemokit/mcp`), and fast React 19 web app (`@nemokit/web`).

---

## Tool Directory

Nemokit includes 30+ dedicated workspaces organized across 6 functional categories:

### 1. Formatters & Diff

- **JSON Formatter & Minifier**: Validate, pretty-print, or minify JSON with configurable indentation (0–8 spaces).
- **SQL Formatter**: Beautify SQL queries with dialect support (PostgreSQL, MySQL, SQLite, Standard SQL) and keyword casing.
- **Diff & Text Comparator**: Line-by-line Myers diff algorithm with additions/deletions highlighting and whitespace toggle.
- **Base64 Encoder / Decoder**: Bi-directional UTF-8 and binary conversion with standard and URL-safe variants.
- **Data Format Converter**: Convert payloads between JSON, YAML, TOML, and XML.
- **Text Splitter**: Split long texts by line, word, delimiter, or character chunk size.
- **Markdown Studio**: Live preview with GFM formatting, syntax highlighting, and sanitized rendering.

### 2. JSON Schema & Mock Fixtures

- **JSON Schema Validator**: Validate JSON payloads against Draft-07 schemas with structured validation errors.
- **Mock Data Generator**: Synthesize realistic mock records from JSON schemas with smart heuristic detectors for emails, UUIDs, dates, and names.
- **JSON Schema Inferer**: Generate strict Draft-07 schemas automatically from sample JSON payloads.

### 3. Vector & SVG Studio

- **SVG Optimizer & Cleaner**: Strip XML bloat, Inkscape/Sketch editor namespaces, round coordinate precision, and export clean React JSX icons.
- **Logo & Brand Badge Studio**: Procedurally generate app icons and emblems across 19 container shapes (squircle, shield, hexagon, starburst, etc.) with SVG and high-res PNG export.
- **Repeating Pattern Generator**: Seamless CSS and SVG background patterns (isometric cubes, circuit, waves, dots, grids) with copyable data URLs.
- **Generative Random SVG Studio**: Algorithmic procedural graphics (organic fluid blobs, layered waves, pixel identicons, low-poly constellations).
- **Favicon Studio**: Multi-size favicon generation (.ico, .png, .svg) with browser preview.
- **Image to SVG Vectorizer**: Trace raster artwork into scalable vector paths.

### 4. Cryptography & Security

- **Cryptographic Hash**: Generate SHA-256, SHA-512, SHA-1, SHA-384, MD5, and HMAC signatures with custom secret keys.
- **UUID & NanoID Generator**: Generate cryptographically random UUIDv4, timestamp-ordered UUIDv7, and URL-friendly NanoIDs.
- **JWT Decoder**: Inspect JSON Web Token headers and payload claims with expiration date analysis.
- **Password & Passphrase Generator**: High-entropy random passwords and Diceware multi-word passphrases.
- **File Checksum Verifier**: Calculate hash digests of local files without uploading to external servers.

### 5. Web & Network

- **cURL Converter**: Convert cURL syntax into modern JavaScript `fetch`, `axios`, Python `requests`, or Node.js HTTP.
- **URL Parser**: Parse protocols, hosts, ports, paths, hash fragments, and inspect query parameter key-value pairs.
- **QR Code Studio**: Render high-density QR codes to vector SVG, canvas, or copyable data URLs with error correction.
- **HTTP Status & Headers Reference**: Interactive reference guide for status codes (100–599) and RFC headers with CORS and caching guidelines.
- **WCAG Contrast Checker**: Evaluate WCAG 2.1 color contrast ratios with AA and AAA accessibility ratings.

### 6. System & Utilities

- **Unix Permissions (chmod)**: Convert between octal notation (`755`) and symbolic strings (`rwxr-xr-x`).
- **Timestamp & Epoch Converter**: Convert between Unix epoch (seconds/milliseconds), ISO-8601, and RFC-2822 dates.
- **Cron Expression Explainer**: Translate 5-part cron schedules into human-readable English with upcoming execution previews.
- **Regex Tester**: Test regular expressions with real-time match group highlighting and flag controls.
- **Color Converter**: Convert color values between HEX, RGB, HSL, and HSV models.
- **PDF Splitter & Merger**: Client-side PDF page extraction and document merging powered by `pdf-lib`.
- **Image Studio**: Client-side background removal, image redaction/blurring, and format conversion (WebP, PNG, JPEG).

---

## Model Context Protocol (MCP) Integration

Nemokit exposes 26 developer tools directly to LLMs through its official `@nemokit/mcp` package using the Model Context Protocol over standard I/O (`stdio`).

### Claude Desktop

Add the following to your `claude_desktop_config.json`:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nemokit": {
      "command": "npx",
      "args": ["-y", "@nemokit/mcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` or open Cursor Settings > Features > MCP:

```json
{
  "mcpServers": {
    "nemokit": {
      "command": "npx",
      "args": ["-y", "@nemokit/mcp"]
    }
  }
}
```

### Zed

Add to `~/.config/zed/settings.json`:

```json
{
  "context_servers": [
    {
      "id": "nemokit",
      "command": "npx",
      "args": ["-y", "@nemokit/mcp"]
    }
  ]
}
```

### Run Directly via CLI

```bash
npx -y @nemokit/mcp
```

---

## Monorepo Architecture

```
nemokit/
├── apps/
│   └── web/              # React 19 + Vite + Tailwind CSS v4 PWA
│       ├── src/
│       │   ├── components/
│       │   │   ├── layout/   # AppSidebar, AppHeader
│       │   │   ├── views/    # 30+ dedicated tool views + McpServerView
│       │   │   └── landing/  # Product landing page
│       │   └── hooks/        # useToolFavorites, usePwaInstall
└── packages/
    ├── core/             # Pure TypeScript tools logic, types, and registry
    │   └── src/
    │       ├── tools/        # 26+ decoupled tool implementations
    │       └── registry.ts   # ToolRegistry catalog
    └── mcp/              # Standard Model Context Protocol (MCP) server
        └── src/
            ├── cli.ts        # Executable binary entry point (stdio)
            └── server.ts     # Registered MCP tools & Zod schemas
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or later
- **npm**: `v9.0.0` or later

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/nemokit.git
cd nemokit
npm install
```

### Development

Start the web development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Type Checking

Run TypeScript type checks across all workspaces:

```bash
npm run typecheck
```

### Unit Tests

Run the Vitest test suite across all packages:

```bash
npm test
```

### Production Build

Compile all packages and build the optimized production web assets:

```bash
npm run build
```

### Code Formatting

Check and apply Prettier code formatting:

```bash
npm run format:check   # Verify formatting
npm run format         # Auto-format all files
```

---

## Privacy & Security Guarantee

1. **Zero Network Transmission**: All operations (including cryptography, schema validation, PDF generation, and image manipulation) occur entirely in client-side JavaScript or local Node.js processes.
2. **Zero Storage of Inputs**: Data pasted into any input field exists only in transient component state.
3. **Open & Auditable**: The core engine contains no obfuscation, external phone-home requests, or third-party trackers.

---

## License

MIT © [Nemokit](https://github.com/your-username/nemokit)
