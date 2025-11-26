import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { randomUUID } from "crypto";
import { setupTaskTools } from "./tools/tasks.js";
import { setupProjectTools } from "./tools/projects.js";
import { setupSmartActions } from "./tools/smart-actions.js";
import { setupUITools } from "./tools/ui.js";
import { setupTagTools } from "./tools/tags.js";

// Interface compatível com o SuperProductivityClient existente
// Mas usando Socket.IO em vez de Axios
class SocketSuperProductivityClient {
  private socket: Socket | null = null;

  setSocket(socket: Socket) {
    this.socket = socket;
  }

  private async emitWithAck<T>(event: string, data?: any): Promise<T> {
    if (!this.socket) {
      throw new Error(
        "Plugin Super Productivity não está conectado. Verifique se o plugin está instalado e ativo.",
      );
    }

    return new Promise((resolve, reject) => {
      // Timeout de 10s
      const timeout = setTimeout(() => {
        reject(
          new Error(
            `Timeout aguardando resposta do plugin para evento ${event}`,
          ),
        );
      }, 10000);

      this.socket!.emit(event, data, (response: any) => {
        clearTimeout(timeout);
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  async getTasks(): Promise<any[]> {
    return this.emitWithAck("tasks:get");
  }

  async getCurrentContextTasks(): Promise<any[]> {
    return this.emitWithAck("tasks:getCurrent");
  }

  async createTask(taskData: any): Promise<string> {
    return this.emitWithAck("tasks:create", taskData);
  }

  async updateTask(taskId: string, updates: any): Promise<void> {
    return this.emitWithAck("tasks:update", { taskId, updates });
  }

  async deleteTask(taskId: string): Promise<void> {
    return this.emitWithAck("tasks:delete", { taskId });
  }

  async batchUpdate(projectId: string, operations: any[]): Promise<any> {
    return this.emitWithAck("tasks:batch", { projectId, operations });
  }

  async getProjects(): Promise<any[]> {
    return this.emitWithAck("projects:get");
  }

  async createProject(projectData: any): Promise<string> {
    return this.emitWithAck("projects:create", projectData);
  }

  async getTags(): Promise<any[]> {
    return this.emitWithAck("tags:get");
  }

  async createTag(tagData: any): Promise<string> {
    return this.emitWithAck("tags:create", tagData);
  }

  async updateTag(tagId: string, updates: any): Promise<void> {
    return this.emitWithAck("tags:update", { tagId, updates });
  }

  async notify(config: any): Promise<void> {
    return this.emitWithAck("ui:notify", config);
  }

  async showSnack(config: any): Promise<void> {
    return this.emitWithAck("ui:showSnack", config);
  }

  async openDialog(config: any): Promise<any> {
    return this.emitWithAck("ui:openDialog", config);
  }
}

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

// Instância do cliente que será usada pelas ferramentas
// Cast para any para bypassar verificação de tipo com a classe original do Axios
const spClient = new SocketSuperProductivityClient() as any;

// Gerenciamento de conexão Socket.IO
io.on("connection", (socket) => {
  console.log("Plugin Super Productivity conectado:", socket.id);
  spClient.setSocket(socket);

  socket.on("disconnect", () => {
    console.log("Plugin Super Productivity desconectado:", socket.id);
    if (spClient.socket?.id === socket.id) {
      spClient.setSocket(null);
    }
  });
});

// Map para gerenciar transports por sessão MCP
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    transport = transports[sessionId];
  } else if (!sessionId) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        transports[sid] = transport;
        console.log(`MCP Session initialized: ${sid}`);
      },
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        console.log(`MCP Session closed: ${transport.sessionId}`);
        delete transports[transport.sessionId];
      }
    };

    // Criar nova instância do servidor MCP para esta sessão
    const server = new McpServer({
      name: "super-productivity",
      version: "1.0.0",
    });

    // Registrar ferramentas usando o cliente Socket.IO
    setupTaskTools(server, spClient);
    setupProjectTools(server, spClient);
    setupSmartActions(server, spClient);
    setupUITools(server, spClient);
    setupTagTools(server, spClient);

    await server.connect(transport);
  } else {
    return res.status(400).json({
      error: { message: "Bad Request: No valid session ID" },
    });
  }

  await transport.handleRequest(req, res, req.body);
});

const handleSessionRequest = async (
  req: express.Request,
  res: express.Response,
) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    return res.status(404).send("Session not found");
  }
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

app.get("/mcp", handleSessionRequest);
app.delete("/mcp", handleSessionRequest);

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(
    `Super Productivity MCP Server running on http://localhost:${port}/mcp`,
  );
});
