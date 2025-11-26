import axios, { AxiosInstance } from "axios";

export interface SPClientConfig {
  baseUrl: string;
  apiKey?: string;
}

export class SuperProductivityClient {
  private client: AxiosInstance;

  constructor(config: SPClientConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
    });
  }

  async getTasks(): Promise<any[]> {
    const response = await this.client.get("/api/tasks");
    return response.data.data;
  }

  async getCurrentContextTasks(): Promise<any[]> {
    const response = await this.client.get("/api/tasks/current");
    return response.data.data;
  }

  async createTask(taskData: any): Promise<string> {
    const response = await this.client.post("/api/tasks", taskData);
    return response.data.taskId;
  }

  async updateTask(taskId: string, updates: any): Promise<void> {
    await this.client.patch(`/api/tasks/${taskId}`, updates);
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.client.delete(`/api/tasks/${taskId}`);
  }

  async batchUpdate(projectId: string, operations: any[]): Promise<any> {
    const response = await this.client.post("/api/tasks/batch", {
      projectId,
      operations,
    });
    return response.data.data;
  }

  async getProjects(): Promise<any[]> {
    const response = await this.client.get("/api/projects");
    return response.data.data;
  }

  async createProject(projectData: any): Promise<string> {
    const response = await this.client.post("/api/projects", projectData);
    return response.data.projectId;
  }

  async getTags(): Promise<any[]> {
    const response = await this.client.get("/api/tags");
    return response.data.data;
  }

  async createTag(tagData: any): Promise<string> {
    // Placeholder for HTTP implementation
    throw new Error("Not implemented for HTTP client");
  }

  async updateTag(tagId: string, updates: any): Promise<void> {
    // Placeholder for HTTP implementation
    throw new Error("Not implemented for HTTP client");
  }

  async notify(config: any): Promise<void> {
    // Placeholder for HTTP implementation
    throw new Error("Not implemented for HTTP client");
  }

  async showSnack(config: any): Promise<void> {
    // Placeholder for HTTP implementation
    throw new Error("Not implemented for HTTP client");
  }

  async openDialog(config: any): Promise<any> {
    // Placeholder for HTTP implementation
    throw new Error("Not implemented for HTTP client");
  }
}
