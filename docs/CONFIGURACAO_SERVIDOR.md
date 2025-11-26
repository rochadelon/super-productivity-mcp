# Configuracao do Servidor MCP

## Indice

1. [Iniciando o Servidor](#iniciando-o-servidor)
2. [Claude Desktop](#claude-desktop)
3. [Cursor IDE](#cursor-ide)
4. [VS Code + Continue](#vs-code--continue)
5. [Outros Clientes MCP](#outros-clientes-mcp)
6. [Verificacao da Conexao](#verificacao-da-conexao)

---

## Iniciando o Servidor

### Passo 1: Build do Projeto

```bash
cd super_produc_mcp
npm install
npm run build
```

### Passo 2: Configurar Variaveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
```

### Passo 3: Iniciar o Servidor

```bash
npm start
```

O servidor estara disponivel em `http://localhost:3000/mcp`

### Passo 4: Verificar Plugin

Certifique-se de que:
1. O Super Productivity esta aberto
2. O plugin `mcp-bridge-plugin.zip` esta instalado
3. O console do Super Productivity mostra "MCP Bridge: Connected to MCP Server"

---

## Claude Desktop

### Localizacao do Arquivo de Configuracao

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### Configuracao

Edite o arquivo `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "super-productivity": {
      "command": "node",
      "args": ["C:\\caminho\\para\\super_produc_mcp\\dist\\index.js"],
      "env": {
        "PORT": "3000"
      }
    }
  }
}
```

**Ou usando URL (se o servidor ja estiver rodando):**

```json
{
  "mcpServers": {
    "super-productivity": {
      "url": "http://localhost:3000/mcp",
      "transport": "streamable-http"
    }
  }
}
```

### Reiniciar Claude Desktop

Apos editar o arquivo, reinicie o Claude Desktop para carregar a configuracao.

---

## Cursor IDE

### Localizacao do Arquivo de Configuracao

**Windows:**
```
%APPDATA%\Cursor\User\globalStorage\cursor.mcp\config.json
```

**macOS:**
```
~/Library/Application Support/Cursor/User/globalStorage/cursor.mcp/config.json
```

**Linux:**
```
~/.config/Cursor/User/globalStorage/cursor.mcp/config.json
```

### Configuracao

Edite o arquivo `config.json`:

```json
{
  "mcpServers": {
    "super-productivity": {
      "command": "node",
      "args": ["/caminho/para/super_produc_mcp/dist/index.js"],
      "env": {
        "PORT": "3000"
      }
    }
  }
}
```

### Via Interface do Cursor

1. Abra as configuracoes do Cursor (`Ctrl+,` ou `Cmd+,`)
2. Procure por "MCP"
3. Clique em "Add MCP Server"
4. Preencha:
   - Nome: `super-productivity`
   - Comando: `node`
   - Args: `C:\caminho\para\super_produc_mcp\dist\index.js`

---

## VS Code + Continue

### Instalacao da Extensao Continue

1. Abra VS Code
2. Va em Extensions (`Ctrl+Shift+X`)
3. Procure e instale "Continue"

### Configuracao

Edite o arquivo `~/.continue/config.json`:

```json
{
  "models": [...],
  "mcpServers": [
    {
      "name": "super-productivity",
      "command": "node",
      "args": ["/caminho/para/super_produc_mcp/dist/index.js"],
      "env": {
        "PORT": "3000"
      }
    }
  ]
}
```

---

## Outros Clientes MCP

### Configuracao Generica via HTTP

Qualquer cliente MCP que suporte o transporte HTTP pode se conectar:

**URL do Servidor:**
```
http://localhost:3000/mcp
```

**Metodo:** POST

**Headers:**
```
Content-Type: application/json
```

**Exemplo de Requisicao (Initialize):**
```json
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "meu-cliente",
      "version": "1.0.0"
    }
  },
  "id": 1
}
```

### Configuracao via Linha de Comando

Se o cliente suporta iniciar o servidor como processo filho:

```bash
node /caminho/para/super_produc_mcp/dist/index.js
```

---

## Verificacao da Conexao

### Teste 1: Health Check do Servidor

```bash
curl http://localhost:3000/mcp -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"capabilities":{}},"id":1}'
```

Resposta esperada:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {...},
    "serverInfo": {
      "name": "super-productivity",
      "version": "1.0.0"
    }
  }
}
```

### Teste 2: Verificar Plugin Conectado

No console do Super Productivity (F12 > Console), voce deve ver:

```
MCP Bridge: Loading plugin logic...
MCP Bridge: Initializing with API...
MCP Bridge: Connected to MCP Server via WebSocket
```

No terminal do servidor MCP:

```
Super Productivity MCP Server running on http://localhost:3000/mcp
Plugin Super Productivity conectado: <socket-id>
```

### Teste 3: Listar Ferramentas

Com o cliente MCP conectado, pergunte ao assistente:

> "Quais ferramentas voce tem disponiveis?"

Ele deve listar:
- `list_tasks`
- `create_task`
- `update_task`
- `complete_task`
- `batch_update_tasks`
- `list_projects`
- `create_project`
- `analyze_productivity`
- `suggest_priorities`
- `create_daily_plan`

---

## Solucao de Problemas

### Erro: "Plugin Super Productivity nao esta conectado"

1. Verifique se o Super Productivity esta aberto
2. Verifique se o plugin foi instalado corretamente
3. Abra o console do Super Productivity (F12) e verifique erros
4. Reinstale o plugin

### Erro: "EADDRINUSE: address already in use"

A porta 3000 ja esta em uso. Mude a porta no `.env`:

```env
PORT=3001
```

E atualize a configuracao do cliente MCP.

### Erro: "Connection refused" no Plugin

O servidor MCP nao esta rodando. Inicie com `npm start`.

### Plugin nao carrega

1. Verifique a versao do Super Productivity (minimo v14.0.0)
2. Verifique se o ZIP contem `manifest.json` na raiz
3. Reinstale o plugin

---

## Executando como Servico (Opcional)

### Windows (usando NSSM)

```bash
nssm install super-productivity-mcp "C:\Program Files\nodejs\node.exe" "C:\caminho\para\super_produc_mcp\dist\index.js"
nssm start super-productivity-mcp
```

### Linux (usando systemd)

Crie `/etc/systemd/system/super-productivity-mcp.service`:

```ini
[Unit]
Description=Super Productivity MCP Server
After=network.target

[Service]
Type=simple
User=seu-usuario
WorkingDirectory=/caminho/para/super_produc_mcp
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Ative o servico:

```bash
sudo systemctl enable super-productivity-mcp
sudo systemctl start super-productivity-mcp
```

### macOS (usando launchd)

Crie `~/Library/LaunchAgents/com.super-productivity-mcp.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.super-productivity-mcp</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/caminho/para/super_produc_mcp/dist/index.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PORT</key>
        <string>3000</string>
    </dict>
</dict>
</plist>
```

Carregue o servico:

```bash
launchctl load ~/Library/LaunchAgents/com.super-productivity-mcp.plist
```
