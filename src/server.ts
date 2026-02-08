
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  Notification,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  LoggingMessageNotification,
  JSONRPCNotification,
  JSONRPCErrorResponse,
  InitializeRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { z } from "zod";

import { Helper } from "./helper.ts"
import { DNSresolution } from "./tools/ping.ts"


const SESSION_ID_HEADER_NAME = "mcp-session-id";
const JSON_RPC = "2.0";


//######################################################################### //
//                        TOOLS SCHEMA SECTION                              //
//######################################################################### //

const DNSSchema = z.object({
  host: z.string().min(1)
})

//######################################################################### //
//                        TOOLS SCHEMA SECTION                              //
//######################################################################### //


export class MCPServer {

  private servers: Record<string, Server> = {};
  private transports: Record<string, StreamableHTTPServerTransport> = {};

  private baseServerFactory: () => Server;

  constructor(baseServerFactory: () => Server) {
    this.baseServerFactory = baseServerFactory;
  }

  async handleGetRequest(req: Request, res: Response) {

    const sessionId = req.headers[SESSION_ID_HEADER_NAME] as string | undefined;

    if (sessionId) {
      const str = req.method + " " + req.url + " " + sessionId;
      Helper.printInfo(str);
    }

    if (!sessionId || !this.transports[sessionId]) {
      res.status(400).json(this.createErrorResponse("Invalid session ID"));
      Helper.printErr("Invalid session ID");

      return;
    }

    const transport = this.transports[sessionId];
    await transport.handleRequest(req, res);
    await this.streamMessages(transport);
  }

  async handlePostRequest(req: Request, res: Response) {
    const sessionId = req.headers[SESSION_ID_HEADER_NAME] as string | undefined;


    try {
      if (sessionId && this.transports[sessionId]) {
        if (req.body.method === "tools/call") {
          const str = `calling tool ${JSON.stringify(req.body.params)}`
          Helper.printInfo(str)
        }

        const transport = this.transports[sessionId];
        await transport.handleRequest(req, res, req.body);
        return;
      }

      if (!sessionId && this.isInitializeRequest(req.body)) {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
        });

        const server = this.baseServerFactory();

        //tools
        this.setupToolsForServer(server);

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);

        const newSessionId = transport.sessionId;
        if (newSessionId) {
          this.transports[newSessionId] = transport;
          this.servers[newSessionId] = server;
        }

        return;
      }

      res.status(400).json(this.createErrorResponse("Bad Request"));
      Helper.printWar("Bad Request")
    } catch (error) {
      Helper.printErr(`Error handling MCP request: ${error}`)
      res.status(500).json(this.createErrorResponse("Internal server error"));
    }
  }

  async cleanup() {
    for (const server of Object.values(this.servers)) {
      await server.close();
    }
  }

  //######################################################################### //
  //                        TOOLS SECTIONS                                    //
  //######################################################################### //
  private setupToolsForServer(server: Server) {
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "dns-lookup",
            description: "Perform a dns lookup request on host (ex: example.com)",
            inputSchema: {
              type: "object",
              properties: {
                host: { type: "string" }
              },
              required: ["host"]
            }, // more tools below ....
          },
        ],
      };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {

      const { name, arguments: args } = request.params;

      switch (name) {
        case "dns-lookup":

          const pars = DNSSchema.parse(args)
          const host = pars.host

          if (!host || typeof host !== "string") {
            return {
              content: [{ type: "text", text: "Argument 'host' not found or is deferent of typeof 'string'" }]
            }
          }

          const dnsLookUP = await DNSresolution.ping(host)
          Helper.printInfo(`call/tool dns-lookup result ${JSON.stringify(dnsLookUP)}`)

          return {
            content: [{
              type: "text",
              text: JSON.stringify(dnsLookUP)
            }]
          }


        // more tools below....

        default: {
          return {
            content: [{
              type: "text",
              text: "Unknow tool called"
            }]
          }
        }
      }

    });
  }

  //######################################################################### //
  //                        TOOLS SECTIONS                                    //
  //######################################################################### //

  private async streamMessages(transport: StreamableHTTPServerTransport) {
    const message: LoggingMessageNotification = {
      method: "notifications/message",
      params: { level: "info", data: "SSE Connection established" },
    };
    await this.sendNotification(transport, message);
  }

  private async sendNotification(
    transport: StreamableHTTPServerTransport,
    notification: Notification
  ) {
    const rpcNotification: JSONRPCNotification = {
      ...notification,
      jsonrpc: JSON_RPC,
    };
    await transport.send(rpcNotification);
  }

  private createErrorResponse(message: string): JSONRPCErrorResponse {
    return {
      jsonrpc: "2.0",
      error: { code: -32000, message },
      id: randomUUID(),
    };
  }

  private isInitializeRequest(body: any): boolean {
    const check = (data: any) => InitializeRequestSchema.safeParse(data).success;
    if (Array.isArray(body)) return body.some(check);
    return check(body);
  }
}
