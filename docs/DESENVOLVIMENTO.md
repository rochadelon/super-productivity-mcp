# Documentacao de Desenvolvimento - Super Productivity MCP

## Indice

1. [Arquitetura do Sistema](#arquitetura-do-sistema)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [MCP Server](#mcp-server)
4. [Plugin Super Productivity](#plugin-super-productivity)
5. [API Reference](#api-reference)
6. [Fluxo de Dados](#fluxo-de-dados)
7. [Desenvolvimento Local](#desenvolvimento-local)
8. [Testes](#testes)
9. [Build e Deploy](#build-e-deploy)

---

## Arquitetura do Sistema

### Diagrama de Componentes

```
+------------------+       HTTP/MCP        +------------------+       HTTP/REST       +------------------+
|                  |  POST /mcp            |                  |  GET/POST/PATCH/DEL  |                  |
|  Cliente MCP     |--------------------->|   MCP Server     |--------------------->|  SP Plugin       |
|  (Claude, etc)   |<---------------------|   (Express)      |<---------------------|  (Bridge)        |
|                  |   JSON-RPC Response   |                  |   JSON Response       |                  |
+------------------+                       +------------------+                       +------------------+
                                                   |                                          |
                                                   |                                          |
                                                   v                                          v
                                           +-------------+                            +-------------+
                                           | Tools:      |                            | Super       |
                                           | - Tasks     |                            | Productivity|
                                           | - Projects  |                            | App         |
                                           | - Smart     |                            |             |
                                           +-------------+                            +-------------+
```

### Tecnologias Utilizadas

| Componente | Tecnologia | Versao |
|------------|------------|--------|
| MCP Server | Node.js + Express | 5.1.0 |
| SDK MCP | @modelcontextprotocol/sdk | 1.0.1 |
| HTTP Client | Axios | 1.13.2 |
| Validacao | Zod | 3.23.8 |
| Linguagem | TypeScript | 5.5.3 |
| Plugin | JavaScript ES5 | - |

---

## Estrutura do Projeto

```
super_produc_mcp/
├── src/
│   ├── index.ts              # Entry point do servidor
│   ├── client/
│   │   └── sp-client.ts      # Cliente HTTP para o plugin
│   └── tools/
│       ├── tasks.ts          # Ferramentas de tarefas
│       ├── projects.ts       # Ferramentas de projetos
│       └── smart-actions.ts  # Acoes inteligentes
├── mcp-bridge-plugin/
│   ├── manifest.json         # Manifesto do plugin
│   ├── plugin.js             # Codigo do plugin (JS)
│   ├── plugin.ts             # Codigo fonte (TS)
│   ├── package.json          # Dependencias do plugin
│   └── tsconfig.json         # Config TypeScript
├── dist/                     # Build compilado
├── docs/                     # Documentacao
├── package.json              # Dependencias do projeto
├── tsconfig.json             # Config TypeScript
└── Dockerfile                # Container Docker
```

---

## MCP Server

### Entry Point (src/index.ts)

O servidor MCP utiliza o protocolo Streamable HTTP para comunicacao.

```typescript
// Configuracao do servidor
const app = express();
app.use(express.json());

// Gerenciamento de sessoes
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Endpoint principal
app.post("/mcp", async (req, res) => {
  // Cria ou reutiliza transport baseado no session ID
  // Registra ferramentas no servidor MCP
  // Processa requisicao
});
```

### Gerenciamento de Sessoes

Cada cliente MCP recebe uma sessao unica:

1. Primeira requisicao: cria novo transport e sessao
2. Requisicoes subsequentes: reutiliza transport existente
3. Cleanup automatico quando sessao fecha

### Registro de Ferramentas

```typescript
const server = new McpServer({
  name: "super-productivity",
  version: "1.0.0",
});

setupTaskTools(server, spClient);
setupProjectTools(server, spClient);
setupSmartActions(server, spClient);

await server.connect(transport);
```

---

## Plugin Super Productivity

### Manifest (manifest.json)

```json
{
  "name": "MCP Bridge",
  "id": "mcp-bridge",
  "manifestVersion": 1,
  "version": "1.0.0",
  "minSupVersion": "14.0.0",
  "description": "Bridge between Super Productivity and MCP servers",
  "hooks": [
    "taskComplete",
    "taskUpdate",
    "taskDelete",
    "currentTaskChange",
    "anyTaskUpdate",
    "projectListUpdate"
  ],
  "permissions": [
    "tasks:read",
    "tasks:write",
    "projects:read",
    "projects:write",
    "tags:read",
    "tags:write",
    "nodeExecution"
  ]
}
```

### Hooks Disponiveis

| Hook | Descricao | Payload |
|------|-----------|---------|
| taskComplete | Tarefa marcada como concluida | Task object |
| taskUpdate | Tarefa atualizada | Task object |
| taskDelete | Tarefa deletada | Task ID |
| currentTaskChange | Tarefa atual mudou | Task object |
| anyTaskUpdate | Qualquer atualizacao de tarefa | Task object |
| projectListUpdate | Lista de projetos atualizada | Project[] |

### Estrutura do Plugin (plugin.js)

```javascript
(function() {
  var MCPBridgePlugin = {
    port: 3838,
    
    init: function(api) {
      this.api = api;
      this.setupRoutes();
      this.registerHooks();
    },
    
    registerHooks: function() {
      // Registra listeners para eventos do SP
    },
    
    setupRoutes: function() {
      // Registra endpoints REST
    }
  };
  
  if (typeof PluginAPI !== 'undefined') {
    MCPBridgePlugin.init(PluginAPI);
  }
})();
```

---

## API Reference

### Cliente HTTP (sp-client.ts)

#### Construtor

```typescript
const client = new SuperProductivityClient({
  baseUrl: "http://localhost:3838",
  apiKey: "opcional"
});
```

#### Metodos de Tarefas

| Metodo | Retorno | Descricao |
|--------|---------|-----------|
| getTasks() | Promise<Task[]> | Lista todas as tarefas |
| getCurrentContextTasks() | Promise<Task[]> | Tarefas do contexto atual |
| createTask(data) | Promise<string> | Cria tarefa, retorna ID |
| updateTask(id, updates) | Promise<void> | Atualiza tarefa |
| deleteTask(id) | Promise<void> | Remove tarefa |
| batchUpdate(projectId, ops) | Promise<any> | Operacoes em lote |

#### Metodos de Projetos

| Metodo | Retorno | Descricao |
|--------|---------|-----------|
| getProjects() | Promise<Project[]> | Lista projetos |
| createProject(data) | Promise<string> | Cria projeto |

#### Metodos de Tags

| Metodo | Retorno | Descricao |
|--------|---------|-----------|
| getTags() | Promise<Tag[]> | Lista tags |

### Ferramentas MCP

#### list_tasks

```typescript
server.tool(
  'list_tasks',
  {
    projectId: z.string().optional(),
    includeArchived: z.boolean().default(false),
    currentContextOnly: z.boolean().default(false)
  },
  async (params) => { /* ... */ }
);
```

#### create_task

```typescript
server.tool(
  'create_task',
  {
    title: z.string(),
    projectId: z.string().optional(),
    notes: z.string().optional(),
    timeEstimate: z.number().optional(),
    tagIds: z.array(z.string()).optional(),
    parentId: z.string().optional()
  },
  async (params) => { /* ... */ }
);
```

#### update_task

```typescript
server.tool(
  'update_task',
  {
    taskId: z.string(),
    title: z.string().optional(),
    notes: z.string().optional(),
    timeEstimate: z.number().optional(),
    isDone: z.boolean().optional(),
    projectId: z.string().optional()
  },
  async (params) => { /* ... */ }
);
```

#### complete_task

```typescript
server.tool(
  'complete_task',
  {
    taskId: z.string()
  },
  async (params) => { /* ... */ }
);
```

#### batch_update_tasks

```typescript
server.tool(
  'batch_update_tasks',
  {
    projectId: z.string(),
    operations: z.array(z.object({
      type: z.enum(['create', 'update', 'delete', 'reorder']),
      taskId: z.string().optional(),
      tempId: z.string().optional(),
      data: z.record(z.any()).optional(),
      updates: z.record(z.any()).optional(),
      taskIds: z.array(z.string()).optional()
    }))
  },
  async (params) => { /* ... */ }
);
```

#### list_projects

```typescript
server.tool(
  'list_projects',
  {},
  async () => { /* ... */ }
);
```

#### create_project

```typescript
server.tool(
  'create_project',
  {
    title: z.string(),
    theme: z.record(z.any()).optional(),
    isArchived: z.boolean().optional().default(false)
  },
  async (params) => { /* ... */ }
);
```

#### analyze_productivity

```typescript
server.tool(
  'analyze_productivity',
  {
    days: z.number().default(7)
  },
  async (params) => { /* ... */ }
);
```

Retorno:
```json
{
  "period": "7 days",
  "totalTasks": 25,
  "completedTasks": 18,
  "completionRate": "72.0%",
  "totalTimeEstimated": "40.5 hours",
  "totalTimeSpent": "38.2 hours",
  "estimationAccuracy": "94.3%",
  "insights": [
    "Excelente taxa de conclusao!"
  ]
}
```

#### suggest_priorities

```typescript
server.tool(
  'suggest_priorities',
  {
    projectId: z.string().optional(),
    maxTasks: z.number().default(5)
  },
  async (params) => { /* ... */ }
);
```

Algoritmo de priorizacao:
- Deadline < 24h: +50 pontos
- Deadline < 3 dias: +30 pontos
- Deadline < 7 dias: +10 pontos
- Sem estimativa: +15 pontos
- Com subtarefas: +20 pontos
- Idade > 7 dias: +10 pontos
- Idade > 14 dias: +15 pontos

#### create_daily_plan

```typescript
server.tool(
  'create_daily_plan',
  {
    availableHours: z.number().default(8),
    includeBreaks: z.boolean().default(true)
  },
  async (params) => { /* ... */ }
);
```

---

## Fluxo de Dados

### Criacao de Tarefa

```
1. Cliente MCP envia: POST /mcp
   Body: { method: "tools/call", params: { name: "create_task", arguments: {...} } }

2. MCP Server processa:
   - Valida parametros com Zod
   - Chama spClient.createTask()

3. SP Client envia: POST http://localhost:3838/api/tasks
   Body: { title: "...", projectId: "...", ... }

4. Plugin recebe e processa:
   - Chama api.addTask()
   - Retorna { success: true, taskId: "..." }

5. Resposta volta pela cadeia ate o cliente MCP
```

### Eventos em Tempo Real

```
1. Usuario completa tarefa no Super Productivity

2. Plugin detecta via hook "taskComplete"

3. Plugin emite evento via broadcast:
   io.emit('task:update', payload)

4. Clientes conectados recebem atualizacao
```

---

## Desenvolvimento Local

### Prerequisitos

```bash
node --version  # v18+
npm --version   # v9+
```

### Setup Inicial

```bash
# Clonar/baixar projeto
cd super_produc_mcp

# Instalar dependencias
npm install

# Criar arquivo de configuracao
cp .env.example .env
```

### Modo Desenvolvimento

```bash
# Servidor com hot-reload
npm run dev

# Em outro terminal, abra o Super Productivity
```

### Variaveis de Ambiente

```env
# Porta do servidor MCP
PORT=3000

# URL do plugin (Super Productivity)
SP_PLUGIN_URL=http://localhost:3838

# Chave de API (opcional)
SP_API_KEY=
```

### Debug

Para debugar o servidor:

```bash
# Com Node.js Inspector
node --inspect dist/index.js

# Ou com VS Code launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug MCP Server",
  "program": "${workspaceFolder}/dist/index.js",
  "preLaunchTask": "npm: build"
}
```

---

## Testes

### Teste Manual do Plugin

1. Instale o plugin no Super Productivity
2. Verifique se a porta 3838 esta escutando:

```bash
curl http://localhost:3838/health
# Esperado: {"status":"ok","plugin":"mcp-bridge"}
```

### Teste Manual do MCP Server

```bash
# Iniciar servidor
npm start

# Testar endpoint
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"capabilities":{}},"id":1}'
```

### Teste de Ferramentas

```bash
# Listar tarefas via curl (apos inicializar sessao)
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-session-id: <SESSION_ID>" \
  -d '{
    "jsonrpc":"2.0",
    "method":"tools/call",
    "params":{
      "name":"list_tasks",
      "arguments":{}
    },
    "id":2
  }'
```

---

## Build e Deploy

### Build Local

```bash
# Compilar TypeScript
npm run build

# Verificar output
ls -la dist/
```

### Build do Plugin

```bash
cd mcp-bridge-plugin

# Criar ZIP para distribuicao
7z a ../mcp-bridge-plugin.zip manifest.json plugin.js
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

ENV PORT=3000
ENV SP_PLUGIN_URL=http://host.docker.internal:3838

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Build e execucao:

```bash
# Build da imagem
docker build -t super-produc-mcp .

# Executar container
docker run -p 3000:3000 \
  -e SP_PLUGIN_URL=http://host.docker.internal:3838 \
  super-produc-mcp
```

### Producao

Checklist para deploy:

- [ ] Variaveis de ambiente configuradas
- [ ] HTTPS habilitado (recomendado)
- [ ] Rate limiting configurado
- [ ] Logs estruturados
- [ ] Health check endpoint
- [ ] Monitoramento de erros

---

## Extensao do Sistema

### Adicionando Nova Ferramenta

1. Criar arquivo em `src/tools/`:

```typescript
// src/tools/new-feature.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SuperProductivityClient } from "../client/sp-client.js";

export function setupNewFeature(server: McpServer, client: SuperProductivityClient) {
  server.tool(
    'new_tool_name',
    {
      param1: z.string(),
      param2: z.number().optional()
    },
    async (params) => {
      try {
        // Implementacao
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true })
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
```

2. Registrar em `src/index.ts`:

```typescript
import { setupNewFeature } from "./tools/new-feature.js";

// No bloco de registro de ferramentas:
setupNewFeature(server, spClient);
```

### Adicionando Endpoint ao Plugin

1. Editar `mcp-bridge-plugin/plugin.js`:

```javascript
setupRoutes: function() {
  var self = this;
  
  // Novo endpoint
  this.api.registerRoute('GET', '/api/new-endpoint', function(req, res) {
    self.api.someMethod().then(function(result) {
      res.json({ success: true, data: result });
    }).catch(function(error) {
      res.status(500).json({ success: false, error: error.message });
    });
  });
}
```

2. Atualizar `sp-client.ts`:

```typescript
async newMethod(): Promise<any> {
  const response = await this.client.get("/api/new-endpoint");
  return response.data.data;
}
```

---

## Troubleshooting

### Erro: ECONNREFUSED

O plugin nao esta ativo ou a porta esta errada.

```bash
# Verificar se porta esta em uso
netstat -an | grep 3838
```

### Erro: Session not found

A sessao MCP expirou. Reinicie a conexao do cliente.

### Erro: Plugin not loading

1. Verificar versao do Super Productivity
2. Verificar estrutura do ZIP (manifest.json na raiz)
3. Verificar logs do aplicativo

### Performance lenta

1. Reduzir numero de tarefas retornadas
2. Usar filtros (projectId, currentContextOnly)
3. Implementar paginacao se necessario

---

## Contribuindo

1. Fork do repositorio
2. Criar branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abrir Pull Request

### Padroes de Codigo

- TypeScript strict mode
- ESLint + Prettier
- Commits em portugues ou ingles
- Documentar funcoes publicas