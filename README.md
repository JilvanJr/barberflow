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
7.  **Registro de Histórico para Commits:** Manter um registro contínuo das alterações na seção "Histórico do que está sendo realizado:". Para cada solicitação, descrever a implementação, ajuste ou correção. Este histórico servirá como base para a mensagem de commit. Após a geração do commit, o histórico deve ser limpo para o próximo ciclo.
8.  **Curiosidade Aleatória:** Antes de cada resposta, o desenvolvedor deve fornecer uma curiosidade curta e aleatória. Isso serve como uma confirmação de que as regras do README foram lidas e para compartilhar conhecimento.
9.  **Ordenação de Tabelas:** Todas as tabelas de dados devem permitir a ordenação por coluna. Ao clicar no cabeçalho de uma coluna, a tabela deve ser ordenada em ordem ascendente. Um segundo clique deve ordenar em ordem decrescente.

---- 
Historico do que está sendo realizado:
- Refatorada a UI da página de Clientes para alinhar com o novo design, melhorando a clareza e a experiência do usuário.
- Simplificada a tabela de clientes para exibir as colunas principais: Nome, Contato e Status.
- Substituídas as ações diretas de editar/excluir por um único botão "Ver mais".
- Implementado um modal de detalhes que centraliza a visualização de informações, a edição e o gerenciamento de status do cliente.
- Adicionada a funcionalidade de edição "inline" dentro do modal, permitindo a alteração de dados do cliente de forma prática.
- Trocada a funcionalidade de exclusão permanente por um sistema de ativação/inativação, preservando o histórico do cliente.
- Implementado um modal de confirmação para a ação de ativar/inativar, aumentando a segurança operacional.
- O status do cliente (Ativo/Inativo) agora é exibido de forma clara na tabela principal usando tags visuais.