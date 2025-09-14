// Inicializa mapa e markers
const map = L.map('map').setView([-8.05, -34.9], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);
const markers = L.markerClusterGroup();

// Dados dos locais
const locais = [
  {
    name: "Uninassau Recife",
    category: "Universidade",
    lat: -8.052, lon: -34.885,
    accessibility: "yes",
    description: "Entrada com rampa, salas acessíveis, banheiros adaptados."
  },
  {
    name: "Shopping Boa Vista",
    category: "Shopping",
    lat: -8.063, lon: -34.896,
    accessibility: "limited",
    description: "Algumas áreas acessíveis, mas entrada principal tem degraus."
  },
  {
    name: "Padaria Central",
    category: "Padaria",
    lat: -8.048, lon: -34.905,
    accessibility: "no",
    description: "Nenhuma estrutura de acessibilidade disponível."
  }
];

// Abre sidebar com detalhes
function abrirSidebar(local) {
  document.getElementById("sidebar").style.display = "block";
  document.getElementById("local-nome").innerText = local.name;
  document.getElementById("local-categoria").innerText = local.category;

  let status = "vermelho", descricao = "Sem acessibilidade";
  if (local.accessibility === "yes") {
    status = "verde"; descricao = "Totalmente acessível";
  } else if (local.accessibility === "limited") {
    status = "amarelo"; descricao = "Parcialmente acessível";
  }

  document.getElementById("local-status").innerHTML =
    `<span class="status ${status}">${descricao}</span>`;
  document.getElementById("local-descricao").innerText = local.description;
}

// Fecha sidebar
document.querySelector(".close-btn")
  .addEventListener("click", () => {
    document.getElementById("sidebar").style.display = "none";
  });

// Adiciona marcadores ao mapa
locais.forEach(local => {
  const marker = L.marker([local.lat, local.lon]);
  marker.on("click", () => abrirSidebar(local));
  markers.addLayer(marker);
});
map.addLayer(markers);

// Configura busca e sugestões
const campoBusca       = document.getElementById('campoBusca');
const sugestoes        = document.getElementById('sugestoes');
let indiceSelecionado  = -1;

campoBusca.addEventListener('input', () => {
  const termo = campoBusca.value.toLowerCase().trim();
  sugestoes.innerHTML = '';
  indiceSelecionado = -1;
  if (!termo) return;

  const resultados = locais.filter(local =>
    local.name.toLowerCase().includes(termo) ||
    local.category.toLowerCase().includes(termo)
  );

  resultados.forEach((local, idx) => {
    const item = document.createElement('button');
    item.className = 'list-group-item list-group-item-action';

    // Ícone de acessibilidade
    let icone = '❌';
    if (local.accessibility === 'yes')    icone = '✅';
    if (local.accessibility === 'limited') icone = '⚠️';

    item.innerHTML = `
      ${icone}
      <strong>${local.name}</strong>
      <small class="text-muted">(${local.category})</small>
    `;

    // Clique ou toque
    item.addEventListener('click', () => {
      abrirSidebar(local);
      sugestoes.innerHTML = '';
      campoBusca.value = local.name;
    });
    item.addEventListener('touchstart', () => {
      abrirSidebar(local);
      sugestoes.innerHTML = '';
      campoBusca.value = local.name;
    });

    // Hover com mouse
    item.addEventListener('mouseover', () => {
      indiceSelecionado = idx;
      atualizarSelecao(sugestoes.querySelectorAll('.list-group-item'));
    });

    sugestoes.appendChild(item);
  });
});

// Navegação por teclado
campoBusca.addEventListener('keydown', e => {
  const itens = sugestoes.querySelectorAll('.list-group-item');
  if (!itens.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    indiceSelecionado = (indiceSelecionado + 1) % itens.length;
    atualizarSelecao(itens);
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    indiceSelecionado = (indiceSelecionado - 1 + itens.length) % itens.length;
    atualizarSelecao(itens);
  }
  if (e.key === 'Enter' && indiceSelecionado >= 0) {
    e.preventDefault();
    itens[indiceSelecionado].click();
  }
  if (e.key === 'Escape') {
    sugestoes.innerHTML = '';
    indiceSelecionado = -1;
  }
});

function atualizarSelecao(itens) {
  itens.forEach((item, i) =>
    item.classList.toggle('active', i === indiceSelecionado)
  );
}

// Busca por voz com som e animação
const btnVoz        = document.getElementById('btnVoz');
const animacaoVoz   = document.getElementById('animacaoVoz');
const somConfirmacao= document.getElementById('somConfirmacao');

btnVoz.addEventListener('click', () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Busca por voz não é suportada neste navegador.");
    return;
  }

  animacaoVoz.style.display = 'inline-block';
  somConfirmacao.play();

  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.start();

  recognition.onresult = event => {
    const texto = event.results[0][0].transcript;
    campoBusca.value = texto;
    campoBusca.dispatchEvent(new Event('input'));
  };

  recognition.onerror = recognition.onend = () => {
    animacaoVoz.style.display = 'none';
  };
});