# Tasks

Estas tarefas são uma revisão documental da base existente. Não autorizam correções de código, reorganização de documentação externa à change ou implementação das features futuras. A criação dos artefatos de planejamento não conclui automaticamente estas tarefas.

## 1. Revisão dos contratos existentes

- [x] 1.1 Conferir authentication e google-drive-storage contra as fontes da matriz do design; verificar que cada cenário tem caminho de código correspondente e que renovação de token, paginação e MIME types adicionais permanecem lacunas explícitas.
- [x] 1.2 Conferir markdown-editor contra a página do editor e seus componentes; verificar que salvamento e navegação estão cobertos sem declarar resolvidos os defeitos de autosave e reconciliação da seleção.
- [x] 1.3 Conferir document-metadata e campaign-context contra parsers, endpoint e builder; verificar que a documentação distingue extração existente de sincronização completa e contexto textual de busca por relacionamentos.
- [x] 1.4 Conferir ai-chat contra endpoint, serviço e componentes; verificar que os cenários cobrem somente a API e não afirmam disponibilidade da UI, streaming ponta a ponta ou edição por IA.

## 2. Coerência e preparação para publicação

- [x] 2.1 Conferir as seis capacidades da proposta contra os seis arquivos de spec e revisar a matriz de evidências e lacunas do design; verificar ausência de funcionalidades futuras apresentadas como entregues e de defeitos exigidos como comportamento permanente.
- [x] 2.2 Executar `openspec validate document-current-capabilities --strict` e inspecionar `openspec status --change document-current-capabilities --json`; verificar validação sem erros ou avisos e presença de proposal, design, tasks e seis delta specs.
- [x] 2.3 Conferir o diff documental antes da publicação; verificar que somente esta change foi alterada e que o registro de confiança mantém OAuth/Drive/Claude sem validação externa e a falha TypeScript conhecida como pendências, sem alegar conformidade integral da aplicação.

## Workflow follow-up

- Após revisão concluída e solicitação do usuário, arquivar esta change pelo fluxo OpenSpec, incorporando as seis capacidades a `openspec/specs/` e validando as specs principais.
- Em etapa documental posterior, consolidar README, documentação de arquitetura/uso e roadmap conforme as responsabilidades definidas no design.
- Propor separadamente `stabilize-drive-editor`, `complete-metadata-lifecycle`, `enable-contextual-chat` e `add-ai-document-editing`, conforme a prioridade escolhida; não criar nem implementar essas changes como parte desta base.
