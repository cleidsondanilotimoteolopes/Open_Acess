document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const senhaInput = document.getElementById('senha');
    const confirmaSenhaInput = document.getElementById('confirmaSenha');
    const msg = document.getElementById('msg');

    // 1. Liga o evento de submissão do formulário
    form.addEventListener('submit', (event) => {
        // Impede o envio padrão do formulário (que redirecionaria)
        event.preventDefault();

        // Limpa mensagens anteriores
        msg.textContent = '';
        msg.className = 'msg';

        // 2. Verifica se as senhas coincidem
        if (senhaInput.value !== confirmaSenhaInput.value) {
            msg.textContent = 'Erro: As senhas não coincidem!';
            msg.classList.add('error');
            // Interrompe a função aqui
            return; 
        }

        // 3. Verifica se a senha tem o mínimo de 8 caracteres (embora já esteja no HTML, é bom reforçar)
        if (senhaInput.value.length < 8) {
            msg.textContent = 'Erro: A senha deve ter no mínimo 8 caracteres.';
            msg.classList.add('error');
            return;
        }

        // 4. Se a validação passou, simula o envio para o servidor
        
        // **ESTE É ONDE VOCÊ FARIA A CHAMADA FETCH REAL PARA O BACK-END**
        // Exemplo: fetch('/api/cadastro', { method: 'POST', body: JSON.stringify(dados) })
        
        // Simulação de Sucesso (Timeout para dar um efeito)
        msg.textContent = 'Cadastrando...';
        msg.classList.add('sucess');

        setTimeout(() => {
            msg.textContent = 'Cadastro realizado com sucesso! Redirecionando...';
            msg.classList.add('sucess');
            
            // Redireciona para a página de sucesso ou login
            window.location.href = './login.html'; // Redireciona para a página de login
        }, 1500); // 1.5 segundos de espera
    });
});