... (todo o conteúdo anterior do README) ...

---

## Parte 3: Regras de Desenvolvimento

Esta seção contém as regras e padrões a serem seguidos durante o desenvolvimento para manter a consistência do código.

1.  **Nomenclatura de Arquivos:** Todos os componentes que representam uma página inteira devem ter a terminação `Page.tsx` (ex: `ClientsPage.tsx`).
2.  **Estilização:** A estilização deve ser feita prioritariamente com as classes utilitárias do Tailwind CSS. Evitar a criação de CSS customizado ou inline styles sempre que possível.
3.  **Padrão de Cores:**
    -   **Ações Primárias (Salvar, Adicionar):** Usar a cor `bg-blue-600`.
    -   **Ações de Exclusão/Perigo (Deletar, Cancelar):** Usar a cor `bg-red-600`.
4.  **Estrutura de Arquivos Duplicada:** A aplicação mantém uma estrutura de arquivos duplicada (na raiz e dentro da pasta `src/`) para compatibilidade com o deploy. Qualquer alteração solicitada em um arquivo (ex: `components/Sidebar.tsx`) deve ser replicada no arquivo correspondente em `src/` (ex: `src/components/Sidebar.tsx`).
5.  **Proposta de Novas Regras:** Ao introduzir uma nova funcionalidade ou padrão, o desenvolvedor deve propor a nova regra de desenvolvimento associada, perguntando "Gostaria que atualizasse o README com essa nova regra?" e aguardar a aprovação do usuário antes de aplicá-la ao arquivo.
6.  **Hierarquia de Disponibilidade da Agenda:** Todas as funcionalidades de agenda devem respeitar a seguinte hierarquia de disponibilidade: 1º Horário de Funcionamento da Barbearia (definido nas Configurações), 2º Horário de Trabalho Individual do Barbeiro (definido no perfil do membro da equipe), 3º Bloqueios Pessoais (como o horário de almoço). Um horário só é considerado disponível se passar por todas essas validações.