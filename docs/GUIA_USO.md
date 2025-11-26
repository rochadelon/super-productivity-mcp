# Guia de Uso - Super Productivity MCP

## Visão Geral

O Super Productivity MCP é uma solução que integra o aplicativo Super Productivity com servidores MCP (Model Context Protocol), permitindo que assistentes de IA gerenciem suas tarefas, projetos e produtividade de forma automatizada.

## Arquitetura

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Assistente IA     │────▶│   MCP Server        │────▶│  Super Productivity │
│   (Claude, etc.)    │     │   (porta 3000)      │     │  Plugin (porta 3838)│
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

## Requisitos

- Node.js 18+
- Super Productivity v14.0.0+
- Sistema operacional: Windows, macOS ou Linux

## Instalação

### 1. Instalar o MCP Server

```bash
cd super_produc_mcp
npm install
npm run build
```

### 2. Instalar o Plugin no Super Productivity

1. Abra o Super Productivity
2. Vá em Configurações > Plugins
3. Clique em "Instalar Plugin"
4. Selecione o arquivo `mcp-bridge-plugin.zip`
5. Reinicie o aplicativo

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
SP_PLUGIN_URL=http://localhost:3838
SP_API_KEY=sua_chave_opcional
```

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| PORT | Porta do servidor MCP | 3000 |
| SP_PLUGIN_URL | URL do plugin no Super Productivity | http://localhost:3838 |
| SP_API_KEY | Chave de API (opcional) | - |

## Iniciando o Sistema

### Passo 1: Iniciar o Super Productivity

Abra o Super Productivity normalmente. O plugin será carregado automaticamente.

### Passo 2: Iniciar o MCP Server

```bash
npm start
```

O servidor estará disponível em `http://localhost:3000/mcp`

## Ferramentas Disponíveis

### Gerenciamento de Tarefas

#### list_tasks

Lista todas as tarefas.

Parâmetros:
- `projectId` (opcional): Filtrar por projeto
- `includeArchived` (opcional): Incluir tarefas arquivadas
- `currentContextOnly` (opcional): Apenas tarefas do contexto atual

Exemplo de uso com IA:
> "Liste todas as minhas tarefas pendentes"

#### create_task

Cria uma nova tarefa.

Parâmetros:
- `title` (obrigatório): Título da tarefa
- `projectId` (opcional): ID do projeto
- `taskId` (obrigatório): ID da tarefa
- `title` (opcional): Novo título
- `notes` (opcional): Novas notas
- `timeEstimate` (opcional): Nova estimativa
- `isDone` (opcional): Marcar como concluída
- `projectId` (opcional): Mover para outro projeto

Exemplo de uso com IA:
> "Atualize a tarefa X para adicionar a nota 'Prioridade alta'"

#### complete_task

Marca uma tarefa como concluída.

Parâmetros:
- `taskId` (obrigatório): ID da tarefa

Exemplo de uso com IA:
> "Marque a tarefa 'Revisar relatório' como concluída"

#### batch_update_tasks

Executa operações em lote.

Parâmetros:
- `projectId` (obrigatório): ID do projeto
- `operations`: Array de operações (create, update, delete, reorder)

### Gerenciamento de Projetos

#### list_projects

Lista todos os projetos.

Exemplo de uso com IA:
> "Quais projetos eu tenho?"

#### create_project

Cria um novo projeto.

Parâmetros:
- `title` (obrigatório): Nome do projeto
- `theme` (opcional): Configuração de tema
- `isArchived` (opcional): Se está arquivado

Exemplo de uso com IA:
> "Crie um projeto chamado 'Website Redesign'"

### Ações Inteligentes

#### analyze_productivity

Analisa sua produtividade em um período.

Parâmetros:
- `days` (padrão: 7): Número de dias para análise

Retorna:
- Total de tarefas
- Tarefas concluídas
- Taxa de conclusão
- Tempo estimado vs. tempo gasto
- Precisão das estimativas
- Insights personalizados

Exemplo de uso com IA:
> "Analise minha produtividade dos últimos 14 dias"

#### suggest_priorities

Sugere quais tarefas priorizar.

Parâmetros:
- `projectId` (opcional): Filtrar por projeto
- `maxTasks` (padrão: 5): Número máximo de sugestões

Critérios de priorização:
- Proximidade do deadline
- Ausência de estimativa de tempo
- Presença de subtarefas
- Idade da tarefa

Exemplo de uso com IA:
> "Quais tarefas devo priorizar hoje?"

#### create_daily_plan

Cria um plano de trabalho diário.

Parâmetros:
- `availableHours` (padrão: 8): Horas disponíveis
- `includeBreaks` (padrão: true): Incluir intervalos

Retorna:
- Tarefas selecionadas para o dia
- Tempo total planejado
- Taxa de utilização
- Tempo de pausa recomendado

Exemplo de uso com IA:
> "Crie um plano de trabalho para hoje com 6 horas disponíveis"

## Exemplos de Uso

### Fluxo Diário Típico

1. **Início do dia**
   > "Crie um plano de trabalho para hoje"

2. **Durante o trabalho**
   > "Liste minhas tarefas do projeto X"
   > "Crie uma tarefa para corrigir o bug reportado"

3. **Ao concluir**
   > "Marque a tarefa 'Revisar código' como concluída"

4. **Final do dia**
   > "Analise minha produtividade de hoje"

### Organização Semanal

> "Quais tarefas devo priorizar esta semana?"
> "Analise minha produtividade dos últimos 7 dias"
> "Liste todas as tarefas sem estimativa de tempo"

## Solução de Problemas

### Plugin não carrega

1. Verifique se o Super Productivity está na versão 14.0.0+
2. Reinstale o plugin
3. Verifique os logs do aplicativo

### MCP Server não conecta

1. Verifique se o plugin está ativo no Super Productivity
2. Confirme que a porta 3838 está disponível
3. Verifique as variáveis de ambiente

### Erros de timeout

1. Aumente o timeout nas configurações
2. Verifique a conexão de rede local
3. Reinicie ambos os serviços

## Dicas de Produtividade

1. **Use estimativas de tempo**: Ajuda o sistema a criar planos mais precisos
2. **Organize por projetos**: Facilita a filtragem e análise
3. **Revise regularmente**: Use a análise de produtividade semanalmente
4. **Quebre tarefas grandes**: Subtarefas são melhor priorizadas
5. **Defina deadlines**: Melhora a sugestão de prioridades

## Suporte

Para problemas ou sugestões, abra uma issue no repositório do projeto.