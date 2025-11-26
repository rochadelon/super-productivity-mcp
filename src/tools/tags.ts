import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SuperProductivityClient } from "../client/sp-client.js";

export function setupTagTools(server: McpServer, client: SuperProductivityClient) {
    // Tool: List Tags
    server.tool(
        "list_tags",
        {},
        async () => {
            try {
                const tags = await client.getTags();
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(
                                {
                                    count: tags.length,
                                    tags: tags,
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

    // Tool: Create Tag
    server.tool(
        "create_tag",
        {
            title: z.string().describe("Tag title"),
            color: z.string().optional().describe("Tag color (hex)"),
            icon: z.string().optional().describe("Tag icon name"),
        },
        async (params) => {
            try {
                const tagId = await client.createTag(params);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: true,
                                tagId,
                                message: `Tag created: ${params.title}`,
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

    // Tool: Update Tag
    server.tool(
        "update_tag",
        {
            tagId: z.string().describe("Tag ID to update"),
            title: z.string().optional(),
            color: z.string().optional(),
            icon: z.string().optional(),
        },
        async ({ tagId, ...updates }) => {
            try {
                await client.updateTag(tagId, updates);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                success: true,
                                message: "Tag updated successfully",
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
