function layout(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link rel="stylesheet" href="/vendor/pico.min.css">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header class="container">
    <nav>
      <ul><li><a href="/"><strong>Network Protocol Explorer</strong></a></li></ul>
    </nav>
  </header>
  <main class="container">
    ${body}
  </main>
</body>
</html>`;
}

function card(protocol) {
  return `<a class="protocol-card" href="/protocols/${protocol.slug}">
    <article>
      <img src="${protocol.image}" alt="Illustration of ${protocol.name}" width="120" height="90">
      <h3>${protocol.name}</h3>
      <p class="chips">
        <span class="chip">${protocol.layer}</span>
        <span class="chip">${protocol.ports}</span>
      </p>
      <p>${protocol.purpose}</p>
    </article>
  </a>`;
}

function homepage(protocols) {
  const cards = protocols.map(card).join("\n");
  const body = `
    <hgroup>
      <h1>Network Protocol Explorer</h1>
      <p>Explore the protocols that make communication across the Internet possible.</p>
    </hgroup>
    <div class="protocol-grid">
      ${cards}
    </div>
  `;
  return layout("Network Protocol Explorer", body);
}

function detailPage(protocol) {
  const useCases = protocol.useCases.map((u) => `<li>${u}</li>`).join("\n");
  const body = `
    <a href="/">&larr; Back to all protocols</a>
    <article>
      <img src="${protocol.image}" alt="Illustration of ${protocol.name}" width="200" height="150">
      <h1>${protocol.name}</h1>
      <p><em>${protocol.fullName}</em></p>
      <p class="chips">
        <span class="chip">Layer: ${protocol.layer}</span>
        <span class="chip">Transport: ${protocol.transport}</span>
        <span class="chip">Ports: ${protocol.ports}</span>
      </p>
      <p><strong>Purpose:</strong> ${protocol.purpose}</p>
      <p>${protocol.description}</p>
      <h3>Use cases</h3>
      <ul>${useCases}</ul>
      <h3>Example</h3>
      <p>${protocol.example}</p>
    </article>
  `;
  return layout(`${protocol.name} - Network Protocol Explorer`, body);
}

function notFoundPage() {
  const body = `
    <article style="text-align:center">
      <h1>404</h1>
      <p>That protocol (or page) doesn't exist.</p>
      <a href="/">&larr; Back to all protocols</a>
    </article>
  `;
  return layout("404 - Not Found", body);
}

module.exports = { homepage, detailPage, notFoundPage };
