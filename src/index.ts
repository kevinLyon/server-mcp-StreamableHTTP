import express, { Request, Response } from "express";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MCPServer } from "./server.ts";


// Default port
let PORT = 10301;

// heandle cli commands
const argv = await yargs(hideBin(process.argv))
  .option("port", {
    type: "number",
    default: 10301,
  })
  .parse();

if(argv.port){
  PORT = argv.port
} 


const server = new MCPServer(
  () => {
    const mcpServer = new McpServer(
      {
        name: "mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          logging: {},
        },
      }
    );
    return mcpServer.server; // Return the underlying Server instance
  }
);

const app = express();
app.use(express.json());

const router = express.Router();

// single endpoint for the client to send messages to
const MCP_ENDPOINT = "/mcp";

router.post(MCP_ENDPOINT, async (req: Request, res: Response) => {
  await server.handlePostRequest(req, res);
});

router.get(MCP_ENDPOINT, async (req: Request, res: Response) => {
  await server.handleGetRequest(req, res);
});

app.use("/", router);

app.listen(PORT, () => {
  console.log(`MCP Streamable HTTP Server listening on port ${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await server.cleanup();
  process.exit(0);
});