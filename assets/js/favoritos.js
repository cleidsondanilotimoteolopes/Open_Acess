document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos do DOM
    const favoritosGrid = document.getElementById('favoritos-lista');
    const favoritosVazio = document.getElementById('favoritos-vazio');
    
    // Mapeamento de Ícones de Categoria
    function getIconeCategoria(categoria) {
        const icones = {
            'restaurant': 'fas fa-utensils',
            'shop': 'fas fa-shopping-bag',
            'school': 'fas fa-graduation-cap',
            'hospital': 'fas fa-hospital',
            'pharmacy': 'fas fa-prescription-bottle-alt',
            'park': 'fas fa-tree',
            'toilets': 'fas fa-restroom',
            'library': 'fas fa-book',
            'cafe': 'fas fa-coffee',
            'default': 'fas fa-map-marker-alt'
        };
        return icones[categoria] || icones['default'];
    }

    // 1. Carrega os dados de favoritos do localStorage
    function carregarFavoritos() {
        const favoritosIds = JSON.parse(localStorage.getItem('favoritos')) || [];
        
        // Mapeia os IDs para objetos completos de local salvos
        const locaisCompletos = favoritosIds
            .map(id => JSON.parse(localStorage.getItem(`local_${id}`)))
            .filter(local => local !== null);

        return locaisCompletos;
    }

    // 2. Função para criar o HTML de um único Card
    function criarCardLocal(local) {
        // Gera as tags de acessibilidade (simplificada)
        let tagsHtml = '';
        if (local.accessibility === 'yes') {
            tagsHtml = '<span class="tag tag-rampa"><i class="fas fa-wheelchair"></i> Acessível</span>';
        } else if (local.accessibility === 'limited') {
            tagsHtml = '<span class="tag tag-elevador"><i class="fas fa-info-circle"></i> Parcial</span>';
        } else {
             tagsHtml = '<span class="tag tag-banheiro"><i class="fas fa-times"></i> Não Acessível</span>';
        }

        // Link para voltar ao mapa e abrir o local
        const localId = local.id || `${local.name}_${local.lat.toFixed(5)}_${local.lon.toFixed(5)}`;
        const mapaLink = `mapa.html?local_id=${encodeURIComponent(localId)}`;
        
        const iconePrincipal = getIconeCategoria(local.category); 

        return `
            <div class="local-card" data-id="${localId}">
                <div class="local-icon-container">
                    <i class="${iconePrincipal}"></i>
                </div>
                
                <div class="card-content">
                    <h3>${local.name}</h3>
                    <p class="local-endereco"><i class="fas fa-map-marker-alt"></i> ${local.category}</p>
                    <div class="acessibilidade-tags">${tagsHtml}</div>
                    <div class="card-actions">
                        <a href="${mapaLink}" class="btn-detalhes">Ver Detalhes no Mapa</a>
                        <button class="btn-remover" data-local-id="${localId}"><i class="fas fa-times"></i> Remover</button>
                    </div>
                </div>
            </div>
        `;
    }

    // 3. Função principal para renderizar a página
    function renderizarFavoritos() {
        const locais = carregarFavoritos();

        if (locais && locais.length > 0) {
            favoritosVazio.style.display = 'none';
            favoritosGrid.style.display = 'grid'; 
            favoritosGrid.innerHTML = locais.map(criarCardLocal).join('');

            adicionarListenersDeRemocao();
        } else {
            favoritosGrid.style.display = 'none';
            favoritosVazio.style.display = 'block';
            favoritosGrid.innerHTML = '';
        }
    }

    // 4. Função para gerenciar a remoção de um item
    function adicionarListenersDeRemocao() {
        document.querySelectorAll('.btn-remover').forEach(button => {
            button.addEventListener('click', (event) => {
                const localId = event.currentTarget.dataset.localId;
                
                // Remove o ID da lista principal de favoritos
                let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
                favoritos = favoritos.filter(id => id !== localId);
                localStorage.setItem('favoritos', JSON.stringify(favoritos));

                // Remove o objeto completo do local (limpeza)
                localStorage.removeItem(`local_${localId}`);
                
                // Re-renderiza a lista 
                renderizarFavoritos();
            });
        });
    }

    // --- INICIALIZAÇÃO ---
    renderizarFavoritos();
});