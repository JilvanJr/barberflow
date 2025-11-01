---

## Regras de Desenvolvimento

Esta seção contém as regras e padrões a serem seguidos durante o desenvolvimento para manter a consistência do código.

1.  **Nomenclatura de Arquivos:** Todos os componentes que representam uma página inteira devem ter a terminação `Page.tsx` (ex: `ClientsPage.tsx`).
2.  **Estilização:** A estilização deve ser feita prioritariamente com as classes utilitárias do Tailwind CSS. Evitar a criação de CSS customizado ou inline styles sempre que possível.
3.  **Padrão de Cores:**
    -   **Ações Primárias (Salvar, Adicionar):** Usar a cor `bg-blue-600`.
    -   **Ações de Exclusão/Perigo (Deletar, Cancelar):** Usar a cor `bg-red-600`.
4.  **Estrutura de Arquivos Duplicada:** A aplicação mantém uma estrutura de arquivos duplicada (na raiz e dentro da pasta `src/`) para compatibilidade com o deploy. Qualquer alteração solicitada em um arquivo (ex: `components/Sidebar.tsx`) deve ser replicada no arquivo correspondente em `src/` (ex: `src/components/Sidebar.tsx`).
5.  **Proposta de Novas Regras:** Ao introduzir uma nova funcionalidade ou padrão, o desenvolvedor deve propor a nova regra de desenvolvimento associada, perguntando "Gostaria que atualizasse o README com essa nova regra?" e aguardar a aprovação do usuário antes de aplicá-la ao arquivo.
6.  **Hierarquia de Disponibilidade da Agenda:** Todas as funcionalidades de agenda devem respeitar a seguinte hierarquia de disponibilidade: 1º Horário de Funcionamento da Barbearia (definido nas Configurações), 2º Horário de Trabalho Individual do Barbeiro (definido no perfil do membro da equipe), 3º Bloqueios Pessoais (como o horário de almoço). Um horário só é considerado disponível se passar por todas essas validações.
7.  **Registro de Histórico para Commits:** Manter um registro contínuo das alterações na seção "Histórico do que está sendo realizado:". Para cada solicitação, descrever a implementação, ajuste ou correção. Este histórico servirá como base para a mensagem de commit. O desenvolvedor solicitará confirmação ("Podemos limpar o histórico para o próximo commit?") antes de limpar o histórico para o próximo ciclo.
8.  **Curiosidade Aleatória:** Antes de cada resposta, o desenvolvedor deve fornecer uma curiosidade curta e aleatória. Isso serve como uma confirmação de que as regras do README foram lidas e para compartilhar conhecimento.
9.  **Ordenação de Tabelas:** Todas as tabelas de dados devem permitir a ordenação por coluna. Ao clicar no cabeçalho de uma coluna, a tabela deve ser ordenada em ordem ascendente. Um segundo clique deve ordenar em ordem decrescente.
10. **Regra de Inativação:** Entidades inativas (como Clientes e Serviços) não devem estar disponíveis para novas operações, como a criação de agendamentos. A interface deve refletir essa regra, ocultando ou desabilitando essas opções.
11. **Padrão de Placeholders:** Para evitar a confusão de campos pré-preenchidos, todos os campos de formulário devem usar placeholders com texto genérico e instrutivo (ex: "Nome completo do cliente"). O estilo do placeholder deve ser visualmente distinto do texto inserido, utilizando as classes do Tailwind: `placeholder:italic placeholder:text-gray-400`.
12. **Paginação de Tabelas:** Todas as tabelas que exibem listas de dados (como Clientes, Serviços, Caixa) devem implementar um sistema de paginação. Por padrão, cada página deve exibir 10 registros. A interface deve incluir controles de navegação (ex: "Anterior" e "Próximo") e um contador que informa o total de itens e a página atual (ex: "Mostrando 1 a 10 de 50").

---- 
Historico do que está sendo realizado:

- Adição da Regra de Desenvolvimento nº 12 ao README para formalizar o padrão de paginação em tabelas.
- Implementação de paginação nas tabelas de Clientes e Serviços para consistência com a tela de Caixa.
- Padronização dos placeholders nos modais de "Novo Serviço", "Novo Membro" e "Nova Transação" para seguir a nova regra de desenvolvimento (texto genérico, itálico e cor cinza claro).
- Adição da Regra de Desenvolvimento nº 11 ao README para formalizar o padrão de placeholders.
- Correção da lógica de exibição da mensagem de confirmação ao ativar/inativar um cliente ou serviço.
- Ajuste no modal de "Novo Cliente" para usar placeholders genéricos e com estilo visual diferenciado, melhorando a usabilidade.