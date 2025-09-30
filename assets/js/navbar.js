// assets/js/navbar.js
// Script para funcionalidade do menu hamburger em telas pequenas
    document.addEventListener('DOMContentLoaded', () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            // Opcional: Animar o botão hamburger em um 'X'
            menuToggle.classList.toggle('is-active'); 
        });

        // Fechar o menu ao clicar em um link (para uma melhor UX mobile)
        document.querySelectorAll('.nav-link-rekord').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('open')) {
                    navMenu.classList.remove('open');
                    menuToggle.classList.remove('is-active');
                }
            });
        });
    });
