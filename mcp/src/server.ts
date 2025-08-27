import { FastMCP } from "fastmcp";
import { z } from "zod"; // Or any validation library that supports Standard Schema

const port =
  Number(process.env.PORT) ||
  Number(process.env.AWS_LWA_PORT) ||
  8080;

const server = new FastMCP({
  name: "WannaHike MCP Server",
  version: "1.0.0",
    instructions: "A simple MCP server, you can ask it to add two numbers.",
  authenticate: async (req) => {
      const apiKey = req.headers["x-api-key"];

      if (apiKey !== process.env.API_KEY) {
        throw new Response(null, {
          status: 401,
          statusText: "Unauthorized",
        });
      }

      return {};
  },
});

server.addTool({
  name: "add",
  description: "Add two numbers",
  parameters: z.object({
    a: z.number(),
    b: z.number(),
  }),
  execute: async (args) => {
    return String(args.a + args.b);
    },
});

server.start({
    transportType: "httpStream",
    httpStream: {
        port: port,
        endpoint: "/mcp",
        stateless: true,
    },
});