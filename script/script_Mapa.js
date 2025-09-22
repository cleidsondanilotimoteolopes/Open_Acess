// ==========================================================
// ATUALIZADO: Agora com tradução de categorias
// ==========================================================

// Inicializa mapa e markers
const map = L.map('map').setView([-8.05, -34.9], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);
const markers = L.markerClusterGroup();

let fetchedLocais = [];

// Funções para carregar e limpar os marcadores
function clearMarkers() {
  markers.clearLayers();
  fetchedLocais = [];
}

function fetchAccessibilityData(accessibilityType) {
  const overpassQuery = encodeURIComponent(`
    [out:json];
    area["ISO3166-2"="BR-PE"]->.a;
    (
      node["wheelchair"="${accessibilityType}"](area.a);
      way["wheelchair"="${accessibilityType}"](area.a);
      relation["wheelchair"="${accessibilityType}"](area.a);
    );
    out center;
  `);

  const overpassURL = `https://overpass-api.de/api/interpreter?data=${overpassQuery}`;

  return fetch(overpassURL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar dados do OSM: ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      return data.elements.map(element => {
        let lat, lon;
        if (element.type === 'node') {
          lat = element.lat;
          lon = element.lon;
        } else {
          lat = element.center.lat;
          lon = element.center.lon;
        }

        return {
          name: element.tags.name || 'Local sem nome',
          category: element.tags.amenity || element.tags.shop || 'default',
          lat: lat,
          lon: lon,
          accessibility: accessibilityType,
          description: element.tags.description || 'Nenhuma descrição disponível.'
        };
      });
    });
}

function getCustomIcon(accessibilityType) {
  let iconUrl;
  let iconColor;

  switch (accessibilityType) {
    case 'yes':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
      iconColor = 'green';
      break;
    case 'limited':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png';
      iconColor = 'gold';
      break;
    case 'no':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
      iconColor = 'red';
      break;
    default:
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
      iconColor = 'blue';
  }

  return L.icon({
    iconUrl: iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]
  });
}

function fetchAllData() {
  clearMarkers();

  const promiseYes = fetchAccessibilityData('yes');
  const promiseLimited = fetchAccessibilityData('limited');
  const promiseNo = fetchAccessibilityData('no');

  Promise.all([promiseYes, promiseLimited, promiseNo])
    .then(([locaisYes, locaisLimited, locaisNo]) => {
      fetchedLocais = [...locaisYes, ...locaisLimited, ...locaisNo];

      fetchedLocais.forEach(local => {
        const marker = L.marker([local.lat, local.lon], { icon: getCustomIcon(local.accessibility) });
        marker.on("click", () => abrirSidebar(local));
        markers.addLayer(marker);
      });
      map.addLayer(markers);
      console.log('Todos os dados do OSM carregados com sucesso!');
    })
    .catch(error => {
      console.error('Houve um problema ao buscar os dados do OSM:', error);
    });
}

// =========================================================
// NOVA FUNÇÃO DE TRADUÇÃO
// =========================================================
function traduzirCategoria(categoria) {
  const traducoes = {
    'default': 'Sem Categoria',
    'restaurant': 'Restaurante',
    'cafe': 'Café',
    'bank': 'Banco',
    'post_office': 'Correios',
    'supermarket': 'Supermercado',
    'pharmacy': 'Farmácia',
    'hotel': 'Hotel',
    'park': 'Parque',
    'attraction': 'Ponto Turístico',
    'bus_stop': 'Ponto de Ônibus',
    'cinema': 'Cinema',
    'fast_food': 'Lanchonete'
    // Adicione mais categorias e suas traduções aqui!
  };
  return traducoes[categoria] || categoria;
}

// Abre sidebar com detalhes
function abrirSidebar(local) {
  document.getElementById("sidebar").style.display = "block";
  document.getElementById("local-nome").innerText = local.name;
  // CHAMA A FUNÇÃO DE TRADUÇÃO AQUI
  document.getElementById("local-categoria").innerText = traduzirCategoria(local.category);

  let status = "vermelho", descricao = "Sem acessibilidade";
  if (local.accessibility === "yes") {
    status = "verde";
    descricao = "Totalmente acessível";
  } else if (local.accessibility === "limited") {
    status = "amarelo";
    descricao = "Parcialmente acessível";
  }

  document.getElementById("local-status").innerHTML =
    `<span class="status ${status}">${descricao}</span>`;
  document.getElementById("local-descricao").innerText = local.description;
}

// Fecha sidebar
document.querySelector(".close-btn").addEventListener("click", () => {
  document.getElementById("sidebar").style.display = "none";
});

// Configura busca e sugestões (usa a nova variável `fetchedLocais`)
const campoBusca = document.getElementById('campoBusca');
const sugestoes = document.getElementById('sugestoes');
let indiceSelecionado = -1;

campoBusca.addEventListener('input', () => {
  const termo = campoBusca.value.toLowerCase().trim();
  sugestoes.innerHTML = '';
  indiceSelecionado = -1;
  if (!termo) {
    sugestoes.style.display = 'none';
    return;
  }

  sugestoes.style.display = 'block';

  const resultados = fetchedLocais.filter(local =>
    local.name.toLowerCase().includes(termo) ||
    local.category.toLowerCase().includes(termo)
  );

  resultados.forEach((local, idx) => {
    const item = document.createElement('button');
    item.className = 'list-group-item list-group-item-action';

    let icone = '❌';
    if (local.accessibility === 'yes') icone = '✅';
    if (local.accessibility === 'limited') icone = '⚠️';

    // CHAMA A FUNÇÃO DE TRADUÇÃO AQUI
    item.innerHTML = `
      ${icone}
      <strong>${local.name}</strong>
      <small class="text-muted">(${traduzirCategoria(local.category)})</small>
    `;

    item.addEventListener('click', () => {
      abrirSidebar(local);
      sugestoes.style.display = 'none';
      campoBusca.value = local.name;
    });

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

// Busca por voz
const btnVoz = document.getElementById('btnVoz');
const animacaoVoz = document.getElementById('animacaoVoz');

btnVoz.addEventListener('click', () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Busca por voz não é suportada neste navegador.");
    return;
  }

  animacaoVoz.style.display = 'inline-block';
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

// Fecha a barra de sugestões quando o usuário clica fora
document.addEventListener('click', (event) => {
  if (!campoBusca.contains(event.target) && !sugestoes.contains(event.target)) {
    sugestoes.style.display = 'none';
  }
});

// Chamada inicial para carregar os dados
fetchAllData();