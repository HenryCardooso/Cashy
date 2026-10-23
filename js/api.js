(function () {
  "use strict";

  const apiBase = new URL("api/", document.baseURI);
  let csrfToken = null;
  let csrfRequest = null;

  async function readJson(response) {
    let data;
    try { data = await response.json(); }
    catch (_) { throw new Error("O servidor não retornou uma resposta válida. Abra o Cashy pelo servidor PHP."); }
    if (!response.ok || data.ok === false) {
      const error = new Error(data.message || "Não foi possível concluir esta operação.");
      error.code = data.error || "request_failed";
      error.status = response.status;
      if (response.status === 419) { csrfToken = null; csrfRequest = null; }
      throw error;
    }
    if (data.csrf_token) csrfToken = data.csrf_token;
    return data;
  }

  async function getCsrfToken() {
    if (csrfToken) return csrfToken;
    if (!csrfRequest) {
      csrfRequest = fetch(new URL("auth.php?action=csrf", apiBase), {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        cache: "no-store"
      }).then(readJson).then((data) => data.csrf_token).catch((error) => {
        csrfRequest = null;
        throw error;
      });
    }
    return csrfRequest;
  }

  async function request(endpoint, options) {
    const settings = options || {};
    const method = String(settings.method || "GET").toUpperCase();
    const headers = { Accept: "application/json" };
    const init = { method, credentials: "same-origin", cache: "no-store", headers };
    if (settings.body !== undefined) {
      headers["Content-Type"] = "application/json";
      headers["X-CSRF-Token"] = await getCsrfToken();
      init.body = JSON.stringify(settings.body);
    }
    const response = await fetch(new URL(endpoint, apiBase), init);
    return readJson(response);
  }

  window.CashyAPI = {
    auth: {
      me: () => request("auth.php?action=me"),
      register: (data) => request("auth.php", { method: "POST", body: Object.assign({ action: "register" }, data) }),
      login: (data) => request("auth.php", { method: "POST", body: Object.assign({ action: "login" }, data) }),
      logout: () => request("auth.php", { method: "POST", body: { action: "logout" } })
    },
    transactions: {
      list: async () => (await request("transactions.php")).items,
      create: async (item) => (await request("transactions.php", { method: "POST", body: Object.assign({ action: "create" }, item) })).item,
      update: async (item) => (await request("transactions.php", { method: "POST", body: Object.assign({ action: "update" }, item) })).item,
      remove: (id) => request("transactions.php", { method: "POST", body: { action: "delete", id } })
    },
    goals: {
      list: async () => (await request("goals.php")).items,
      create: async (item) => (await request("goals.php", { method: "POST", body: Object.assign({ action: "create" }, item) })).item,
      update: async (item) => (await request("goals.php", { method: "POST", body: Object.assign({ action: "update" }, item) })).item,
      remove: (id) => request("goals.php", { method: "POST", body: { action: "delete", id } })
    },
    education: {
      get: () => request("education.php"),
      complete: (courseId) => request("education.php", { method: "POST", body: { action: "complete", course_id: courseId } }),
      saveChecklist: (items) => request("education.php", { method: "POST", body: { action: "checklist", items } })
    },
    chat: {
      send: (messages) => request("chat.php", { method: "POST", body: { messages } })
    },
    account: {
      remove: () => request("account.php", { method: "POST", body: { action: "delete" } })
    }
  };
})();
