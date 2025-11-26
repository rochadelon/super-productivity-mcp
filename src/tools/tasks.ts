import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SuperProductivityClient } from '../client/sp-client.js';

export function setupTaskTools(server: McpServer, client: SuperProductivityClient) {
  // Tool: Listar tarefas
  server.tool(
    'list_tasks',
    {
      projectId: z.string().optional(),
      includeArchived: z.boolean().default(false),
      currentContextOnly: z.boolean().default(false)
    },
    async ({ projectId, includeArchived, currentContextOnly }) => {
      try {
        const tasks = currentContextOnly
          ? await client.getCurrentContextTasks()
          : await client.getTasks();

        let filteredTasks = tasks;
        if (projectId) {
          filteredTasks = tasks.filter(t => t.projectId === projectId);
        }

        const output = {
          count: filteredTasks.length,
          tasks: filteredTasks.map(t => ({
            id: t.id,
            title: t.title,
            isDone: t.isDone,
            timeEstimate: t.timeEstimate,
            timeSpent: t.timeSpent,
            projectId: t.projectId,
            notes: t.notes
          }))
        };

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(output, null, 2)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Tool: Criar tarefa
  server.tool(
    'create_task',
    {
      title: z.string().describe('Task title'),
      projectId: z.string().optional().describe('Project ID to add task to'),
      notes: z.string().optional().describe('Task notes/description'),
      timeEstimate: z.number().optional().describe('Time estimate in milliseconds'),
      tagIds: z.array(z.string()).optional().describe('Array of tag IDs'),
      parentId: z.string().optional().describe('Parent task ID for subtasks')
    },
    async (params) => {
      try {
        const taskId = await client.createTask(params);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              taskId,
              message: `Task created: ${params.title}`
            })
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Tool: Atualizar tarefa
  server.tool(
    'update_task',
    {
      taskId: z.string().describe('Task ID to update'),
      title: z.string().optional(),
      notes: z.string().optional(),
      timeEstimate: z.number().optional(),
      isDone: z.boolean().optional(),
      projectId: z.string().optional()
    },
    async ({ taskId, ...updates }) => {
      try {
        await client.updateTask(taskId, updates);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Task updated successfully'
            })
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Tool: Completar tarefa
  server.tool(
    'complete_task',
    {
      taskId: z.string().describe('Task ID to complete')
    },
    async ({ taskId }) => {
      try {
        await client.updateTask(taskId, { isDone: true });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Task marked as complete'
            })
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Tool: Batch operations
  server.tool(
    'batch_update_tasks',
    {
      projectId: z.string().describe('Project ID for batch operations'),
      operations: z.array(z.object({
        type: z.enum(['create', 'update', 'delete', 'reorder']),
        taskId: z.string().optional(),
        tempId: z.string().optional(),
        data: z.record(z.any()).optional(),
        updates: z.record(z.any()).optional(),
        taskIds: z.array(z.string()).optional()
      }))
    },
    async ({ projectId, operations }) => {
      try {
        const result = await client.batchUpdate(projectId, operations);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}
