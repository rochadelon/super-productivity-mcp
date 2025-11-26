import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SuperProductivityClient } from "../client/sp-client.js";

export function setupProjectTools(server: McpServer, client: SuperProductivityClient) {
  // Tool: List Projects
  server.tool(
    "list_projects",
    {},
    async () => {
      try {
        const projects = await client.getProjects();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  count: projects.length,
                  projects: projects,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Create Project
  server.tool(
    "create_project",
    {
      title: z.string().describe("Project title"),
      theme: z.record(z.any()).optional().describe("Project theme configuration"),
      isArchived: z.boolean().optional().default(false),
    },
    async (params) => {
      try {
        const projectId = await client.createProject(params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                projectId,
                message: `Project created: ${params.title}`,
              }),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
