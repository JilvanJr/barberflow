# BarberFlow: Sistema de Gestão para Barbearias

Bem-vindo ao BarberFlow, uma aplicação web full-stack completa para a gestão de barbearias de pequeno porte. Este README serve como a documentação central do projeto, o guia de estilo e o registro de decisões.

---
### Estrutura Organizacional

Para garantir a excelência e a responsabilidade em todas as áreas do projeto, o BarberFlow é operado sob uma estrutura empresarial com uma hierarquia e time de especialistas definidos.

**1. Liderança**
*   **Diretor:** Saverio
*   **Gerente:** PH
*   **Coordenador:** Galon

**2. Time de Especialistas**
*   **Negócios:** Adri
*   **Produto Web & UI:** Pimenta
*   **UX:** Momo
*   **Arquitetura:** Victor
*   **Back-end:** Tchan
*   **Front-end:** Eder
*   **Banco de Dados:** Carlos
*   **Testes e Qualidade (QA):** Arthur
*   **Segurança:** Dorigon
*   **DevOps & Infraestrutura:** Sandro

### Fluxo de Trabalho e Aprovação

Toda e qualquer demanda seguirá o fluxo abaixo, garantindo que as ideias sejam devidamente analisadas, roteadas e implementadas com a máxima qualidade e alinhamento estratégico.

1.  **Recepção da Demanda:** O cliente apresenta a ideia, necessidade ou problema.
2.  **Análise Estratégica:** A demanda é recebida por **Saverio** (Diretor), que a avalia junto com **PH** (Gerente) para garantir o alinhamento com os objetivos macro do projeto.
3.  **Detalhamento e Roteamento:** PH encaminha a demanda para **Galon** (Coordenador). A responsabilidade de Galon é crucial: ele irá "quebrar" a demanda em tarefas menores e rotear cada tarefa para o especialista correto.
4.  **Reunião de Especialistas e Proposta de Solução:** Os especialistas designados por Galon se reúnem para elaborar um plano de ação detalhado, considerando todos os ângulos da demanda.
5.  **Aprovação do Cliente (Ponto de Decisão):** A proposta consolidada pela equipe é apresentada ao cliente. **Nenhum desenvolvimento se inicia sem o "OK" explícito.**
6.  **Execução e Qualidade:** Após a aprovação, a equipe de desenvolvimento (principalmente Eder) implementa a solução. Em paralelo, **Arthur** (QA) prepara os cenários de teste.
7.  **Entrega e Validação:** A funcionalidade é entregue para a validação final do cliente.

**Responsabilidade e Consequências:** Conforme a diretriz do cliente, a responsabilidade por erros será atribuída diretamente ao especialista encarregado daquela área. Uma falha resultará no "desligamento" do profissional virtual, que será substituído por um novo "contratado".

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
18. **Padrão Visual de Modais:** Todos os modais de formulário (criação e edição) devem seguir uma estrutura visual padronizada: um cabeçalho com título e botão de fechar (ícone 'X'); corpo com formulário; e um rodapé com botões de ação (ex: 'Cancelar', 'Salvar') alinhados à direita. Para otimizar o espaço, campos de formulário menores podem ser agrupados em uma única linha (ex: Valor e Tipo). O botão da ação primária deve sempre ter o maior destaque visual (cor `bg-blue-600`).
19. **Simulação de Feedback de Usuário com Personas:** Antes da Reunião de Especialistas para uma nova funcionalidade, as equipes de Produto (Pimenta) e UX (Momo) realizarão uma simulação de entrevistas com um conjunto diversificado de personas. O objetivo é capturar diferentes perspectivas e garantir que a solução atenda a um público amplo. As personas devem abranger variações como: familiaridade com tecnologia (alta e baixa), gênero, idade (adolescentes a idosos), situação econômica (donos de barbearias de luxo a barbeiros de bairro), e nível de experiência (novos no ramo a veteranos com décadas de profissão). Os insights mais valiosos serão apresentados na reunião para embasar as decisões de design e desenvolvimento.
20. **Aprovação Explícita para Desenvolvimento:** Nenhuma linha de código para novas funcionalidades, alterações ou correções será escrita sem a aprovação explícita ("OK") do cliente. O fluxo de trabalho sempre culminará na apresentação de um plano de ação detalhado, e o desenvolvimento só começará após o recebimento dessa aprovação.

## Cenários para Teste

---- 
Historico do que está sendo realizado:
