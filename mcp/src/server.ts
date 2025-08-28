import "dotenv/config";

import { FastMCP } from "fastmcp";
import { z } from "zod";
import { parse } from "csv-parse/sync";
import { readFile } from "fs/promises";
import { getWeatherForecast, WeatherForecast } from "./weather";

const port =
  Number(process.env.PORT) || Number(process.env.AWS_LWA_PORT) || 8080;

const server = new FastMCP({
  name: "WannaHike MCP Server",
  version: "1.0.0",
  instructions: "A simple MCP server, you can ask it to add two numbers.",
  authenticate: async (req) => {
    let apiKeyHeader =
      req.headers["x-api-key"] ||
      req.headers["X-API-Key"] ||
      req.headers["X-API-KEY"];
    const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;

    if (!apiKey || apiKey !== process.env.API_KEY) {
      throw new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      });
    }

    return {};
  },
});

server.addTool({
  name: "list_hikes",
  description: "List all hikes",
  async execute() {
    const content = await readFile("data/tatra_hikes.csv", "utf-8");
    const records = parse(content, { columns: true }) as {
      trail_name: string;
    }[];

    return JSON.stringify(records);
  },
});

server.addTool({
  name: "get_weather_forecast",
  description: "Get weather forecast",
  parameters: z.object({
    hike_date: z.date().describe("Date of the hike"),
  }),
  async execute() {
    const forecast = await getWeatherForecast("Zakopane, PL");
    return JSON.stringify(forecast);
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
