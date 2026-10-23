(function () {
  "use strict";

  if (!window.CashyAPI || document.getElementById("cashyChatWidget")) return;

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const widget = make("div", "cashy-chat-widget");
  widget.id = "cashyChatWidget";
  const launcher = make("button", "cashy-chat-launcher");
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Abrir assistente Cashy");
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "cashyChatPanel");
  launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 18.5 3.8 21l3.9-1.2c1.3.7 2.8 1.2 4.3 1.2 5 0 9-3.8 9-8.5S17 4 12 4 3 7.8 3 12.5c0 2.3.8 4.4 2 6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 12h.01M12 12h.01M16 12h.01" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/></svg>';

  const panel = make("section", "cashy-chat-panel");
  panel.id = "cashyChatPanel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Assistente educativo Cashy");

  const header = make("header", "cashy-chat-header");
  const brand = make("div", "cashy-chat-brand");
  brand.append(make("span", "cashy-chat-avatar", "✦"));
  const heading = make("div", "cashy-chat-heading");
  heading.append(make("strong", "", "Assistente Cashy"), make("small", "", "Aprenda sobre dinheiro e investimentos"));
  brand.append(heading);
  const close = make("button", "cashy-chat-close", "×");
  close.type = "button";
  close.setAttribute("aria-label", "Fechar assistente");
  header.append(brand, close);

  const transcript = make("div", "cashy-chat-messages");
  transcript.setAttribute("role", "log");
  transcript.setAttribute("aria-live", "polite");
  transcript.setAttribute("aria-relevant", "additions");
  transcript.setAttribute("aria-label", "Conversa com o assistente");

  const suggestions = make("div", "cashy-chat-suggestions");
  ["O que é renda fixa?", "O que significa liquidez?", "Como funciona a diversificação?"].forEach((prompt) => {
    const button = make("button", "cashy-chat-suggestion", prompt);
    button.type = "button";
    button.addEventListener("click", () => send(prompt));
    suggestions.append(button);
  });

  const form = make("form", "cashy-chat-form");
  const input = make("textarea", "cashy-chat-input");
  input.rows = 2;
  input.maxLength = 1200;
  input.placeholder = "Escreva sua pergunta…";
  input.setAttribute("aria-label", "Sua pergunta para o assistente");
  const sendButton = make("button", "cashy-chat-send");
  sendButton.type = "submit";
  sendButton.setAttribute("aria-label", "Enviar pergunta");
  sendButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 5 16 7-16 7 2.2-7L4 5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M6.2 12H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  form.append(input, sendButton);
  const note = make("p", "cashy-chat-note", "Respostas educativas, não são recomendações. No Gemini gratuito, conversas podem ser usadas pelo Google para melhoria do serviço. Não envie dados pessoais ou financeiros.");
  panel.append(header, transcript, suggestions, form, note);
  widget.append(panel, launcher);
  document.body.append(widget);

  const messages = [];
  let busy = false;
  let previousFocus = null;

  function addMessage(role, content, isError) {
    const bubble = make("div", "cashy-chat-message", content);
    bubble.dataset.role = role;
    if (isError) bubble.dataset.error = "true";
    transcript.append(bubble);
    transcript.scrollTop = transcript.scrollHeight;
    return bubble;
  }

  addMessage("assistant", "Oi! Posso explicar conceitos de finanças e investimentos em linguagem simples. O que você gostaria de entender?");

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    launcher.setAttribute("aria-label", open ? "Fechar assistente Cashy" : "Abrir assistente Cashy");
    if (open) {
      previousFocus = document.activeElement;
      input.focus();
    } else {
      launcher.focus();
    }
  }

  async function send(value) {
    const content = String(value || "").trim();
    if (!content || busy) return;
    setOpen(true);
    suggestions.hidden = true;
    addMessage("user", content);
    messages.push({ role: "user", content });
    input.value = "";
    busy = true;
    sendButton.disabled = true;
    input.disabled = true;
    const loading = addMessage("assistant", "Pensando…");
    try {
      const result = await CashyAPI.chat.send(messages.slice(-8));
      loading.textContent = result.answer;
      messages.push({ role: "assistant", content: result.answer });
      while (messages.length > 8) messages.shift();
    } catch (error) {
      loading.dataset.error = "true";
      loading.textContent = error.message || "Não consegui responder agora. Tente novamente.";
      messages.pop();
    } finally {
      busy = false;
      sendButton.disabled = false;
      input.disabled = false;
      input.focus();
      transcript.scrollTop = transcript.scrollHeight;
    }
  }

  launcher.addEventListener("click", () => setOpen(panel.hidden));
  close.addEventListener("click", () => setOpen(false));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    send(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      const focusWasInside = panel.contains(document.activeElement);
      setOpen(false);
      if (focusWasInside && previousFocus instanceof HTMLElement && previousFocus !== document.body) previousFocus.focus();
    }
  });
})();
