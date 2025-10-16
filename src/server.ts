import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import fs from "fs";
import path from "path";
import { URL, fileURLToPath } from "url";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolRequest,
  type ListResourceTemplatesRequest,
  type ListResourcesRequest,
  type ListToolsRequest,
  type ReadResourceRequest,
  type Resource,
  type ResourceTemplate,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.resolve(ROOT_DIR, "dist");

// Widget metadata
interface NoodleSeedWidget {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  htmlFile: string;
  responseText: string;
  html: string;
}

// Read bundled React widget HTML
function readWidgetHtml(htmlFile: string): string {
  const htmlPath = path.join(DIST_DIR, htmlFile);

  try {
    if (fs.existsSync(htmlPath)) {
      const content = fs.readFileSync(htmlPath, "utf-8");
      console.log(`✅ Loaded React widget: ${htmlFile} (${(content.length / 1024).toFixed(1)}KB)`);
      return content;
    } else {
      console.warn(`⚠️  Widget HTML not found: ${htmlPath}`);
      console.log(`   Run 'npm run build:widgets' to generate widget bundles`);

      // Fallback HTML
      return `
        <div style="padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
          <h2 style="margin: 0 0 10px 0;">Widget Not Built</h2>
          <p style="margin: 0; opacity: 0.9;">Run 'npm run build:widgets' to generate React widget bundles</p>
        </div>
      `;
    }
  } catch (error) {
    console.error(`❌ Error reading widget HTML: ${error}`);
    return `<div style="padding: 20px; color: red;">Error loading widget</div>`;
  }
}

// Widget definitions with React widget HTML
const widgets: NoodleSeedWidget[] = [
  {
    id: "noodle-seed-platform",
    title: "NoodleSeed Platform Overview",
    templateUri: "ui://widget/noodle-seed-platform.html",
    invoking: "Loading NoodleSeed platform...",
    invoked: "Here's the NoodleSeed AI platform overview",
    htmlFile: "noodle-seed-platform.html",
    responseText: "NoodleSeed AI Platform - Transform your business with intelligent automation",
    html: readWidgetHtml("noodle-seed-platform.html"),
  },
  {
    id: "noodle-seed-list",
    title: "NoodleSeed Features List",
    templateUri: "ui://widget/noodle-seed-list.html",
    invoking: "Loading feature list...",
    invoked: "Here are the NoodleSeed features",
    htmlFile: "noodle-seed-list.html",
    responseText: "NoodleSeed Features - Comprehensive AI capabilities for your business",
    html: readWidgetHtml("noodle-seed-list.html"),
  },
  {
    id: "noodle-seed-carousel",
    title: "NoodleSeed Success Stories",
    templateUri: "ui://widget/noodle-seed-carousel.html",
    invoking: "Loading success stories...",
    invoked: "Browse through our success stories",
    htmlFile: "noodle-seed-carousel.html",
    responseText: "NoodleSeed Success Stories - Real results from real businesses",
    html: readWidgetHtml("noodle-seed-carousel.html"),
  },
];

const widgetsById = new Map<string, NoodleSeedWidget>();
const widgetsByUri = new Map<string, NoodleSeedWidget>();

widgets.forEach((widget) => {
  widgetsById.set(widget.id, widget);
  widgetsByUri.set(widget.templateUri, widget);
});

// Widget metadata for ChatGPT
function widgetMeta(widget: NoodleSeedWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
  } as const;
}

// Input schema
const toolInputSchema = {
  type: "object" as const,
  properties: {
    businessType: {
      type: "string",
      description: "Type of business to show information for",
    },
  },
  required: ["businessType"] as string[],
  additionalProperties: false,
};

const toolInputParser = z.object({
  businessType: z.string(),
});

// Create tools, resources, and resource templates
const tools: Tool[] = widgets.map((widget) => ({
  name: widget.id,
  description: widget.title,
  inputSchema: toolInputSchema,
  title: widget.title,
  _meta: widgetMeta(widget),
}));

const resources: Resource[] = widgets.map((widget) => ({
  uri: widget.templateUri,
  name: widget.title,
  description: `${widget.title} - Interactive React widget`,
  mimeType: "text/html+skybridge",
  _meta: widgetMeta(widget),
}));

const resourceTemplates: ResourceTemplate[] = widgets.map((widget) => ({
  uriTemplate: widget.templateUri,
  name: widget.title,
  description: `${widget.title} - Interactive React widget`,
  mimeType: "text/html+skybridge",
  _meta: widgetMeta(widget),
}));

// Create MCP server
function createNoodleSeedServer(): Server {
  const server = new Server(
    {
      name: "noodleseed-mcp",
      version: "2.0.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  // List all available resources
  server.setRequestHandler(
    ListResourcesRequestSchema,
    async (_request: ListResourcesRequest) => ({
      resources,
    })
  );

  // Read a specific resource (widget HTML)
  server.setRequestHandler(
    ReadResourceRequestSchema,
    async (request: ReadResourceRequest) => {
      const widget = widgetsByUri.get(request.params.uri);

      if (!widget) {
        throw new Error(`Unknown resource: ${request.params.uri}`);
      }

      console.log(`📤 Serving React widget: ${widget.id}`);

      return {
        contents: [
          {
            uri: widget.templateUri,
            mimeType: "text/html+skybridge",
            text: widget.html,
            _meta: widgetMeta(widget),
          },
        ],
      };
    }
  );

  // List resource templates
  server.setRequestHandler(
    ListResourceTemplatesRequestSchema,
    async (_request: ListResourceTemplatesRequest) => ({
      resourceTemplates,
    })
  );

  // List all available tools
  server.setRequestHandler(
    ListToolsRequestSchema,
    async (_request: ListToolsRequest) => ({
      tools,
    })
  );

  // Handle tool invocations
  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      const widget = widgetsById.get(request.params.name);

      if (!widget) {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      const args = toolInputParser.parse(request.params.arguments ?? {});

      console.log(`🎨 Widget invoked: ${widget.id} for ${args.businessType}`);

      return {
        content: [
          {
            type: "text",
            text: widget.responseText,
          },
        ],
        structuredContent: {
          businessType: args.businessType,
          timestamp: new Date().toISOString(),
          widgetId: widget.id,
        },
        _meta: widgetMeta(widget),
      };
    }
  );

  return server;
}

// Session management
type SessionRecord = {
  server: Server;
  transport: SSEServerTransport;
};

const sessions = new Map<string, SessionRecord>();

const ssePath = "/mcp";
const postPath = "/mcp/messages";

// Handle SSE requests
async function handleSseRequest(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const server = createNoodleSeedServer();
  const transport = new SSEServerTransport(postPath, res);
  const sessionId = transport.sessionId;

  sessions.set(sessionId, { server, transport });
  console.log(`🔌 New SSE session: ${sessionId}`);

  transport.onclose = async () => {
    if (!sessions.has(sessionId)) {
      return;
    }
    sessions.delete(sessionId);
    await server.close();
    console.log(`🔌 SSE session closed: ${sessionId}`);
  };

  transport.onerror = (error) => {
    console.error(`❌ SSE transport error (${sessionId}):`, error);
  };

  try {
    await server.connect(transport);
  } catch (error) {
    sessions.delete(sessionId);
    console.error("Failed to start SSE session", error);
    if (!res.headersSent) {
      res.writeHead(500).end("Failed to establish SSE connection");
    }
  }
}

// Handle POST messages
async function handlePostMessage(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    res.writeHead(400).end("Missing sessionId query parameter");
    return;
  }

  const session = sessions.get(sessionId);

  if (!session) {
    res.writeHead(404).end("Unknown session");
    return;
  }

  try {
    await session.transport.handlePostMessage(req, res);
  } catch (error) {
    console.error("Failed to process message", error);
    if (!res.headersSent) {
      res.writeHead(500).end("Failed to process message");
    }
  }
}

// Start HTTP server
const portEnv = Number(process.env.PORT ?? 8000);
const port = Number.isFinite(portEnv) ? portEnv : 8000;
const host = process.env.HOST || "0.0.0.0";

const httpServer = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
      res.writeHead(400).end("Missing URL");
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

    // Handle CORS preflight
    if (
      req.method === "OPTIONS" &&
      (url.pathname === ssePath || url.pathname === postPath)
    ) {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
      });
      res.end();
      return;
    }

    // SSE endpoint
    if (req.method === "GET" && url.pathname === ssePath) {
      await handleSseRequest(res);
      return;
    }

    // POST message endpoint
    if (req.method === "POST" && url.pathname === postPath) {
      await handlePostMessage(req, res, url);
      return;
    }

    // Health check endpoint
    if (req.method === "GET" && url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("OK");
      return;
    }

    res.writeHead(404).end("Not Found");
  }
);

httpServer.on("clientError", (err: Error, socket) => {
  console.error("HTTP client error", err);
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

// Start server
httpServer.listen(port, host, () => {
  console.log("===============================================================================");
  console.log("🚀 NoodleSeed MCP Server (Hybrid: Standard SDK + React Widgets)");
  console.log("===============================================================================");
  console.log(`📍 Server running on ${host}:${port}`);
  console.log(`🎨 Loaded ${widgets.length} React widgets`);
  console.log(`📡 SSE endpoint: http://${host}:${port}${ssePath}`);
  console.log(`📮 POST endpoint: http://${host}:${port}${postPath}?sessionId=...`);
  console.log(`🏥 Health check: http://${host}:${port}/health`);
  console.log("===============================================================================");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down server...");
  httpServer.close(() => {
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down server...");
  httpServer.close(() => {
    process.exit(0);
  });
});