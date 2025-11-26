(function () {
  console.log("MCP Bridge: Loading plugin logic...");

  function initPlugin(api) {
    console.log("MCP Bridge: Initializing with API...");

    // Conectar ao servidor MCP local
    // Assume que o servidor MCP está rodando na porta 3000
    var socket = io("http://localhost:3000", {
      reconnectionDelayMax: 10000,
    });

    socket.on("connect", function () {
      console.log("MCP Bridge: Connected to MCP Server via WebSocket");
    });

    socket.on("disconnect", function () {
      console.log("MCP Bridge: Disconnected from MCP Server");
    });

    socket.on("connect_error", function (err) {
      console.error("MCP Bridge: Connection error:", err);
    });

    // --- Command Handlers (Server -> Plugin) ---

    socket.on("tasks:get", function (data, callback) {
      api.getTasks()
        .then(function (tasks) { callback(tasks); })
        .catch(function (err) { callback({ error: err.message || String(err) }); });
    });

    socket.on("tasks:getCurrent", function (data, callback) {
      api.getCurrentContextTasks()
        .then(function (tasks) { callback(tasks); })
        .catch(function (err) { callback({ error: err.message || String(err) }); });
    });

    socket.on("tasks:create", function (taskData, callback) {
      api.addTask(taskData)
        .then(function (taskId) { callback(taskId); })
        .catch(function (err) { callback({ error: err.message || String(err) }); });
    });

    socket.on("tasks:update", function (data, callback) {
      api.updateTask(data.taskId, data.updates)
        .then(function () { callback({ success: true }); })
        .catch(function (err) { callback({ error: err.message || String(err) }); });
    });

    socket.on("tasks:delete", function (data, callback) {
      api.deleteTask(data.taskId)
        .then(function () { callback({ success: true }); })
        .catch(function (err) { callback({ error: err.message || String(err) }); });
    });

    socket.on("tasks:batch", function (data, callback) {
      // api.batchUpdateForProject espera um objeto com operações
      // O cliente MCP envia { projectId, operations }
      // Verifique a assinatura correta na documentação ou tipos se disponível.
      // Supondo que batchUpdateForProject receba o objeto inteiro ou apenas as ops.
      // Se a API do plugin expõe batchUpdateForProject, vamos tentar passar o payload.
      api.batchUpdateForProject(data)
        .then(function (result) { callback(result); })
        .catch(function (err) { callback({ error: err.message || String(err) }); });
    });

    socket.on("projects:get", function (data, callback) {
      api.getAllProjects()
        .then(function (projects) { callback(projects); })
        .catch(function (err) { callback({ error: err.message || String(err) }); });
    });

    socket.on("projects:create", function (projectData, callback) {
      api.addProject(projectData)
        .then(function (projectId) { callback(projectId); })
        .catch(function (err) { callback({ error: err.message || String(err) }); });
    });

    socket.on("tags:get", function (data, callback) {
      api.getAllTags()
        .then(function (tags) { callback(tags); })
        .catch(function (err) { callback({ error: err.message || String(err) }); });
    });

    // --- Event Hooks (Plugin -> Server) ---

    api.registerHook("anyTaskUpdate", function (payload) {
      socket.emit("event:taskUpdate", payload);
    });

    api.registerHook("projectListUpdate", function (payload) {
      socket.emit("event:projectListUpdate", payload);
    });

    api.registerHook("currentTaskChange", function (payload) {
      socket.emit("event:currentTaskChange", payload);
    });

    api.registerHook("taskComplete", function (payload) {
        socket.emit("event:taskComplete", payload);
    });
  }

  // Inicialização
  if (typeof PluginAPI !== "undefined") {
    initPlugin(PluginAPI);
  } else {
    console.error("MCP Bridge: PluginAPI not found!");
  }
})();
