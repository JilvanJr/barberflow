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

## Cenários para Teste

*   **Cenário 1: Validação de UI da Agenda**
    1.  Acesse a tela "Agenda".
    2.  Verifique se o botão "Hoje" possui a mesma altura dos botões "Seletor de Data" e "Novo Agendamento".
    3.  Localize um agendamento existente (ex: Lionel Messi). Verifique se o nome do cliente está com a fonte maior (14px).
    4.  Role a agenda para encontrar um horário de almoço ou fora do expediente (bloco "Agenda Bloqueada"). Verifique se a listra cinza à esquerda está completa, sem falhas no canto superior.
    5.  Confirme que as linhas divisórias entre as colunas dos barbeiros no cabeçalho estão perfeitamente alinhadas com as linhas da grade de horários abaixo.

*   **Cenário 2: Validação de Restrição de Datas Passadas**
    1.  Acesse a tela "Agenda".
    2.  Clique no seletor de data.
    3.  Tente selecionar uma data anterior ao dia de hoje. A ação deve ser bloqueada.
    4.  Mude a data no código para uma data passada (ex: `useState('2024-01-01')`) para forçar a visualização.
    5.  Passe o mouse sobre a grade de horários. O cursor deve ser o de "não permitido" (`not-allowed`).
    6.  Tente clicar em um horário vago. Nenhuma ação (abertura de modal) deve ocorrer.

*   **Cenário 3: Validação do Horário de Fechamento**
    1.  Acesse "Configurações" -> "Horário de Funcionamento". Confirme que Sábado fecha às 17:00 e Sexta-feira às 19:00.
    2.  Volte para a "Agenda" e selecione uma data que seja um Sábado (ex: 8 de nov de 2025).
    3.  Verifique se a grade de horários termina às 17:00 (o último horário exibido na lateral deve ser `16:30`).
    4.  Selecione uma data que seja uma Sexta-feira.
    5.  Verifique se a grade de horários termina às 19:00 (o último horário exibido na lateral deve ser `18:30`).

*   **Cenário 4: Carregamento de Dados de Teste (Botão Hoje)**
    1.  Acesse a "Agenda".
    2.  Clique no botão "Hoje". A data do calendário deve ser alterada para a data atual.

*   **Cenário 5: Carregamento Automático de Dados**
    1.  Limpe os dados de sessão do navegador e acesse a aplicação em um dia de semana (ex: Quarta-feira).
    2.  Verifique se a `HomePage` exibe o título "Agendamentos do Dia" com uma lista de agendamentos.
    3.  Limpe os dados de sessão novamente e altere a data do seu sistema para um Domingo.
    4.  Acesse a aplicação. Verifique se a `HomePage` exibe o título "Agendamentos para Segunda-feira" com uma lista de agendamentos.
    5.  Navegue para a "Agenda". Verifique se a data selecionada no calendário é a da Segunda-feira.

---- 
Historico do que está sendo realizado:

*   **Correção de UI (Agenda):** Padronizado o tamanho do botão "Hoje" para corresponder aos outros botões do cabeçalho, garantindo consistência visual.
*   **Correção de UI (Agenda):** Aumentado o tamanho da fonte do nome do cliente no card de agendamento para 14px (`text-sm`).
*   **Correção de UI (Agenda):** Corrigido o bug visual na borda do evento "Agenda Bloqueada", garantindo que a listra lateral seja contínua.
*   **Correção de UI (Agenda):** Corrigido o desalinhamento das colunas da agenda (causado pela barra de rolagem), adicionando um preenchimento no cabeçalho para garantir o alinhamento perfeito com a grade.
*   **Refatoração (Agenda):** A grade de horários da agenda agora é gerada dinamicamente com base no horário de funcionamento da barbearia.
*   **Melhoria de UX (Agenda):** Bloqueada a interação (clique e agendamento) em datas passadas na agenda e no seletor de data.
*   **Correção (Agenda):** Corrigido o bug onde a grade de horários não respeitava o horário de fechamento do dia selecionado, exibindo horários extras. A agenda agora renderiza a grade dinamicamente com base no dia específico.
*   **Funcionalidade de Teste (Core):** Implementada a Regra nº 16. Os dados de teste agora são gerados automaticamente no carregamento inicial da aplicação, populando a HomePage e a Agenda de forma inteligente com base no próximo dia útil.