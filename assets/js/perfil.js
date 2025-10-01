
        // Script para alternar entre abas
        const tabs = document.querySelectorAll('.nav-tab');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
            });
        });

        document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega os dados do usuário do localStorage
    const usuarioString = localStorage.getItem('usuarioLogado');
    const usuario = usuarioString ? JSON.parse(usuarioString) : null;

    // Se não houver usuário logado, redireciona para o login
    if (!usuario) {
        // console.error('Nenhum usuário logado encontrado. Redirecionando...');
        // window.location.href = './login.html'; 
        
        // Para fins de demonstração, cria um usuário padrão
        const defaultUser = {
            nome: "Usuário Padrão",
            username: "usuario",
            membroDesde: "Janeiro/2024",
            locaisMapeados: 0,
            locaisFavoritos: 0,
            email: "usuario@openaccess.com"
        };
        renderizarPerfil(defaultUser);
    } else {
        renderizarPerfil(usuario);
    }
    
    // 2. Função para injetar os dados no HTML
    function renderizarPerfil(user) {
        // Injeta o nome no título principal
        document.querySelector('.user-info h1').textContent = `Olá, ${user.nome}!`;
        
        // Injeta a data de membro
        document.querySelector('.member-since').textContent = `Membro desde ${user.membroDesde}`;
        
        // Injeta as estatísticas
        document.querySelector('.profile-stats .stat-card:nth-child(1) span').textContent = user.locaisMapeados;
        document.querySelector('.profile-stats .stat-card:nth-child(2) span').textContent = user.locaisFavoritos;

        // Injeta os dados da conta
        document.querySelector('.data-form input[type="email"]').value = user.email;
        document.querySelector('.data-form input[type="text"]').value = user.username;
    }
    
    // 3. Configura a funcionalidade do botão Sair (Logout)
    const logoutButton = document.querySelector('.btn-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Remove os dados do usuário do localStorage
            localStorage.removeItem('usuarioLogado');
            // Redireciona para a home ou login
            window.location.href = '../index.html'; 
        });
    }

    // 4. Lógica de troca de abas (do HTML anterior)
    document.querySelectorAll('.perfil-nav .nav-tab').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
});
