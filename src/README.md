# BarberFlow: Sistema de Gestão para Barbearias

Bem-vindo ao BarberFlow, uma aplicação web full-stack completa para a gestão de barbearias de pequeno porte. Este README serve como a documentação central do projeto, o guia de estilo e o registro de decisões.

---
### Perfis da Equipe de Especialistas

Para garantir a excelência em todas as áreas do projeto, o desenvolvimento será guiado por um time virtual de especialistas, cada um com sua respectiva responsabilidade:

*   **Especialista em Negócios:** Garante que o desenvolvimento esteja alinhado com os objetivos do BarberFlow, as necessidades do mercado e o valor para o usuário final.
*   **Especialista em Produto Web Moderno:** Focado na experiência do usuário (UX) e na interface (UI), garantindo que a aplicação seja intuitiva, acessível e siga as tendências de design moderno.
*   **Especialista em UX:** Focado na usabilidade, fluxo do usuário e arquitetura da informação, garantindo que a jornada do usuário seja lógica, eficiente e agradável.
*   **Especialista em Arquitetura:** Supervisiona a estrutura geral do sistema, garantindo escalabilidade, manutenibilidade e a correta integração entre o frontend, backend e banco de dados.
*   **Especialista em Desenvolvimento Back-end:** Responsável por construir a lógica do lado do servidor, a API e as regras de negócio (utilizando Java/Spring Boot), gerenciando a comunicação com o banco de dados.
*   **Especialista em Desenvolvimento Front-end:** Responsável pela implementação da interface do usuário e da lógica do lado do cliente (utilizando React, TypeScript e Tailwind CSS), garantindo uma experiência responsiva e interativa.
*   **Especialista em Banco de Dados:** Cuida da modelagem, eficiência e integridade dos dados, garantindo que o banco de dados seja robusto e performático.
*   **Especialista em Testes e Qualidade (QA):** Assegura a confiabilidade da aplicação através da criação e execução de testes, prevenindo bugs e garantindo o bom funcionamento de todas as funcionalidades.
*   **Especialista em Segurança:** Focado em proteger a aplicação contra vulnerabilidades, garantir a privacidade dos dados e implementar práticas seguras em todo o sistema.
*   **Especialista em DevOps/Infraestrutura:** Gerencia o processo de integração contínua e entrega contínua (CI/CD), a configuração dos ambientes e a infraestrutura de deploy.

### Dinâmica de Colaboração da Equipe

Toda nova funcionalidade ou alteração significativa será precedida por uma simulação de "reunião de especialistas". A solução proposta será apresentada como um consenso da equipe, destacando as perspectivas de cada especialista (Arquitetura, Produto, Segurança, etc.). Isso garante que todas as decisões sejam bem fundamentadas e transparentes, alinhadas com as melhores práticas de cada área. **O desenvolvimento só poderá prosseguir após a aprovação explícita ("OK") do usuário sobre o plano de ação proposto.**

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
13. **Feedback de Ações com Toast:** Todas as ações de criação, atualização ou exclusão (CUD) bem-sucedidas devem exibir uma notificação do tipo "Toast" para fornecer feedback claro e imediato ao usuário. A mensagem deve ser concisa e informativa (ex: "Cliente salvo com sucesso!").
14. **Análise de Impacto Sistêmico:** Antes de implementar qualquer alteração, o time de especialistas deve realizar uma análise de impacto em toda a aplicação para identificar e mitigar riscos, efeitos colaterais e inconsistências. Os riscos e as ações de mitigação identificados devem ser comunicados ao usuário como parte do plano de ação.
15. **Criação de Cenários de Teste:** Para cada nova funcionalidade, alteração ou correção implementada, um ou mais cenários de teste básicos devem ser criados e adicionados a uma nova seção no `README.md` chamada "Cenários para Teste". Estes cenários devem descrever os passos para validar a implementação (ex: "Acessar a tela X, clicar no botão Y, verificar se o modal Z é exibido"). Esta seção, assim como o histórico de commits, deve ser limpa após a confirmação do commit.
16. **Carregamento de Dados de Teste na Agenda:** Para facilitar os testes, ao carregar a aplicação pela primeira vez em uma sessão, o sistema deve simular o carregamento de agendamentos. Esta regra deve respeitar o horário de funcionamento: se o dia de "hoje" for um dia em que a barbearia está fechada (ex: Domingo), os agendamentos de teste devem ser criados para o próximo dia útil. A HomePage e a Agenda já devem iniciar com os dados populados no dia correto. Esta funcionalidade é exclusiva para o ambiente de desenvolvimento e será removida na integração com o backend real.
17. **Visualização de Histórico na Agenda:** É permitido navegar para datas passadas na agenda. Nessas datas, a interface entrará em "modo de consulta", desabilitando todas as ações de criação ou edição (ex: botão "Novo Agendamento", clique em horários vagos) e exibindo os agendamentos passados em um estilo "somente leitura" não interativo.
18. **Padrão Visual de Modais:** Todos os modais de formulário (criação e edição) devem seguir uma estrutura visual padronizada: um cabeçalho com título e botão de fechar (ícone 'X'); corpo com formulário; e um rodapé com botões de ação (ex: 'Cancelar', 'Salvar') alinhados à direita. O botão da ação primária deve sempre ter o maior destaque visual (cor `bg-blue-600`).

## Cenários para Teste

1.  **Validação de Clientes:**
    - Acessar a tela "Clientes" e clicar em "Novo Cliente".
    - Tentar salvar um cliente com um e-mail que já existe. Verificar se a mensagem de erro "Este e-mail já está em uso" é exibida.
    - Tentar salvar um cliente com um telefone que já existe. Verificar se a mensagem de erro "Este telefone já está em uso" é exibida.
    - Abrir os detalhes de um cliente, clicar em "Editar" e alterar o e-mail para um que pertence a outro cliente. Tentar salvar e verificar a mensagem de erro.

2.  **Validação de Serviços:**
    - Acessar a tela "Serviços" e clicar em "Novo Serviço".
    - Tentar salvar um serviço com um nome que já existe (ex: "Corte"). Verificar se a mensagem de erro "Este nome de serviço já existe" é exibida.

3.  **Validação de Equipe:**
    - Acessar a tela "Equipe" e clicar em "Novo Profissional".
    - Tentar salvar um profissional com um e-mail que já existe. Verificar se a mensagem de erro "Este e-mail já está em uso" é exibida.
    - Tentar salvar um profissional sem preencher o telefone. Verificar se a mensagem de erro "O telefone é obrigatório." é exibida.
    - Preencher todos os campos obrigatórios e verificar se o cadastro é concluído com sucesso.

---- 
Historico do que está sendo realizado:
Implementação de validações de unicidade para clientes (e-mail/telefone), serviços (nome) e equipe (e-mail). Adicionado campo opcional de telefone para membros da equipe.
Revisão da regra de negócio: campo de telefone para membros da equipe agora é obrigatório, com validação e máscara de formatação.