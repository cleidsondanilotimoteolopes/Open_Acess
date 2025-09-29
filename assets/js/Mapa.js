/* ------------------------- 
  MAPA - Funções JavaScript com Filtros 
------------------------- */

// Inicializa mapa e markers com mais zoom em PE (Recife)
const map = L.map('map').setView([-8.05, -34.9], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);
function getClusterClass(cluster) {
  if (filtroAcessibilidade === 'limited') return 'cluster-limited';
  if (filtroAcessibilidade === 'no') return 'cluster-no';
  if (filtroAcessibilidade === 'yes') return 'cluster-yes';
  // Para 'todos', cor predominante dos marcadores
  // Se todos os marcadores do cluster são "sem nome" e "sem categoria", retorna cinza
  let counts = { yes: 0, limited: 0, no: 0, semnome: 0, total: 0 };
  cluster.getAllChildMarkers().forEach(marker => {
    const tipo = marker.options.icon.options.iconUrl;
    const popup = marker.getPopup && marker.getPopup();
    // Detecta se é sem nome e sem categoria
    let isSemNome = false;
    if (marker.options && marker.options.title === 'Local sem nome') isSemNome = true;
    // Alternativa: checa se o nome está no objeto
    if (marker.feature && marker.feature.properties && marker.feature.properties.name === undefined) isSemNome = true;
    // Como fallback, se o ícone for azul (default)
    if (tipo.includes('blue')) isSemNome = true;
    if (isSemNome) counts.semnome++;
    if (tipo.includes('green')) counts.yes++;
    else if (tipo.includes('gold')) counts.limited++;
    else if (tipo.includes('red')) counts.no++;
    counts.total++;
  });
  if (counts.semnome === counts.total && counts.total > 0) return 'cluster-gray';
  // Decide a cor predominante
  if (counts.no >= counts.limited && counts.no >= counts.yes && counts.no > 0) return 'cluster-no';
  if (counts.limited >= counts.no && counts.limited >= counts.yes && counts.limited > 0) return 'cluster-limited';
  if (counts.yes > 0) return 'cluster-yes';
  return 'cluster-default';
}

let markers = L.markerClusterGroup({
  iconCreateFunction: function(cluster) {
    const count = cluster.getChildCount();
    let c = getClusterClass(cluster);
    return L.divIcon({
      html: `<div><span>${count}</span></div>`,
      className: 'marker-cluster ' + c,
      iconSize: L.point(40, 40)
    });
  }
});
let fetchedLocais = [];

// Estado dos filtros
let filtroAcessibilidade = 'all'; 
let filtroCategoria = 'all';      

// =========================================================
// FUNÇÕES DE UTILIDADE E TRADUÇÃO
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
    'fast_food': 'Lanchonete',
    'university': 'Universidade',
    'school': 'Escola',
    // Adicione todas as categorias aqui para o filtro
    'shop': 'Loja', 
    'hospital': 'Hospital', 
    'toilets': 'Banheiro Público', 
    'library': 'Biblioteca',
    'theatre': 'Teatro',
    'museum': 'Museu',
    'bar': 'Bar',
  };
  return traducoes[categoria] || categoria;
}

function getCustomIcon(accessibilityType, category) {
  let iconUrl;
  // Se não tem categoria (default), usa cinza
  if (category === 'default') {
    iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png';
  } else {
    switch (accessibilityType) {
      case 'yes': iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'; break;
      case 'limited': iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png'; break;
      case 'no': iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'; break;
      default: iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
    }
  }
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]
  });
}

function clearMarkers() {
  markers.clearLayers();
}

function renderMarkers(locais) {
  clearMarkers();
  map.removeLayer(markers);
  // Recria o cluster para atualizar a cor
  markers = L.markerClusterGroup({
    iconCreateFunction: function(cluster) {
      const count = cluster.getChildCount();
      let c = getClusterClass(cluster);
      return L.divIcon({
        html: `<div><span>${count}</span></div>`,
        className: 'marker-cluster ' + c,
        iconSize: L.point(40, 40)
      });
    }
  });
  locais.forEach(local => {
    let icon;
    if (filtroAcessibilidade === 'limited') {
      icon = getCustomIcon('limited', local.category);
    } else if (filtroAcessibilidade === 'no') {
      icon = getCustomIcon('no', local.category);
    } else if (filtroAcessibilidade === 'yes') {
      icon = getCustomIcon('yes', local.category);
    } else {
      // No filtro 'todos', cada marcador mantém sua cor original
      icon = getCustomIcon(local.accessibility, local.category);
    }
    const marker = L.marker([local.lat, local.lon], { icon });
    marker.on("click", () => abrirSidebar(local));
    markers.addLayer(marker);
  });
  map.addLayer(markers);
}

// =========================================================
// FUNÇÃO PRINCIPAL: BUSCA E FILTRAGEM (UNIFICADA)
// =========================================================

function fetchAllDataAndRender() {
    // 1. Mostrar o indicador de carregamento
    document.getElementById("loading-indicator").style.display = 'block';

    clearMarkers();
    fetchedLocais = [];

    const accessibilityTypes = ['yes', 'limited', 'no'];
    const promises = accessibilityTypes.map(type => fetchAccessibilityData(type));

    Promise.all(promises)
        .then(results => {
            // Concatena todos os resultados
            results.forEach(locais => { fetchedLocais.push(...locais); });

            // Aplica os filtros atuais e renderiza
            aplicarFiltros(); 
            console.log('Todos os dados do OSM carregados com sucesso!');
        })
        .catch(error => {
            console.error('Houve um problema ao buscar os dados do OSM:', error);
        })
        .finally(() => {
            // 2. Esconder o indicador de carregamento
            document.getElementById("loading-indicator").style.display = 'none';
        });
}

function fetchAccessibilityData(accessibilityType) {
    // Usaremos a área de Pernambuco (BR-PE) como antes
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
        .then(response => response.json())
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

function aplicarFiltros() {
    let locaisFiltrados = fetchedLocais;

    // 1. Aplica o filtro de acessibilidade
    if (filtroAcessibilidade !== 'all') {
        locaisFiltrados = locaisFiltrados.filter(local =>
            local.accessibility === filtroAcessibilidade
        );
    }

  // 2. Aplica o filtro de categoria
  if (filtroCategoria !== 'all') {
    locaisFiltrados = locaisFiltrados.filter(local =>
      local.category === filtroCategoria
    );
  }

    renderMarkers(locaisFiltrados);
}

// =========================================================
// EVENTOS DE FILTRO
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  // 0. Corrige o menu hamburguer mobile
  const btnMenuMobile = document.getElementById('btnMenuMobile');
  const sidebarMenu = document.getElementById('sidebarMenu');
  if (btnMenuMobile && sidebarMenu) {
    btnMenuMobile.addEventListener('click', () => {
      sidebarMenu.classList.toggle('show');
    });
    // Fecha o menu ao clicar fora dele no mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth < 768 && sidebarMenu.classList.contains('show')) {
        if (!sidebarMenu.contains(e.target) && e.target !== btnMenuMobile && !btnMenuMobile.contains(e.target)) {
          sidebarMenu.classList.remove('show');
        }
      }
    });
  }

  // 1. Ouvinte para o grupo de Acessibilidade
  document.querySelectorAll('.acessibility-buttons .category-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      filtroAcessibilidade = btn.dataset.filterValue;
      // Ativa o botão clicado
      document.querySelectorAll('.acessibility-buttons .category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      aplicarFiltros();
    });
  });

  // 2. Ouvinte para o grupo de Categoria
  document.querySelectorAll('.category-buttons .category-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      filtroCategoria = btn.dataset.filterValue;
      // Ativa o botão clicado
      document.querySelectorAll('.category-buttons .category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      aplicarFiltros();
    });
  });

  // 3. Chamada inicial para carregar os dados
  fetchAllDataAndRender();
});


// =========================================================
// FUNÇÕES DE UI (SIDEBAR E BUSCA)
// =========================================================

// Abre sidebar com detalhes
function abrirSidebar(local) {
  document.getElementById("sidebar").style.display = "block";
  document.getElementById("local-nome").innerText = local.name;
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

// Configura busca e sugestões
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
    traduzirCategoria(local.category).toLowerCase().includes(termo) // CORRIGIDO: usa traduzirCategoria
  );

  resultados.forEach((local, idx) => {
    const item = document.createElement('button');
    item.className = 'list-group-item list-group-item-action';

    let icone = '❌';
    if (local.accessibility === 'yes') icone = '✅';
    if (local.accessibility === 'limited') icone = '⚠️';

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

// ==========================================================
// CORREÇÃO MOBILE: ESCONDER BARRA DE BUSCA AO ABRIR MENU
// ==========================================================
const sidebarMenu = document.getElementById('sidebarMenu');
const searchBar = document.querySelector('.search-bar'); // Seleciona pela classe

sidebarMenu.addEventListener('show.bs.collapse', () => {
    if (window.innerWidth < 768) {
        if (searchBar) searchBar.style.display = 'none';
    }
});

sidebarMenu.addEventListener('hide.bs.collapse', () => {
    if (window.innerWidth < 768) {
        // Um pequeno delay para evitar conflitos visuais
        setTimeout(() => {
            if (searchBar) searchBar.style.display = 'block';
        }, 150);
    }
});

// Garante que a barra de busca apareça no desktop, mesmo que tenha sido escondida
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) { // Mudei para 768px que é o breakpoint de mobile
        if (searchBar) searchBar.style.display = 'block';
    }
});