import { createServer } from "node:http";
import { URL } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListResourceTemplatesRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
// Widget configuration - matches OpenAI examples exactly
// Use external CSS/JS hosted on CDN (like pizzaz examples)
const WIDGET_CDN_URL = "https://noodleseed.fly.dev/static"; // Update with actual CDN
const WIDGET_HASH = "0001"; // Version hash for cache busting
// Widget HTML - references external assets like OpenAI examples
const WIDGET_HTML = `<div id="noodleseed-root"></div>
<link rel="stylesheet" href="${WIDGET_CDN_URL}/noodleseed-${WIDGET_HASH}.css">
<script type="module" src="${WIDGET_CDN_URL}/noodleseed-${WIDGET_HASH}.js"></script>`;
// Define NoodleSeed widgets configuration
const widgets = [
    {
        id: "noodle-seed-platform",
        title: "Show NoodleSeed Platform",
        templateUri: "ui://widget/noodle-seed-platform.html",
        invoking: "Loading NoodleSeed platform...",
        invoked: "Here's NoodleSeed's AI platform",
        html: WIDGET_HTML,
        responseText: "Here's NoodleSeed - a no-code platform to build your AI presence across ChatGPT. We help businesses reach 800M+ ChatGPT users with custom apps, tools, and actions. Explore our three pricing tiers and get your app live in under 48 hours!"
    }
];
const widgetsById = new Map();
const widgetsByUri = new Map();
widgets.forEach((widget) => {
    widgetsById.set(widget.id, widget);
    widgetsByUri.set(widget.templateUri, widget);
});
// Widget metadata helper - matches Python example exactly
function widgetMeta(widget) {
    return {
        "openai/outputTemplate": widget.templateUri,
        "openai/toolInvocation/invoking": widget.invoking,
        "openai/toolInvocation/invoked": widget.invoked,
        "openai/widgetAccessible": true,
        "openai/resultCanProduceWidget": true,
        "annotations": {
            "readOnlyHint": true,
            "destructiveHint": false,
            "openWorldHint": false
        }
    };
}
// Create embedded widget resource - matches Python _embedded_widget_resource
function embeddedWidgetResource(widget) {
    return {
        type: "resource",
        resource: {
            uri: widget.templateUri,
            mimeType: "text/html+skybridge",
            text: widget.html,
            title: widget.title
        }
    };
}
// Tool input schemas
const searchToolSchema = {
    type: "object",
    properties: {
        query: {
            type: "string",
            description: "Search query for business solutions"
        }
    },
    required: ["query"],
    additionalProperties: false
};
const getStartedToolSchema = {
    type: "object",
    properties: {
        business_type: {
            type: "string",
            description: "Type of business (e.g., retail, healthcare, real-estate)",
            default: "general"
        }
    },
    additionalProperties: false
};
// Input parsers
const searchToolParser = z.object({
    query: z.string()
});
const getStartedToolParser = z.object({
    business_type: z.string().default("general")
});
// Define tools
const tools = [
    {
        name: "search",
        description: "Search for NoodleSeed business solutions, pricing plans, and features",
        inputSchema: searchToolSchema,
        _meta: {
            "openai/resultCanProduceWidget": false,
            "annotations": {
                "readOnlyHint": true,
                "destructiveHint": false,
                "openWorldHint": false
            }
        }
    },
    {
        name: "get-started",
        description: "Get started with NoodleSeed - Display interactive platform overview with pricing",
        inputSchema: getStartedToolSchema,
        _meta: widgetMeta(widgets[0])
    }
];
// Define resources
const resources = widgets.map((widget) => ({
    uri: widget.templateUri,
    name: widget.title,
    description: `${widget.title} widget markup`,
    mimeType: "text/html+skybridge",
    _meta: widgetMeta(widget)
}));
// Define resource templates
const resourceTemplates = widgets.map((widget) => ({
    uriTemplate: widget.templateUri,
    name: widget.title,
    description: `${widget.title} widget markup`,
    mimeType: "text/html+skybridge",
    _meta: widgetMeta(widget)
}));
// NoodleSeed data function
function getNoodleSeedData(businessType = 'general') {
    return {
        service: 'NoodleSeed ChatGPT App Platform',
        business_type: businessType,
        tagline: 'Get Your Business on ChatGPT in Minutes',
        description: 'NoodleSeed automatically creates, hosts, and submits ChatGPT apps for ANY business—no coding required.',
        benefits: [
            'Reach 800M+ ChatGPT users instantly',
            'Fully managed hosting and deployment',
            'Automatic OpenAI submission and approval',
            'Custom tools and actions for your business',
            'Enterprise-grade security and compliance'
        ],
        plans: {
            starter: {
                name: 'Starter',
                price: '$299/month',
                features: [
                    '1 ChatGPT app',
                    '5 custom tools/actions',
                    'Automatic deployment',
                    '99.9% uptime SLA'
                ]
            },
            growth: {
                name: 'Growth',
                price: '$999/month',
                features: [
                    '5 ChatGPT apps',
                    'Unlimited tools/actions',
                    'Multi-tenant support',
                    'Priority support',
                    '99.95% uptime SLA'
                ]
            },
            enterprise: {
                name: 'Enterprise',
                price: 'Custom',
                features: [
                    'Unlimited apps',
                    'White-label solution',
                    'Air-gapped deployment',
                    'SOC 2 compliant',
                    '99.99% uptime SLA'
                ]
            }
        },
        next_steps: [
            'Visit noodleseed.com to schedule a demo',
            'Book a consultation to discuss your needs',
            'Get your first app live in under 48 hours'
        ],
        cta: 'Ready to reach millions? Start at https://noodleseed.com'
    };
}
// Create NoodleSeed MCP Server
function createNoodleSeedServer() {
    const server = new Server({
        name: "noodleseed-mcp-server",
        version: "1.0.0"
    }, {
        capabilities: {
            resources: {},
            tools: {}
        }
    });
    // Handle resources/list
    server.setRequestHandler(ListResourcesRequestSchema, async (_request) => ({
        resources
    }));
    // Handle resources/read
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const widget = widgetsByUri.get(request.params.uri);
        if (!widget) {
            throw new Error(`Unknown resource: ${request.params.uri}`);
        }
        return {
            contents: [
                {
                    uri: widget.templateUri,
                    mimeType: "text/html+skybridge",
                    text: widget.html
                }
            ]
        };
    });
    // Handle resource templates
    server.setRequestHandler(ListResourceTemplatesRequestSchema, async (_request) => ({
        resourceTemplates
    }));
    // Handle tools/list
    server.setRequestHandler(ListToolsRequestSchema, async (_request) => ({
        tools
    }));
    // Handle tools/call
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        if (name === "search") {
            const { query } = searchToolParser.parse(args ?? {});
            const searchResults = [];
            const queryLower = query.toLowerCase();
            if (queryLower.includes('price') || queryLower.includes('pricing') || queryLower.includes('cost')) {
                searchResults.push('• Starter Plan: $299/month - 1 ChatGPT app with 5 custom tools');
                searchResults.push('• Growth Plan: $999/month - 5 ChatGPT apps with unlimited tools');
                searchResults.push('• Enterprise: Custom pricing - Unlimited apps with white-label solution');
            }
            if (queryLower.includes('feature') || queryLower.includes('tool') || queryLower.includes('action')) {
                searchResults.push('• Automatic OpenAI submission and approval');
                searchResults.push('• Custom tools and actions for your business');
                searchResults.push('• Enterprise-grade security and compliance');
            }
            if (queryLower.includes('chatgpt') || queryLower.includes('app')) {
                searchResults.push('• Get your business on ChatGPT in minutes');
                searchResults.push('• Reach 800M+ ChatGPT users instantly');
                searchResults.push('• Fully managed hosting and deployment');
            }
            if (searchResults.length === 0) {
                searchResults.push('• NoodleSeed helps businesses get on ChatGPT with no coding required');
                searchResults.push('• Visit noodleseed.com for more information');
            }
            return {
                content: [
                    {
                        type: "text",
                        text: `Search results for '${query}':\n\n${searchResults.join('\n')}`
                    }
                ]
            };
        }
        if (name === "get-started") {
            const { business_type } = getStartedToolParser.parse(args ?? {});
            const widget = widgets[0];
            const noodleseedData = getNoodleSeedData(business_type);
            // Build metadata exactly as in Python example
            const meta = {
                "openai.com/widget": embeddedWidgetResource(widget),
                "openai/outputTemplate": widget.templateUri,
                "openai/toolInvocation/invoking": widget.invoking,
                "openai/toolInvocation/invoked": widget.invoked,
                "openai/widgetAccessible": true,
                "openai/resultCanProduceWidget": true,
            };
            return {
                content: [
                    {
                        type: "text",
                        text: widget.responseText
                    }
                ],
                structuredContent: noodleseedData,
                _meta: meta
            };
        }
        throw new Error(`Unknown tool: ${name}`);
    });
    return server;
}
const sessions = new Map();
// Define paths
const ssePath = "/mcp";
const postPath = "/mcp/messages";
// Handle SSE request
async function handleSseRequest(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    const server = createNoodleSeedServer();
    const transport = new SSEServerTransport(postPath, res);
    const sessionId = transport.sessionId;
    sessions.set(sessionId, { server, transport });
    transport.onclose = async () => {
        sessions.delete(sessionId);
        // Server will be closed automatically when transport closes
    };
    transport.onerror = (error) => {
        console.error("SSE transport error", error);
    };
    try {
        console.log(`New SSE session: ${sessionId}`);
        await server.connect(transport);
    }
    catch (error) {
        sessions.delete(sessionId);
        console.error("Failed to start SSE session", error);
        if (!res.headersSent) {
            res.writeHead(500).end("Failed to establish SSE connection");
        }
    }
}
// Handle POST messages
async function handlePostMessage(req, res, url) {
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
    }
    catch (error) {
        console.error("Failed to process message", error);
        if (!res.headersSent) {
            res.writeHead(500).end("Failed to process message");
        }
    }
}
// Create HTTP server
const portEnv = Number(process.env.PORT ?? 8000);
const port = Number.isFinite(portEnv) ? portEnv : 8000;
const httpServer = createServer(async (req, res) => {
    if (!req.url) {
        res.writeHead(400).end("Missing URL");
        return;
    }
    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
    // Handle CORS preflight
    if (req.method === "OPTIONS" && (url.pathname === ssePath || url.pathname === postPath)) {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "content-type"
        });
        res.end();
        return;
    }
    // Handle SSE endpoint
    if (req.method === "GET" && url.pathname === ssePath) {
        await handleSseRequest(res);
        return;
    }
    // Handle POST messages endpoint
    if (req.method === "POST" && url.pathname === postPath) {
        await handlePostMessage(req, res, url);
        return;
    }
    // Handle health check
    if (req.method === "GET" && url.pathname === "/health") {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(JSON.stringify({
            status: "ok",
            service: "noodleseed-mcp-server",
            version: "1.0.0",
            type: "node-typescript-sse",
            mcp_ready: true
        }));
        return;
    }
    // Handle root
    if (req.method === "GET" && url.pathname === "/") {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(JSON.stringify({
            name: "NoodleSeed MCP Server",
            version: "1.0.0",
            endpoints: {
                mcp_sse: ssePath,
                mcp_messages: postPath,
                health: "/health"
            }
        }));
        return;
    }
    res.writeHead(404).end("Not Found");
});
// Handle server errors
httpServer.on("clientError", (err, socket) => {
    console.error("HTTP client error", err);
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});
// Start server
httpServer.listen(port, () => {
    console.log('===============================================================================');
    console.log('🚀 NoodleSeed MCP Server (SSE Transport)');
    console.log('===============================================================================');
    console.log(`📍 SSE endpoint: GET http://localhost:${port}${ssePath}`);
    console.log(`📮 Message endpoint: POST http://localhost:${port}${postPath}?sessionId=...`);
    console.log(`🏥 Health check: GET http://localhost:${port}/health`);
    console.log(`🎨 Widget: NoodleSeed Platform Overview`);
    console.log(`📝 Protocol: MCP with SSE Transport`);
    console.log(`🌐 Port: ${port}`);
    console.log('===============================================================================');
});
//# sourceMappingURL=server.js.map