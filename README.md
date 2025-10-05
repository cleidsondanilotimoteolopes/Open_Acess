# OpenAccess 🌍♿

> Projeto Vanessa - Uninassau 2º Período

Uma aplicação web inovadora que mapeia a acessibilidade de espaços urbanos, contribuindo para os Objetivos de Desenvolvimento Sustentável (ODS) da ONU.

![Mapa de Acessibilidade](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Licença](https://img.shields.io/badge/Licença-MIT-blue)
![Tecnologia](https://img.shields.io/badge/Tech-HTML%2BCSS%2BJS-orange)

---

## 📋 Sumário

- [Introdução](#-introdução)
- [Objetivo do Projeto](#-objetivo-do-projeto)
- [Problema a Resolver](#-problema-a-resolver)
- [Como Funciona](#-como-funciona)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Instalação e Uso](#-instalação-e-uso)
- [ODS - Objetivos de Desenvolvimento Sustentável](#-ods---objetivos-de-desenvolvimento-sustentável)

---

## 🚀 Introdução

O **OpenAccess** é uma aplicação web inovadora desenvolvida como projeto acadêmico da Uninassau (2º Período) que utiliza dados do OpenStreetMap (OSM) para criar um mapa interativo de acessibilidade. A aplicação visa democratizar informações sobre a acessibilidade de espaços públicos e privados, contribuindo para a construção de uma sociedade mais inclusiva.

Através de uma interface intuitiva e acessível, o projeto oferece informações essenciais sobre o grau de acessibilidade de estabelecimentos, facilitando o planejamento de rotas e a navegação urbana para pessoas com deficiência ou mobilidade reduzida.

---

## 🎯 Objetivo do Projeto

O projeto tem como objetivos principais:

### 🗺️ **Mapear a Acessibilidade**

Identificar e visualizar o grau de acessibilidade de diferentes estabelecimentos e espaços públicos através de marcadores coloridos e informativos.

### 🤝 **Promover Inclusão Social**

Facilitar a navegação urbana para pessoas com deficiência ou mobilidade reduzida, proporcionando autonomia e confiança na escolha de destinos.

### 🌱 **Contribuir para os ODS**

Alinhar-se aos Objetivos de Desenvolvimento Sustentável da ONU, especificamente:

- **ODS 10** (Redução das Desigualdades)
- **ODS 11** (Cidades e Comunidades Sustentáveis)
- **ODS 3** (Saúde e Bem-estar)

### 📢 **Conscientização**

Aumentar a awareness sobre questões de acessibilidade na sociedade, promovendo reflexão e mudanças positivas.

---

## 🔍 Problema a Resolver

A aplicação busca resolver diversos problemas críticos enfrentados diariamente:

### ❓ **Falta de Informação sobre Acessibilidade**

Muitas pessoas com deficiência enfrentam incertezas ao visitar novos locais, não sabendo se encontrarão barreiras arquitetônicas que impeçam ou dificultem o acesso.

### 🗺️ **Planejamento de Rotas Inacessível**

Dificuldade em planejar trajetos considerando limitações de mobilidade, resultando em frustrações e exclusão de atividades sociais e econômicas.

### 👁️ **Invisibilidade das Barreiras**

Falta de visibilidade sobre quais estabelecimentos são realmente acessíveis, criando um cenário de tentativa e erro que pode ser desencorajante.

### 🏢 **Desconhecimento Empresarial**

Proprietários de estabelecimentos podem não ter clareza sobre o nível de acessibilidade de seus espaços, perdendo oportunidades de melhorias e clientes.

### 🚫 **Exclusão Social**

Barreiras arquitetônicas que limitam a participação plena de pessoas com deficiência na sociedade, violando princípios básicos de igualdade e direitos humanos.

---

## ⚙️ Como Funciona

A aplicação funciona através de uma arquitetura web simples e eficaz:

### 🔧 **Estrutura Técnica**

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Mapa Interativo**: Biblioteca Leaflet.js com suporte a clusters
- **Fonte de Dados**: API Overpass do OpenStreetMap
- **Interface**: Bootstrap para responsividade
- **Geolocalização**: Focado na região de Pernambuco (Recife)

### 🔄 **Fluxo de Funcionamento**

#### 1. **🔐 Autenticação**

O usuário acessa via tela de login (`index.html`) com campos para usuário/email e senha.

#### 2. **🗺️ Carregamento do Mapa**

- Inicialização centrada em Pernambuco (Recife)
- Consulta automática à API Overpass para buscar dados de acessibilidade
- Três níveis de acessibilidade são consultados: `"yes"`, `"limited"`, `"no"`

#### 3. **👁️ Visualização dos Dados**

**Marcadores Coloridos**:

- 🟢 **Verde**: Totalmente acessível (`wheelchair=yes`)
- 🟡 **Amarelo**: Parcialmente acessível (`wheelchair=limited`)
- 🔴 **Vermelho**: Não acessível (`wheelchair=no`)
- **Clustering**: Agrupamento automático de marcadores próximos para melhor performance

#### 4. **🎮 Interatividade**

- **🔍 Busca por Texto**: Campo de pesquisa com sugestões dinâmicas
- **🎤 Busca por Voz**: Reconhecimento de voz em português brasileiro
- **ℹ️ Detalhes do Local**: Sidebar com informações detalhadas ao clicar nos marcadores
- **📱 Menu Responsivo**: Menu lateral com funcionalidades (perfil, favoritos, notificações)

#### 5. **📊 Informações Disponíveis**

- Nome do estabelecimento
- Categoria traduzida (restaurante, farmácia, banco, etc.)
- Status de acessibilidade com descrição
- Localização geográfica
- Descrição adicional (quando disponível no OSM)

### ♿ **Recursos de Acessibilidade Implementados**

- 🎤 Busca por voz para usuários com dificuldades motoras
- 🎨 Interface com alto contraste e cores intuitivas
- ⌨️ Navegação completa por teclado
- 🔤 Ícones universais com códigos de cores padronizados
- 📱 Design responsivo para diferentes dispositivos

---

## 💻 Tecnologias Utilizadas

### Frontend

- **HTML5** - Estruturação semântica
- **CSS3** - Estilização e responsividade
- **JavaScript (Vanilla)** - Lógica da aplicação
- **Bootstrap 5** - Framework CSS responsivo
- **Bootstrap Icons** - Biblioteca de ícones

### Mapas e Geolocalização

- **Leaflet.js** - Biblioteca de mapas interativos
- **Leaflet.markercluster** - Plugin para agrupamento de marcadores
- **OpenStreetMap** - Fonte dos dados geográficos

### APIs e Dados

- **Overpass API** - Consulta de dados do OpenStreetMap
- **Web Speech API** - Reconhecimento de voz
- **Geolocation API** - Localização do usuário

---

## 📥 Instalação e Uso

### Pré-requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexão com a internet (para carregamento dos dados do mapa)

### Passos para Execução

1. **Clone o repositório**

   ```bash
   git clone https://github.com/NascimentoJhesimiel/Open-Acess.git
   ```

2. **Navegue até o diretório**

   ```bash
   cd Open-Acess
   ```

3. **Abra o arquivo principal**

   - Abra o arquivo `index.html` em seu navegador
   - Ou utilize um servidor local:

     ```bash
     # Com Python
     python -m http.server 8000

     # Com Node.js
     npx serve .
     ```

4. **Acesse a aplicação**
   - Faça login (qualquer credencial funciona para demonstração)
   - Explore o mapa interativo de acessibilidade

### 🎯 Como Usar

1. **Login**: Insira qualquer usuário/email e senha (mínimo 8 caracteres)
2. **Explorar**: Use o mapa para visualizar os marcadores de acessibilidade
3. **Buscar**: Digite o nome de um local ou categoria na barra de busca
4. **Voz**: Clique no ícone do microfone para busca por voz
5. **Detalhes**: Clique em qualquer marcador para ver informações detalhadas

---

## 🌍 ODS - Objetivos de Desenvolvimento Sustentável

Este projeto contribui diretamente para os seguintes ODS da ONU:

### 🎯 **ODS 3 - Saúde e Bem-estar**

Promovendo o acesso a espaços que favorecem a saúde física e mental de pessoas com deficiência.

### ⚖️ **ODS 10 - Redução das Desigualdades**

Diminuindo as barreiras de acesso e promovendo igualdade de oportunidades para pessoas com mobilidade reduzida.

### 🏙️ **ODS 11 - Cidades e Comunidades Sustentáveis**

Contribuindo para o desenvolvimento de cidades mais inclusivas, seguras e acessíveis para todos.

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 Equipe

**Desenvolvido por**: Projeto Vanessa  
**Instituição**: Uninassau - 2º Período  
**Repositório**: [Open-Acess](https://github.com/NascimentoJhesimiel/Open-Acess)

---

## 📞 Contato

Para dúvidas, sugestões ou colaborações, entre em contato:

- **GitHub**: [@NascimentoJhesimiel](https://github.com/NascimentoJhesimiel)
- **Projeto**: [OpenAccess](https://github.com/NascimentoJhesimiel/Open-Acess)

---

**🌟 Juntos por uma sociedade mais acessível e inclusiva! 🌟**
