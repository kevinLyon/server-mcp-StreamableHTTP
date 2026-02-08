# server-mcp-StreamableHTTP

A complete **StreamableHTTP MCP Server** designed to remove the complexity of building MCP infrastructure from scratch. This project lets developers focus only on creating tools, not the server setup.

## 🎯 Overview

This repository provides a ready-to-use MCP (Model Context Protocol) server implementation using the StreamableHTTP transport. Instead of spending time setting up the boilerplate server infrastructure, you can jump straight into building your MCP tools.

## 📁 Project Structure
```
server-mcp-StreamableHTTP/
├── src/
│   ├── helper.ts          # CLI logging utilities
│   ├── index.ts           # Express server & MCP server spawner
│   ├── server.ts          # MCP server logic and tool structures
│   └── tools/             # Individual tool implementations
│       └── ...            # Your tool files go here
├── package.json
└── README.md
```

### Architecture

- **`helper.ts`** - Provides logging functions for CLI output and debugging
- **`index.ts`** - Sets up the Express HTTP server and spawns the MCP server process
- **`server.ts`** - Contains the core MCP server logic and tool structure definitions
- **`tools/`** - Directory containing the actual tool implementations and business logic

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/kevinLyon/server-mcp-StreamableHTTP.git

# Navigate to the project directory
cd server-mcp-StreamableHTTP

# Install dependencies
npm install
```

### Running the Server
```bash
# Start the server
npx tsx .\src\index.ts
```

The server will start on the default port (typically 10301).

### Running on custom port
```bash
# Start the server
npx tsx .\src\index.ts --port 1234
```

## 🛠️ Creating Your Own Tools

This is where you focus your development effort! The server infrastructure is already set up, so you only need to:

1. **Create a new tool file** in the `src/tools/` directory
2. **Define your tool** following the MCP tool specification
3. **Export your tool** from the tools directory
4. **Register it** in `server.ts`

### Example Tool Structure
```typescript
// src/tools/myCustomTool.ts

export const myCustomTool = {
  name: "my_custom_tool",
  description: "Description of what your tool does",
  inputSchema: {
    type: "object",
    properties: {
      // Define your input parameters
      param1: {
        type: "string",
        description: "Description of param1"
      }
    },
    required: ["param1"]
  },
  handler: async (params: any) => {
    // Your tool logic here
    return {
      content: [{
        type: "text",
        text: "Tool response"
      }]
    };
  }
};
```

## 🔌 Connecting to MCP Clients

### Claude Desktop Configuration

Add this to your Claude Desktop config file:
```json
{
  "mcpServers": {
    "streamable-server": {
      "type": "streamable-http",
      "url": "http://localhost:10301"
    }
  }
}
```

### Using with Other MCP Clients

This server implements the StreamableHTTP transport protocol, making it compatible with any MCP client that supports this transport type.

## 📋 Features

- ✅ **Pre-configured StreamableHTTP transport** - No setup required
- ✅ **Express-based HTTP server** - Battle-tested and reliable
- ✅ **Modular tool architecture** - Easy to add, remove, or modify tools
- ✅ **CLI logging utilities** - Built-in debugging and monitoring
- ✅ **TypeScript support** - Type-safe development experience

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of the [Model Context Protocol](https://modelcontextprotocol.io/)
- Uses the [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

---

**Start building your MCP tools today!** 🚀
![image example](https://raw.githubusercontent.com/kevinLyon/server-mcp-StreamableHTTP/refs/heads/main/img/example.png)
