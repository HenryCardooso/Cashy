(async function () {
  "use strict";
  const icons = { leaf: "🌱", sun: "☀️", spark: "✨", moon: "🌙", flower: "🌼", wave: "🌊" };
  const status = document.getElementById("profileStatus");
  const sidebar = document.getElementById("sidebar");
  const menu = document.getElementById("menuToggle");
  const dialog = document.getElementById("deleteAccountDialog");
  const moneyDate = (value) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(String(value).replace(" ", "T")));
  const courses = window.CASHY_CURSOS || [];
  let user;
  try {
    const session = await CashyAPI.auth.me();
    if (!session.authenticated) { location.replace("login.html"); return; }
    user = session.user;
    const [profile, education] = await Promise.all([CashyAPI.profile.get(), CashyAPI.education.get()]);
    document.getElementById("userName").textContent = user.name;
    document.getElementById("profileName").value = profile.name;
    document.getElementById("profileEmail").value = profile.email;
    document.getElementById("avatarKey").value = profile.avatar_key;
    document.getElementById("avatarColor").value = profile.avatar_color;
    document.getElementById("learningReminder").checked = Boolean(profile.preferences?.learning_reminder);
    document.getElementById("profileCourses").textContent = profile.completed_courses;
    document.getElementById("profileTopics").textContent = profile.completed_topics;
    document.getElementById("profileXp").textContent = profile.xp + " XP";
    document.getElementById("profileSince").textContent = moneyDate(profile.created_at);
    renderAvatar();
    renderCourses(education);
    document.getElementById("logout").addEventListener("click", async function () { this.disabled = true; try { await CashyAPI.auth.logout(); } finally { location.replace("login.html"); } });
    menu.addEventListener("click", () => { const open = sidebar.classList.toggle("open"); menu.setAttribute("aria-expanded", String(open)); menu.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu"); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && sidebar.classList.contains("open")) { sidebar.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); menu.focus(); } });

    function renderAvatar() {
      const icon = icons[document.getElementById("avatarKey").value] || icons.leaf;
      const color = document.getElementById("avatarColor").value;
      const preview = document.getElementById("avatarPreview");
      preview.textContent = icon; preview.dataset.color = color;
      const avatar = document.getElementById("avatar"); avatar.textContent = icon; avatar.dataset.color = color;
    }
    document.getElementById("avatarKey").addEventListener("change", renderAvatar);
    document.getElementById("avatarColor").addEventListener("change", renderAvatar);

    function renderCourses(state) {
      const list = document.getElementById("profileCourseList");
      const completed = new Set(state.completed || []);
      const partial = Object.entries(state.states || {}).sort((a, b) => String(b[1].last_accessed_at).localeCompare(String(a[1].last_accessed_at)));
      const ordered = [...partial.map(([id]) => id), ...courses.map((course) => course.id)].filter((id, index, all) => all.indexOf(id) === index && !completed.has(id));
      const shown = ordered.slice(0, 5).map((id) => {
        const course = courses.find((item) => item.id === id); if (!course) return null;
        const progress = state.states?.[id];
        const total = course.topics.length;
        const done = Math.min(total, (progress?.completed_topics || []).length);
        const link = document.createElement("a"); link.href = "curso.html?id=" + encodeURIComponent(id);
        const title = document.createElement("strong"); title.textContent = course.title;
        const detail = document.createElement("span"); detail.textContent = progress ? done + " de " + total + " etapas · " + (done < total ? "continuar" : "rever") : "Ainda não iniciado";
        link.append(title, detail); return link;
      }).filter(Boolean);
      (state.completed || []).forEach((id) => { const course = courses.find((item) => item.id === id); if (!course) return; const link = document.createElement("a"); link.href = "curso.html?id=" + encodeURIComponent(id); link.innerHTML = '<strong></strong><span>Concluído · rever conteúdo e quiz</span>'; link.querySelector("strong").textContent = course.title; shown.push(link); });
      list.replaceChildren(...(shown.length ? shown : [Object.assign(document.createElement("p"), { textContent: "Explore a trilha para começar seu primeiro curso." })]));
    }

    document.getElementById("profileForm").addEventListener("submit", async (event) => {
      event.preventDefault(); const button = event.currentTarget.querySelector("button[type=submit]"); button.disabled = true; status.textContent = "Salvando suas configurações…";
      try { await CashyAPI.profile.update({ name: document.getElementById("profileName").value.trim(), avatar_key: document.getElementById("avatarKey").value, avatar_color: document.getElementById("avatarColor").value, preferences: { learning_reminder: document.getElementById("learningReminder").checked } }); document.getElementById("userName").textContent = document.getElementById("profileName").value.trim(); status.textContent = "Perfil atualizado."; }
      catch (error) { status.textContent = error.message; }
      finally { button.disabled = false; }
    });
    document.getElementById("passwordForm").addEventListener("submit", async (event) => {
      event.preventDefault(); const form = event.currentTarget; const current = form.elements.current_password.value; const next = form.elements.new_password.value;
      if (next !== form.elements.confirm_password.value) { status.textContent = "A confirmação da nova senha não confere."; form.elements.confirm_password.focus(); return; }
      const button = form.querySelector("button[type=submit]"); button.disabled = true;
      try { await CashyAPI.profile.changePassword(current, next); form.reset(); status.textContent = "Senha atualizada com sucesso."; }
      catch (error) { status.textContent = error.message; }
      finally { button.disabled = false; }
    });
    document.getElementById("openDeleteAccount").addEventListener("click", () => { document.getElementById("deleteAccountStatus").textContent = ""; dialog.showModal(); });
    document.getElementById("closeDeleteAccount").addEventListener("click", () => dialog.close());
    document.getElementById("deleteAccountForm").addEventListener("submit", async (event) => {
      event.preventDefault(); const form = event.currentTarget; if (form.elements.confirmation.value !== "EXCLUIR") { document.getElementById("deleteAccountStatus").textContent = "Digite EXCLUIR exatamente para confirmar."; return; }
      const button = form.querySelector("button[type=submit]"); button.disabled = true;
      try { await CashyAPI.account.remove(form.elements.password.value); await CashyAPI.auth.logout().catch(() => {}); location.replace("index.html?conta=excluida"); }
      catch (error) { document.getElementById("deleteAccountStatus").textContent = error.message; button.disabled = false; }
    });

    const themeControl = document.getElementById("themeControl");
    const observer = new MutationObserver(moveThemeToggle);
    function moveThemeToggle() { const toggle = document.getElementById("themeToggle"); if (toggle && themeControl && toggle.parentElement !== themeControl) { themeControl.replaceChildren(toggle); observer.disconnect(); } }
    observer.observe(document.querySelector(".topbar .profile"), { childList: true });
    moveThemeToggle();
  } catch (error) {
    status.textContent = error.message || "Não foi possível carregar suas configurações.";
  }
})();
