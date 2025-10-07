/* ------------------------- 
   MAPA - Funções JavaScript com Filtros e Favoritos
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

    let counts = { yes: 0, limited: 0, no: 0, semnome: 0, total: 0 };
    cluster.getAllChildMarkers().forEach(marker => {
        const tipo = marker.options.icon.options.iconUrl;
        let isSemNome = false;
        if (marker.options && marker.options.title === 'Local sem nome') isSemNome = true;
        if (marker.feature && marker.feature.properties && marker.feature.properties.name === undefined) isSemNome = true;
        if (tipo.includes('blue')) isSemNome = true;
        
        if (isSemNome) counts.semnome++;
        else if (tipo.includes('green')) counts.yes++;
        else if (tipo.includes('gold')) counts.limited++;
        else if (tipo.includes('red')) counts.no++;
        
        counts.total++;
    });

    if (counts.semnome === counts.total && counts.total > 0) return 'cluster-gray';
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
        'default': 'Sem Categoria', 'restaurant': 'Restaurante', 'cafe': 'Café', 'bank': 'Banco', 
        'post_office': 'Correios', 'supermarket': 'Supermercado', 'pharmacy': 'Farmácia', 
        'hotel': 'Hotel', 'park': 'Parque', 'attraction': 'Ponto Turístico', 
        'bus_stop': 'Ponto de Ônibus', 'cinema': 'Cinema', 'fast_food': 'Lanchonete', 
        'university': 'Universidade', 'school': 'Escola', 'shop': 'Loja', 
        'hospital': 'Hospital', 'toilets': 'Banheiro Público', 'library': 'Biblioteca',
        'theatre': 'Teatro', 'museum': 'Museu', 'bar': 'Bar',
    };
    return traducoes[categoria] || categoria;
}

function getCustomIcon(accessibilityType, category) {
    let iconUrl;
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
            icon = getCustomIcon(local.accessibility, local.category);
        }
        const marker = L.marker([local.lat, local.lon], { icon });
        marker.on("click", () => abrirSidebar(local));
        markers.addLayer(marker);
    });
    map.addLayer(markers);
}

function fetchAllDataAndRender() {
    document.getElementById("loading-indicator").style.display = 'block';
    clearMarkers();
    fetchedLocais = [];
    const accessibilityTypes = ['yes', 'limited', 'no'];
    const promises = accessibilityTypes.map(type => fetchAccessibilityData(type));

    Promise.all(promises)
        .then(results => {
            results.forEach(locais => { fetchedLocais.push(...locais); });
            aplicarFiltros(); 
            console.log('Todos os dados do OSM carregados com sucesso!');
        })
        .catch(error => {
            console.error('Houve um problema ao buscar os dados do OSM:', error);
        })
        .finally(() => {
            document.getElementById("loading-indicator").style.display = 'none';
        });
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
                    id: element.type + '_' + element.id, // ID ÚNICO DO OSM
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
    if (filtroAcessibilidade !== 'all') {
        locaisFiltrados = locaisFiltrados.filter(local => local.accessibility === filtroAcessibilidade);
    }
    if (filtroCategoria !== 'all') {
        locaisFiltrados = locaisFiltrados.filter(local => local.category === filtroCategoria);
    }
    renderMarkers(locaisFiltrados);
}

// =========================================================
// FUNÇÕES DE FAVORITOS E TOAST (ALERTA BONITO)
// =========================================================

// Função para gerar um ID do local
function gerarIdLocal(local) {
    // Tenta usar o ID do OSM; se não tiver, usa nome+coords como fallback
    return local.id || `${local.name}_${local.lat.toFixed(5)}_${local.lon.toFixed(5)}`;
}

// Função para mostrar a notificação (Toast)
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-message');
    if (!toast) return;

    // Limpa classes antigas e configura
    toast.classList.remove('show', 'success', 'removed'); 
    toast.textContent = message;
    toast.classList.add(type);
    void toast.offsetWidth; // Reinicia a animação
    
    // Exibe a notificação
    toast.classList.add('show');

    // Remove a notificação após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}


// Verifica se um local está nos favoritos
function isFavorito(local) {
    const idLocal = gerarIdLocal(local);
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    return favoritos.includes(idLocal);
}

// Adiciona ou remove o local dos favoritos
function toggleFavorito(local) {
    const idLocal = gerarIdLocal(local);
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    if (favoritos.includes(idLocal)) {
        // Remover
        favoritos = favoritos.filter(id => id !== idLocal);
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        localStorage.removeItem(`local_${idLocal}`); // Limpa o objeto completo
        showToast('Local removido dos favoritos.', 'removed'); 
        return false; 
    } else {
        // Adicionar
        favoritos.push(idLocal);
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        localStorage.setItem(`local_${idLocal}`, JSON.stringify(local));
        showToast('Local salvo com sucesso!', 'success'); 
        return true;
    }
}

// Atualiza o visual do botão (coração cheio ou vazio)
// ⚠️ CORRIGIDO: Mantém o estilo de contorno para que o botão 'Salvo' não quebre o layout
function atualizarBotaoFavorito(local, btn) {
    if (!local || !btn) return;
    
    const isFav = isFavorito(local);
    btn.dataset.localId = gerarIdLocal(local);
    
    // Usa Font Awesome (fas para salvo/cheio, far para favoritar/vazio)
    btn.innerHTML = isFav 
        ? '<i class="fas fa-heart"></i> Salvo'
        : '<i class="far fa-heart"></i> Favoritar';
    
    // ⚠️ CORREÇÃO VISUAL: Remove o preenchimento sólido (btn-danger)
    // Garante que o botão use sempre a classe de contorno (btn-outline-danger)
    btn.classList.remove('btn-danger', 'btn-outline-primary', 'btn-outline-secondary'); 
    btn.classList.add('btn-outline-danger'); 
}


// =========================================================
// FUNÇÕES DE UI (SIDEBAR E BUSCA)
// =========================================================

// Abre sidebar com detalhes
function abrirSidebar(local) {
    const sidebar = document.getElementById("sidebar");
    const sidebarActions = document.getElementById("sidebar-actions"); 

    // Preenche os dados existentes
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
    
    // ⚠️ CORREÇÃO: Link de rota corrigido para o formato Google Maps
    const rotaLink = `https://www.google.com/maps/dir/?api=1&destination=${local.lat},${local.lon}&travelmode=driving`; 

    const btnFavoritarHtml = `
        <button id="btn-favoritar" class="btn btn-outline-danger btn-sm w-100" data-local-id="">
            <i class="far fa-heart"></i> Favoritar
        </button>
    `;
    const btnRotaHtml = `
        <a href="${rotaLink}" target="_blank" class="btn btn-primary btn-sm w-100">
            <i class="bi bi-geo-alt-fill"></i> Traçar Rota
        </a>
    `;
    
    // O seu HTML (index.html) já usa d-flex flex-column gap-2 para centralizar
    sidebarActions.innerHTML = btnFavoritarHtml + btnRotaHtml;

    const btnFavoritar = document.getElementById('btn-favoritar');
    
    // Aplica o estilo inicial (Salvo ou Favoritar)
    atualizarBotaoFavorito(local, btnFavoritar);

    btnFavoritar.onclick = function() {
        toggleFavorito(local); 
        atualizarBotaoFavorito(local, btnFavoritar);
    };
    
    sidebar.style.display = "block";
    map.setView([local.lat, local.lon], 17);
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
        traduzirCategoria(local.category).toLowerCase().includes(termo)
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

// Local: FUNÇÕES DE UI (SIDEBAR E BUSCA) -> Busca por voz

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
        let texto = event.results[0][0].transcript;
        
        // ⚠️ CORREÇÃO: Remove qualquer pontuação do final do texto
        texto = texto.trim().replace(/[.,?!]+$/, ''); // Remove pontos, vírgulas, etc., do final
        
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

// Correção Mobile
const sidebarMenu = document.getElementById('sidebarMenu');
const searchBar = document.querySelector('.search-bar'); 

sidebarMenu.addEventListener('show.bs.collapse', () => {
    if (window.innerWidth < 768) {
        if (searchBar) searchBar.style.display = 'none';
    }
});

sidebarMenu.addEventListener('hide.bs.collapse', () => {
    if (window.innerWidth < 768) { 
        setTimeout(() => {
            if (searchBar) searchBar.style.display = 'block';
        }, 150);
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) { 
        if (searchBar) searchBar.style.display = 'block';
    }
});

// Lógica para abrir local específico vindo de favoritos.html
function abrirLocalPorUrl() {
    const params = new URLSearchParams(window.location.search);
    const localIdParaAbrir = params.get('local_id');

    if (localIdParaAbrir) {
        const localEncontrado = fetchedLocais.find(local => gerarIdLocal(local) === localIdParaAbrir);
        
        if (localEncontrado) {
            abrirSidebar(localEncontrado);
        } else {
             const localSalvo = JSON.parse(localStorage.getItem(`local_${localIdParaAbrir}`));
             if (localSalvo) {
                 abrirSidebar(localSalvo);
             } else {
                 console.warn(`Local ID ${localIdParaAbrir} não encontrado.`);
             }
        }
    }
}

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    // Ouvintes de filtros
    document.querySelectorAll('.acessibility-buttons .category-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            filtroAcessibilidade = btn.dataset.filterValue;
            document.querySelectorAll('.acessibility-buttons .category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            aplicarFiltros();
        });
    });

    document.querySelectorAll('.category-buttons .category-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            filtroCategoria = btn.dataset.filterValue;
            document.querySelectorAll('.category-buttons .category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            aplicarFiltros();
        });
    });

    // Chamada inicial para carregar os dados
    fetchAllDataAndRender();
    
    // Verifica se deve abrir um local específico (vindo de favoritos)
    abrirLocalPorUrl();
});