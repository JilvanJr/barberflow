# BarberFlow - Sistema de Gerenciamento para Barbearias

## Parte 1: Documentação Técnica

Esta seção foca na arquitetura, tecnologias e estrutura do projeto, destinada a desenvolvedores e colaboradores técnicos.

### 1.1. Arquitetura da Solução

O BarberFlow é projetado como uma aplicação **Single-Page Application (SPA)** com uma arquitetura de cliente-servidor desacoplada.

-   **Frontend (Cliente):** Uma aplicação rica e interativa construída com **React** e **TypeScript**. É responsável por toda a renderização da interface do usuário (UI) e pela experiência do usuário (UX). Ele não contém lógica de negócio crítica e consome dados de uma API externa.
-   **Backend (Servidor):** Uma **API RESTful** robusta construída com **Spring Boot (Java)**. É responsável pela lógica de negócio, persistência de dados, autenticação e autorização. O frontend é totalmente agnóstico em relação à implementação do backend, desde que o contrato da API seja respeitado.
-   **Comunicação:** A comunicação entre o frontend e o backend ocorre exclusivamente via requisições HTTP, com dados trafegando no formato **JSON**.

Atualmente, para permitir o desenvolvimento e a demonstração completa do frontend sem a necessidade de um servidor Java ativo, foi implementada uma **camada de API simulada (Mock API)** em TypeScript. Esta camada simula perfeitamente as requisições de rede, respostas e o comportamento de um backend real, facilitando a transição para a API definitiva.

### 1.2. Frontend (React)

-   **Linguagem/Framework:** React 18+ com TypeScript.
-   **Estilização:** Tailwind CSS, utilizado para criar uma UI customizada e consistente de forma utilitária.
-   **Gerenciamento de Estado Global:** React Context API (`useContext`) para gerenciar o estado de autenticação (usuário logado, token) e a página ativa, mantendo a solução leve e sem dependências externas de gerenciamento de estado.
-   **Comunicação com API:** As chamadas à API são abstraídas em uma camada de serviço (`src/api.ts`). Esta camada é responsável por encapsular a lógica de requisição, manipulação de headers (como `Authorization`) e simulação de latência de rede.
-   **Estrutura de Componentes:** A UI é organizada em componentes funcionais e reutilizáveis (ícones, modais, botões) e páginas que representam cada módulo do sistema.

### 1.3. Backend (API Spring Boot - Planejado)

-   **Linguagem/Framework:** Java 17+ com Spring Boot 3+.
-   **Arquitetura:** API RESTful com arquitetura em camadas (Controller, Service, Repository).
-   **Persistência de Dados:** Spring Data JPA com Hibernate, conectado a um banco de dados relacional (como PostgreSQL ou MySQL). Para desenvolvimento, pode-se usar um banco em memória como o H2.
-   **Segurança:** Spring Security para gerenciar a autenticação e autorização. A autenticação é baseada em **JSON Web Tokens (JWT)**, garantindo que a API seja stateless. As permissões granulares de cada usuário são validadas em cada endpoint protegido.
-   **Validação:** Bean Validation para validar os dados de entrada (DTOs) nas camadas de Controller.
-   **Endpoints Principais (Exemplos):**
    -   `POST /api/auth/login`: Autentica um usuário e retorna um JWT.
    -   `GET, POST /api/appointments`: Gerencia agendamentos.
    -   `GET, POST, PUT, DELETE /api/clients`: CRUD de clientes.
    -   `PUT /api/users/{id}/permissions`: Atualiza as permissões de um usuário.

---

## Parte 2: Documentação Funcional

Esta seção foca nas funcionalidades, regras de negócio e visão de produto do BarberFlow.

### 2.1. Visão Geral do Produto

BarberFlow é um sistema de gestão completo para barbearias de pequeno e médio porte. O objetivo é centralizar e otimizar as operações diárias, oferecendo ferramentas intuitivas para gerenciar agendamentos, clientes, serviços e finanças em uma única plataforma. A aplicação possui dois portais distintos: um portal administrativo para a equipe (administradores e barbeiros) e um portal para clientes.

### 2.2. Módulos e Funcionalidades

#### Portal da Equipe (Dashboard)

**1. Agenda**
-   **Visualização Centralizada:** Uma grade exibe os agendamentos do dia, organizados em colunas por barbeiro.
-   **Linha do Tempo Visual:** Horários são exibidos verticalmente, e os agendamentos ocupam um espaço proporcional à sua duração, facilitando a identificação de horários livres.
-   **Agendamento Inteligente:** O modal de agendamento é um assistente passo a passo que calcula e exibe apenas os horários disponíveis, prevenindo agendamentos duplos.
-   **Ações Rápidas:** Permite clicar em um agendamento para ver detalhes ou cancelá-lo (requer permissão).

**2. Clientes**
-   **CRM Simplificado:** Uma lista central de todos os clientes com busca rápida por nome ou e-mail.
-   **Gestão de Clientes:** Funcionalidades de criar, editar e excluir clientes (sujeito a permissões). O formulário inclui validações e máscaras para campos como telefone e data de nascimento.

**3. Serviços**
-   **Catálogo Digital:** Gerenciamento dos serviços oferecidos, incluindo nome, preço e duração. A duração é usada pela Agenda para calcular a disponibilidade de horários.
-   **CRUD de Serviços:** Administradores podem adicionar, editar ou remover serviços do catálogo.

**4. Equipe**
-   **Gestão de Profissionais:** Permite ao administrador cadastrar os barbeiros e outros membros da equipe que usarão o sistema.

**5. Fluxo de Caixa (Acesso Restrito)**
-   **Dashboard Financeiro:** Cards de resumo exibem Receita Total, Despesa Total e Saldo, oferecendo uma visão instantânea da saúde financeira.
-   **Geração Automática de Transações:** Quando um agendamento é concluído, uma transação de "Entrada" pendente é criada automaticamente no caixa.
-   **Confirmação de Pagamento:** O administrador pode confirmar o pagamento de transações pendentes, especificando o método (Pix, Cartão, etc.).
-   **Lançamentos Manuais:** Permite adicionar transações avulsas, como despesas (aluguel, produtos) ou outras receitas.
-   **Tabela com Filtro e Ordenação:** A lista de transações possui busca unificada, ordenação por qualquer coluna e paginação para lidar com grandes volumes de dados.

**6. Permissões (Acesso Exclusivo do Admin)**
-   **Controle de Acesso Granular:** O administrador pode selecionar qualquer membro da equipe e definir permissões específicas para cada ação no sistema.
-   **Perfis Flexíveis:** Permite criar perfis personalizados (ex: "Recepcionista") que podem gerenciar a agenda e clientes, mas não têm acesso a dados financeiros sensíveis.
-   **Segurança Aplicada:** A interface se adapta em tempo real às permissões do usuário logado. Botões e menus para ações não autorizadas são ocultados, não apenas desabilitados.

#### Portal do Cliente

-   **Autenticação Separada:** Clientes possuem sua própria área de login e cadastro.
-   **Visualização de Serviços:** Clientes podem ver o catálogo de serviços com preços e durações.
-   **Agendamento Self-Service:** O cliente pode escolher um serviço, um profissional e ver os horários disponíveis para agendar seu próprio atendimento.
-   **Meus Agendamentos:** Uma área onde o cliente pode visualizar seus agendamentos futuros e passados, com a opção de cancelar compromissos futuros.

### 2.3. Registro de Atualizações (Changelog)

-   **v2.0 (Atual): Arquitetura Full-Stack Simulada**
    -   Implementada uma camada de API simulada (`api.ts`) para desacoplar o frontend dos dados mocados.
    -   Refatoradas todas as páginas para consumir dados da camada de API, com estados de carregamento.
    -   Implementado fluxo de autenticação completo com armazenamento de token simulado.
    -   Adicionado `README.md` com documentação técnica e funcional detalhada.
-   **v1.0: Protótipo Funcional com Dados Locais**
    -   Desenvolvimento inicial de todas as telas com dados mocados.
    -   Criação do sistema de permissões e do portal do cliente.
    -   Implementação de filtros, ordenação e paginação na tela de Fluxo de Caixa.
    -   Estruturação inicial do projeto com React, TypeScript e Tailwind CSS.
