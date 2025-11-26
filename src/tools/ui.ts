import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SuperProductivityClient } from "../client/sp-client.js";

export function setupUITools(server: McpServer, client: SuperProductivityClient) {
    // Tool: Show Notification
    server.tool(
        "show_notification",
        {
            message: z.string().describe("Notification message"),
            type: z.enum(["SUCCESS", "ERROR", "INFO"]).optional().default("INFO"),
            duration: z.number().optional().describe("Duration in ms"),
        },
        async (params) => {
            try {
                await client.notify(params);
                return {
                    content: [
                        {
                            type: "text",
                            text: "Notification sent",
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

    // Tool: Show Snack
    server.tool(
        "show_snack",
        {
            message: z.string().describe("Snack message"),
            type: z.enum(["SUCCESS", "ERROR", "INFO"]).optional().default("INFO"),
            config: z.record(z.any()).optional(),
        },
        async (params) => {
            try {
                await client.showSnack(params);
                return {
                    content: [
                        {
                            type: "text",
                            text: "Snack shown",
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

    // Tool: Open Dialog
    server.tool(
        "open_dialog",
        {
            type: z.enum(["CONFIRM", "PROMPT"]).optional().default("CONFIRM"),
            title: z.string().optional(),
            message: z.string().describe("Dialog message"),
            confirmText: z.string().optional(),
            cancelText: z.string().optional(),
        },
        async (params) => {
            try {
                const result = await client.openDialog(params);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
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
