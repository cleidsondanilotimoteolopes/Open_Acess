// Exemplo de como os dados seriam salvos no login
const usuarioLogado = {
    nome: "Enzo Griper",
    username: "enzogriper",
    membroDesde: "Dezembro/2024",
    locaisMapeados: 12,
    locaisFavoritos: 2,
    email: "enzo.griper@openaccess.com"
};


// Armazenando no armazenamento local do navegador
localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));