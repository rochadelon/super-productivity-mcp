# Super Productivity MCP

Servidor MCP (Model Context Protocol) para integracao do Super Productivity com assistentes de IA.

## Sobre

Este projeto permite que assistentes de IA (como Claude) gerenciem tarefas, projetos e analisem produtividade diretamente no Super Productivity.

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Assistente IA  │────▶│   MCP Server    │◀───▶│ Super Produc.   │
│  (Claude, etc)  │     │   (porta 3000)  │     │ Plugin (Socket) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Requisitos

- Node.js 18+
- Super Productivity v14.0.0+

## Instalacao Rapida

### 1. MCP Server

```bash
cd super_produc_mcp
npm install
npm run build
npm start
```

### 2. Plugin Super Productivity

1. Abra Super Productivity > Configuracoes > Plugins
2. Instale o arquivo `mcp-bridge-plugin.zip`
3. Reinicie o aplicativo

### 3. Configurar Cliente MCP

Veja [CONFIGURACAO_SERVIDOR.md](docs/CONFIGURACAO_SERVIDOR.md) para instrucoes detalhadas.

**Exemplo para Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "super-productivity": {
      "command": "node",
      "args": ["C:\\caminho\\para\\super_produc_mcp\\dist\\index.js"]
    }
  }
}
```

## Configuracao

Crie um arquivo `.env`:

```env
PORT=3000
```

## Ferramentas Disponiveis

### Tarefas
| Ferramenta | Descricao |
|------------|-----------|
| `list_tasks` | Listar tarefas |
| `create_task` | Criar tarefa |
| `update_task` | Atualizar tarefa |
| `complete_task` | Completar tarefa |
| `batch_update_tasks` | Operacoes em lote |

### Projetos
| Ferramenta | Descricao |
|------------|-----------|
| `list_projects` | Listar projetos |
| `create_project` | Criar projeto |

### Acoes Inteligentes
| Ferramenta | Descricao |
|------------|-----------|
| `analyze_productivity` | Analise de produtividade |
| `suggest_priorities` | Sugestao de prioridades |
| `create_daily_plan` | Plano de trabalho diario |

## Estrutura do Projeto

```
super_produc_mcp/
├── src/
│   ├── index.ts           # Entry point
│   ├── client/
│   │   └── sp-client.ts   # Cliente HTTP (legado)
│   └── tools/
│       ├── tasks.ts       # Ferramentas de tarefas
│       ├── projects.ts    # Ferramentas de projetos
│       └── smart-actions.ts
├── mcp-bridge-plugin/
│   ├── manifest.json      # Manifesto do plugin
│   ├── plugin.js          # Codigo do plugin
│   └── socket.io.min.js   # Biblioteca Socket.IO
├── docs/
│   ├── GUIA_USO.md        # Guia do usuario
│   ├── DESENVOLVIMENTO.md # Documentacao tecnica
│   └── CONFIGURACAO_SERVIDOR.md # Config do servidor
└── package.json
```

## Desenvolvimento

```bash
npm run dev
```

## Docker

```bash
docker build -t super-produc-mcp .
docker run -p 3000:3000 super-produc-mcp
```

## Documentacao

- [Guia de Uso](docs/GUIA_USO.md) - Para usuarios finais
- [Configuracao do Servidor](docs/CONFIGURACAO_SERVIDOR.md) - Como adicionar em clientes MCP
- [Documentacao de Desenvolvimento](docs/DESENVOLVIMENTO.md) - Para desenvolvedores

## Verificacao da Instalacao

1. Inicie o servidor: `npm start`
2. Abra o Super Productivity
3. No console do navegador (F12), verifique: `MCP Bridge: Connected to MCP Server`
4. No terminal do servidor, verifique: `Plugin Super Productivity conectado`

## Licenca

MIT