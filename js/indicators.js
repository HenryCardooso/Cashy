(() => {
  "use strict";
  const status = document.getElementById("indicatorStatus");
  const metrics = document.getElementById("indicatorMetrics");
  const seriesSelect = document.getElementById("indicatorSeries");
  const periodButtons = [...document.querySelectorAll("[data-period]")];
  const chart = document.getElementById("indicatorChart");
  const tableBody = document.getElementById("indicatorTableBody");
  if (!status || !metrics || !seriesSelect || !chart || !tableBody) return;

  const names = { selic: "Meta Selic", ipca: "IPCA mensal" };
  const moneyDate = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" });
  const number = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const values = {};
  let period = 12;

  function shortDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return moneyDate.format(new Date(Date.UTC(year, month - 1, day)));
  }

  function makeMetric(key, item) {
    const latest = item.observations[item.observations.length - 1];
    if (!latest) return;
    const card = document.createElement("article");
    card.className = "indicator-metric";
    const title = document.createElement("h3"); title.textContent = item.name;
    const value = document.createElement("strong"); value.className = "indicator-value";
    value.textContent = number.format(latest.value) + " " + item.unit;
    const date = document.createElement("p"); date.textContent = "Referência: " + shortDate(latest.date);
    const series = document.createElement("small"); series.textContent = "Série SGS " + item.code + (key === "ipca" ? " · variação mensal do IPCA (IBGE)" : " · meta anual definida pelo Copom");
    card.append(title, value, date, series);
    return card;
  }

  function renderTable(item) {
    tableBody.replaceChildren();
    [...item.observations].slice(-period).reverse().forEach((observation) => {
      const row = document.createElement("tr");
      const date = document.createElement("th"); date.scope = "row"; date.textContent = shortDate(observation.date);
      const value = document.createElement("td"); value.textContent = number.format(observation.value) + " " + item.unit;
      row.append(date, value); tableBody.append(row);
    });
    document.getElementById("indicatorTableCaption").textContent = "Observações recentes de " + item.name + ".";
  }

  function renderChart(item) {
    const series = item.observations.slice(-period);
    const width = 800, height = 280, left = 62, right = 22, top = 22, bottom = 44;
    const plotWidth = width - left - right, plotHeight = height - top - bottom;
    const numbers = series.map((point) => point.value);
    let min = Math.min(...numbers), max = Math.max(...numbers);
    if (min === max) { min -= 1; max += 1; }
    const pad = (max - min) * 0.12; min -= pad; max += pad;
    const x = (index) => left + (series.length < 2 ? plotWidth / 2 : index * plotWidth / (series.length - 1));
    const y = (value) => top + (max - value) / (max - min) * plotHeight;
    const fragment = document.createDocumentFragment();
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.id = "chartTitle"; title.textContent = "Histórico de " + item.name;
    const desc = document.createElementNS("http://www.w3.org/2000/svg", "desc");
    desc.id = "chartDescription"; desc.textContent = series.length + " observações, de " + shortDate(series[0].date) + " a " + shortDate(series[series.length - 1].date) + ". Unidade: " + item.unit + ".";
    fragment.append(title, desc);
    for (let index = 0; index <= 4; index += 1) {
      const value = max - index * (max - min) / 4;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(left)); line.setAttribute("x2", String(width - right));
      line.setAttribute("y1", String(y(value))); line.setAttribute("y2", String(y(value))); line.setAttribute("class", "indicator-gridline");
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", String(left - 10)); label.setAttribute("y", String(y(value) + 4)); label.setAttribute("text-anchor", "end"); label.setAttribute("class", "indicator-axis-label"); label.textContent = number.format(value);
      fragment.append(line, label);
    }
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "indicator-series-line");
    path.setAttribute("d", series.map((point, index) => (index ? "L" : "M") + x(index) + " " + y(point.value)).join(" "));
    fragment.append(path);
    series.forEach((point, index) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", String(x(index))); circle.setAttribute("cy", String(y(point.value))); circle.setAttribute("r", "4"); circle.setAttribute("class", "indicator-dot");
      const pointTitle = document.createElementNS("http://www.w3.org/2000/svg", "title"); pointTitle.textContent = shortDate(point.date) + ": " + number.format(point.value) + " " + item.unit;
      circle.append(pointTitle); fragment.append(circle);
    });
    [0, series.length - 1].filter((value, index, list) => list.indexOf(value) === index).forEach((index) => {
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", String(x(index))); label.setAttribute("y", String(height - 12)); label.setAttribute("text-anchor", index === 0 ? "start" : "end"); label.setAttribute("class", "indicator-axis-label"); label.textContent = shortDate(series[index].date);
      fragment.append(label);
    });
    chart.replaceChildren(fragment);
    document.getElementById("indicatorChartCaption").textContent = item.name + " · " + item.unit + " · " + series.length + " observações recentes.";
    renderTable(item);
  }

  function update() {
    const key = seriesSelect.value;
    const item = values[key];
    if (!item) return;
    renderChart(item);
    periodButtons.forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.period) === period)));
  }

  seriesSelect.addEventListener("change", update);
  periodButtons.forEach((button) => button.addEventListener("click", () => { period = Number(button.dataset.period); update(); }));

  fetch("api/indicators.php", { headers: { Accept: "application/json" }, credentials: "same-origin" })
    .then(async (response) => {
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.message || "A fonte oficial está temporariamente indisponível.");
      return payload;
    })
    .then((payload) => {
      Object.assign(values, payload.data || {});
      metrics.replaceChildren(...Object.entries(values).map(([key, item]) => makeMetric(key, item)).filter(Boolean));
      if (!values[seriesSelect.value]) seriesSelect.value = Object.keys(values)[0] || "";
      if (!seriesSelect.value) throw new Error("Nenhuma série oficial foi recebida.");
      seriesSelect.disabled = false; periodButtons.forEach((button) => { button.disabled = false; });
      update();
      const partial = Object.keys(payload.errors || {}).length > 0;
      const checkedAt = payload.checked_at ? new Date(payload.checked_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "";
      status.textContent = (partial ? "Dados parciais. " : "Dados oficiais carregados. ") + "Consulta em " + checkedAt + "; a referência de cada observação aparece no cartão.";
      status.dataset.state = partial ? "warning" : "success";
    })
    .catch(() => {
      status.textContent = "Não foi possível carregar os indicadores agora. Acesse os links oficiais para consultar os dados.";
      status.dataset.state = "error";
    });
})();
