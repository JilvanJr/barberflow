
# BarberFlow - Sistema de Gerenciamento para Barbearias

## Visão Geral

BarberFlow é uma aplicação web moderna e intuitiva, projetada para ser um sistema de gerenciamento completo para barbearias de pequeno e médio porte. O objetivo é fornecer uma ferramenta centralizada que ajuda barbeiros a otimizar suas operações diárias, desde o agendamento de clientes até o controle financeiro.

A interface foi construída com foco na experiência do usuário (UX), resultando em um painel de controle limpo, visualmente agradável e fácil de usar, inspirado nos layouts de sistemas de gestão de ponta.

## Funcionalidades Principais

A aplicação é dividida em quatro módulos principais, acessíveis através de uma navegação lateral clara e concisa:

### 1. Agenda

O coração do sistema. A agenda oferece uma visualização clara dos compromissos do dia, organizada por profissional.

- **Visualização por Colunas:** Cada barbeiro tem sua própria coluna, facilitando a visualização da carga de trabalho individual.
- **Linha do Tempo:** Uma linha do tempo vertical marca as horas, permitindo um encaixe preciso dos agendamentos.
- **Filtros Avançados:** É possível filtrar a visualização por data, profissional, tipo de serviço e buscar por clientes específicos.
- **Agendamento Rápido:** Um botão de "Novo Agendamento" permite adicionar novos compromissos de forma eficiente.
- **Navegação de Datas:** Inclui um seletor de data com calendário para planejar semanas e meses à frente.

### 2. Clientes

Um CRM simples para gerenciar a base de clientes da barbearia.

- **Listagem Completa:** Todos os clientes são listados em uma tabela organizada com informações essenciais (Nome, Data de Nascimento, Telefone, E-mail).
- **Busca Rápida:** Um campo de busca permite encontrar clientes por nome ou CPF instantaneamente.
- **Gerenciamento de Clientes:** Ações rápidas para editar informações ou remover um cliente do sistema.
- **Cadastro de Novos Clientes:** Um fluxo simples para adicionar novos clientes à base de dados.

### 3. Serviços

Módulo para cadastrar e gerenciar os serviços oferecidos pela barbearia.

- **Catálogo de Serviços:** Uma lista clara de todos os serviços com seus respectivos valores.
- **Gerenciamento de Preços:** Ações para editar o nome e o preço de um serviço ou excluí-lo.
- **Cadastro Simples:** Facilidade para adicionar novos serviços ao catálogo conforme o negócio evolui.

### 4. Fluxo de Caixa (Acesso Restrito)

Uma ferramenta financeira visual para o controle de entradas e saídas, acessível apenas pelo administrador (dono da barbearia).

- **Dashboard Financeiro:** Cards de resumo exibem o total de entradas, saídas e o resultado líquido, oferecendo uma visão rápida da saúde financeira do negócio.
- **Extrato Detalhado:** Uma tabela registra todas as transações, incluindo data, cliente, método de pagamento e valor.
- **Categorização:** As transações são claramente marcadas como "Entrada" ou "Saída" para fácil identificação.
- **Busca e Filtros:** Ferramentas para buscar ordens específicas ou filtrar o extrato por período.

## Inovações e Funcionalidades Adicionais

Além do solicitado, foram implementados alguns conceitos para melhorar a usabilidade e a experiência geral:

- **Componentização e Reutilização:** A interface foi construída com componentes reutilizáveis (botões, inputs, tabelas), o que garante consistência visual e facilita a manutenção.
- **Simulação de Autenticação e Permissões:** Foi implementado um sistema simples de "troca de usuário" no cabeçalho. Isso permite simular o login como "Admin" ou "Barbeiro", demonstrando como o controle de acesso funciona na prática (por exemplo, ocultando a tela de "Fluxo de Caixa" para o perfil de barbeiro).
- **Design Responsivo (Conceito):** A estrutura com Tailwind CSS está preparada para a fácil implementação de um design totalmente responsivo, adaptando-se a tablets e outros dispositivos.
- **Ícones SVG Integrados:** Para garantir performance e um visual nítido, todos os ícones são componentes SVG integrados diretamente no código, eliminando a necessidade de carregar fontes de ícones externas.

## Como Funciona (Estrutura Técnica)

- **Front-end:** A aplicação foi construída com **React 18+** e **TypeScript**, garantindo um código moderno, tipado e escalável.
- **Estilização:** **Tailwind CSS** foi utilizado para criar toda a interface de forma utilitária, resultando em um design customizado e de alta fidelidade em relação ao protótipo.
- **Gerenciamento de Estado:** O estado da aplicação (como a página ativa e o usuário logado) é gerenciado através de React Hooks (`useState`, `useContext`), evitando a complexidade de bibliotecas externas para este escopo de projeto.
- **Navegação:** A navegação entre as páginas é controlada internamente por estado, sem a necessidade de uma biblioteca de roteamento, o que torna a aplicação extremamente rápida e contida em um único ambiente.
- **Dados:** Atualmente, a aplicação utiliza dados mocados (mock data) para simular o funcionamento. Isso permite demonstrar todas as funcionalidades da interface sem a necessidade de um back-end.

Este projeto representa um front-end completo e funcional, pronto para ser integrado a uma API back-end para se tornar um produto comercializável.
