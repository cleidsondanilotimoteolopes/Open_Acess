document.addEventListener('DOMContentLoaded', () => {
    
    // Certifique-se de que o ID 'contatoForm' está no seu HTML: <form id="contatoForm">
    const form = document.getElementById('contatoForm'); 
    
    // Certifique-se de que o ID 'form-msg' está no seu HTML: <p id="form-msg"></p>
    const msg = document.getElementById('form-msg'); 
    
    // Garante que a mensagem de feedback não apareça inicialmente
    if (msg) {
        msg.textContent = ''; 
    }

    if (form) {
        form.addEventListener('submit', async (event) => {
            // Impede o envio padrão do formulário
            event.preventDefault(); 
            
            // 1. Exibir mensagem de carregamento
            msg.textContent = 'Enviando mensagem... Por favor, aguarde.';
            msg.className = 'form-feedback loading';
            
            const data = new FormData(event.target);
            
            try {
                // 2. Enviar a requisição assíncrona (FETCH) para o Formspree
                const response = await fetch(event.target.action, {
                    method: form.method,
                    body: data,
                    headers: {
                        // O 'Accept: application/json' é crucial para evitar o redirecionamento
                        'Accept': 'application/json' 
                    }
                });

                if (response.ok) {
                    // 3. Resposta de Sucesso
                    msg.textContent = 'Mensagem enviada com sucesso! Em breve retornaremos.';
                    msg.className = 'form-feedback success';
                    form.reset(); // Limpa todos os campos do formulário
                } else {
                    // 4. Resposta de Erro (o Formspree enviou um erro)
                    // Pega o erro detalhado, se houver
                    const errorData = await response.json(); 
                    const errorMessage = errorData.error || 'Ocorreu um erro desconhecido ao enviar.';
                    
                    msg.textContent = `Erro: ${errorMessage}`;
                    msg.className = 'form-feedback error';
                }
            } catch (error) {
                // 5. Erro de Conexão/Rede
                console.error('Erro de envio:', error);
                msg.textContent = 'Erro de conexão. Verifique sua rede e tente novamente.';
                msg.className = 'form-feedback error';
            }
        });
    }
});