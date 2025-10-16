# Noodle Seed ChatGPT App

**Get Your Business on ChatGPT in Minutes**

A production-ready ChatGPT app built with OpenAI's Apps SDK and Model Context Protocol (MCP). Features rich, interactive React widgets that showcase Noodle Seed's platform for helping businesses reach 800M+ ChatGPT users.

**Implementation follows official OpenAI patterns** from [openai/openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples), specifically the `pizzaz_server_python` reference implementation.

## Features

- 🎨 **4 Interactive Widgets** - Beautiful React components with shared styling
- 🚀 **OpenAI Best Practices** - Follows official design guidelines (max 2 CTAs, no nested scrolling, WCAG AA)
- 🔧 **MCP Server** - FastMCP-based server with proper widget resource registration
- 🌐 **Production Ready** - FastAPI + fly.io deployment
- 📦 **Modern Tooling** - TypeScript, esbuild, uv for Python

## Project Structure

```
noodleseed/
├── server/
│   ├── noodleseed_app.py    # MCP server with tools and widget resources (main)
│   └── simple_app.py        # Simplified example with inline HTML (reference)
├── web/
│   ├── src/
│   │   ├── common/           # Shared styles and types
│   │   ├── GetStarted.tsx    # Service overview widget
│   │   ├── ComparePlans.tsx  # Pricing comparison widget
│   │   ├── CaseStudy.tsx     # Success stories widget
│   │   └── ContactForm.tsx   # Sales inquiry widget
│   ├── dist/                 # Built widget bundles
│   └── build.js              # esbuild configuration
├── Dockerfile                # Multi-stage build
├── fly.toml                  # Fly.io configuration
└── pyproject.toml            # Python dependencies (mcp[fastapi])
```

## Available Tools

1. **get_started** - Service overview with pricing and benefits
2. **compare_plans** - Side-by-side tier comparison
3. **get_case_study** - Industry-specific success stories
4. **contact_sales** - Sales inquiry submission

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- uv (Python package manager)
- fly CLI (for deployment)

### Setup

1. **Install Python dependencies:**
```bash
uv sync
```

2. **Install Node.js dependencies:**
```bash
cd web && npm install
```

3. **Build widgets:**
```bash
cd web && npm run build
```

4. **Run the server locally:**
```bash
# Option 1: Run directly with Python
python server/noodleseed_app.py

# Option 2: Run with uvicorn (recommended for production)
uvicorn server.noodleseed_app:app --host 0.0.0.0 --port 8080
```

The server will start at `http://localhost:8080`

### Testing with ChatGPT

For local testing with ChatGPT Developer Mode, you need to expose your server:

1. **Using ngrok:**
```bash
ngrok http 8080
```

2. **Add to ChatGPT:**
   - Go to ChatGPT Settings → Apps & Connectors
   - Enable Developer Mode
   - Click "Create" → Enter your ngrok URL + `/mcp`
   - Name it "Noodle Seed"

3. **Try these queries:**
   - "Noodle Seed, how can I get my business on ChatGPT?"
   - "Noodle Seed, compare the Starter and Enterprise plans"
   - "Noodle Seed, show me a real estate case study"
   - "Noodle Seed, I want to contact sales"

## Deployment to Fly.io

### Initial Setup

1. **Install fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login to fly.io:**
```bash
fly auth login
```

3. **Launch the app:**
```bash
fly launch
```

Follow the prompts:
- Choose app name (or use default)
- Select region (default: iad)
- Don't add PostgreSQL or Redis
- Don't deploy yet

### Deploy

```bash
fly deploy
```

### Get Your URL

```bash
fly status
```

Your app will be available at: `https://[app-name].fly.dev`

The MCP endpoint for ChatGPT is: `https://[app-name].fly.dev/mcp`

### Monitor

```bash
# View logs
fly logs

# Check status
fly status

# Open in browser
fly open
```

## Widget Development

### Watch Mode

For active widget development with auto-rebuild:

```bash
cd web && npm run watch
```

### Design Guidelines

Following OpenAI's official guidelines:

- ✅ Max 2 primary actions per widget
- ✅ No nested scrolling (content auto-fits)
- ✅ System colors and fonts for native feel
- ✅ WCAG AA contrast ratios
- ✅ State payload < 4k tokens
- ✅ Responsive and accessible

### Adding New Widgets

1. Create new component in `web/src/YourWidget.tsx`
2. Add to `components` array in `web/build.js`
3. Register resource in `server/noodleseed_app.py`
4. Create corresponding tool that returns `structuredContent` + `_meta`

## Environment Variables

- `PORT` - Server port (default: 8080)

## Architecture

### MCP Server (server/noodleseed_app.py)

- Registers 4 HTML widget resources with `mimeType: "text/html+skybridge"`
- Each widget URI: `ui://widget/{name}.html`
- Tools return structured data + widget reference via `_meta["openai/outputTemplate"]`

### Widgets (web/src/)

- React components bundled with esbuild
- Receive data via `window.openai.toolOutput` or `message` events
- Can call tools via `window.openai.callTool()`
- Sandboxed iframes with system styling

### Production Server (app.py)

- FastAPI wrapper for HTTP transport
- Health checks for fly.io
- CORS configured for development

## OpenAI Apps SDK Integration

This app is designed to work with OpenAI's Apps SDK and ChatGPT's MCP integration:

- **Protocol**: Model Context Protocol (MCP)
- **Transport**: HTTP with Server-Sent Events (SSE), using `stateless_http=True`
- **Framework**: FastMCP (official Python MCP SDK with FastAPI integration)
- **Widgets**: React components in sandboxed iframes with `text/html+skybridge` MIME type
- **Data Flow**: Tool → Structured Content → Widget Rendering
- **Pattern**: Follows [OpenAI's official examples](https://github.com/openai/openai-apps-sdk-examples)

## Implementation Details

### MCP Server (server/noodleseed_app.py)

- Uses `mcp[fastapi]` package (official MCP SDK for Python)
- Initialized with `stateless_http=True` for proper SSE support
- Registers 4 HTML widget resources with `mimeType: "text/html+skybridge"`
- Each widget URI follows pattern: `ui://widget/{name}.html`
- Tools return three components:
  - `content`: Text confirmation for ChatGPT
  - `structuredContent`: JSON data payload for widgets
  - `_meta`: OpenAI metadata including `openai/outputTemplate` widget binding

## License

MIT

## Support

For questions about Noodle Seed: sales@noodleseed.com

For technical issues: Open an issue on GitHub
