import { PluginAPI, PluginHooks, Task, Project } from '@super-productivity/plugin-api';
import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

class MCPBridgePlugin {
  private api: PluginAPI;
  private server: http.Server;
  private io: Server;
  private app: express.Application;
  private port: number = 3838;

  constructor(api: PluginAPI) {
    this.api = api;
    this.initializeServer();
    this.registerHooks();
    this.setupRoutes();
  }

  private initializeServer(): void {
    this.app = express();
    this.app.use(express.json());
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, {
      cors: { origin: '*' }
    });

    this.server.listen(this.port, () => {
      this.api.log.info(`MCP Bridge listening on port ${this.port}`);
    });
  }

  private registerHooks(): void {
    // Sincronizar atualizações de tarefas para MCP Server
    this.api.registerHook(PluginHooks.ANY_TASK_UPDATE, async (payload) => {
      this.io.emit('task:update', payload);
      this.api.log.debug('Task update broadcasted', payload);
    });

    this.api.registerHook(PluginHooks.PROJECT_LIST_UPDATE, async (payload) => {
      this.io.emit('project:update', payload);
      this.api.log.debug('Project update broadcasted', payload);
    });

    this.api.registerHook(PluginHooks.CURRENT_TASK_CHANGE, async (payload) => {
      this.io.emit('current-task:change', payload);
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', plugin: 'mcp-bridge' });
    });

    // Get all tasks
    this.app.get('/api/tasks', async (req, res) => {
      try {
        const tasks = await this.api.getTasks();
        res.json({ success: true, data: tasks });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get current context tasks
    this.app.get('/api/tasks/current', async (req, res) => {
      try {
        const tasks = await this.api.getCurrentContextTasks();
        res.json({ success: true, data: tasks });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Create task
    this.app.post('/api/tasks', async (req, res) => {
      try {
        const taskId = await this.api.addTask(req.body);
        res.json({ success: true, taskId });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Update task
    this.app.patch('/api/tasks/:taskId', async (req, res) => {
      try {
        await this.api.updateTask(req.params.taskId, req.body);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Delete task
    this.app.delete('/api/tasks/:taskId', async (req, res) => {
      try {
        await this.api.deleteTask(req.params.taskId);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Batch operations
    this.app.post('/api/tasks/batch', async (req, res) => {
      try {
        const result = await this.api.batchUpdateForProject(req.body);
        res.json({ success: true, data: result });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get all projects
    this.app.get('/api/projects', async (req, res) => {
      try {
        const projects = await this.api.getAllProjects();
        res.json({ success: true, data: projects });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Create project
    this.app.post('/api/projects', async (req, res) => {
      try {
        const projectId = await this.api.addProject(req.body);
        res.json({ success: true, projectId });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get all tags
    this.app.get('/api/tags', async (req, res) => {
      try {
        const tags = await this.api.getAllTags();
        res.json({ success: true, data: tags });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }
}

// Inicializar plugin
if (typeof PluginAPI !== 'undefined') {
  // @ts-ignore
  const plugin = new MCPBridgePlugin(PluginAPI);
}
