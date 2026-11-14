# Design

## Context

Ver `proposal.md` para a motivação. A base é o commit `6912947`, investigado em 13/11/2026. O inventário OpenSpec estava vazio. O código contém fluxos de editor/Drive e módulos de metadata, contexto e Claude; os checklists existentes não são evidência suficiente de entrega.

O design é necessário porque a documentação atravessa seis capacidades e precisa estabelecer fronteiras entre contratos existentes, falhas e funcionalidades futuras.

## Goals / Non-Goals

**Goals:**
- Estabelecer requisitos observáveis com cenários, mantendo rastreabilidade até as fontes.
- Permitir deltas pequenos e identificáveis nas próximas changes.
- Separar evidência estática, verificações locais e validação externa ainda pendente.

**Non-Goals:**
- Corrigir implementação ou inventar certificação de testes ponta a ponta.
- Transformar cada detalhe de classe, dependência ou defeito em contrato permanente.
- Publicar specs principais, arquivar esta change ou reorganizar README/docs/roadmap nesta etapa de planejamento.

## Decisions

### Adotar seis capacidades como base inicial

As delta specs usam ADDED porque não existem specs principais, não porque estas funcionalidades sejam novas na aplicação. A alternativa de copiar o roadmap inteiro misturaria comportamento existente e ambição futura. A alternativa de uma única spec de MVP dificultaria evoluir capacidades independentes.

| Capacidade | Fontes principais | Alcance adotado |
|---|---|---|
| authentication | `lib/auth.ts`, `middleware.ts`, `app/(auth)/login/page.tsx`, `components/layout/Header.tsx` | Login, sessão, acesso protegido e logout |
| google-drive-storage | `lib/storage/`, `app/api/drive/files/`, `components/editor/FileSidebar.tsx` | Listagem direta por pasta e CRUD |
| markdown-editor | `app/(dashboard)/dashboard/editor/page.tsx`, `components/editor/` | Navegação, edição, salvamento e feedback |
| document-metadata | `lib/metadata/`, `app/api/metadata/route.ts`, página do editor | Parsing, persistência e consulta direta por pasta |
| campaign-context | `lib/context/ContextBuilder.ts` | Filtros e contexto textual por correspondência |
| ai-chat | `app/api/chat/route.ts`, `lib/ai/`, `components/chat/` | Contrato da API textual; UI ainda indisponível |

### Separar contratos e lacunas

Os cenários descrevem os caminhos implementados e suas precondições. As lacunas abaixo não são requisitos aceitos nem tarefas de correção desta change. A alternativa de escrevê-las como garantias já entregues criaria uma base enganosa.

| Área | Limitação observada | Continuação sugerida, ainda não criada |
|---|---|---|
| Autenticação | Refresh token armazenado sem fluxo de renovação; falhas de inicialização externa podem anteceder os handlers | `stabilize-drive-editor` |
| Drive | Listagens sem paginação; filtro exige `text/markdown`, não apenas extensão `.md` | `stabilize-drive-editor` |
| Editor | Timer de autosave sem limpeza ao trocar arquivo/desmontar; exclusão e renomeação não reconciliam a seleção do editor | `stabilize-drive-editor` |
| Metadata | Editor não envia pasta; novos auxiliares podem ficar na raiz; renomeação/exclusão não sincronizam auxiliares; sem limpeza de órfãos ou atualização incremental | `complete-metadata-lifecycle` |
| Metadata | Erros de extração não chegam ao usuário; leitura pode ocultar falhas retornando lista vazia; timestamp usa horário da extração; cache global por fileId sem isolamento explícito por usuário | `complete-metadata-lifecycle` |
| Contexto | Sem grafo, busca por localização, expansão por entidades, recência ou cache de consultas; orçamento aproximado não contabiliza separadores; interrompe seleção ao primeiro bloco que não cabe | Evolução posterior de contexto |
| Chat | Componente importado e estado declarado, mas sidebar não renderizada nem toggle conectado; sem limite explícito de histórico ou rate limiting na aplicação | `enable-contextual-chat` |
| Chat | Método de streaming não utilizado pelo endpoint; modelo fixo Haiku diverge do Sonnet previsto no roadmap; chave Anthropic ausente de `.env.example` | `enable-contextual-chat` |
| Agente | Nenhuma operação de criação/edição via IA, confirmação, diff, desfazer ou templates implementada | `add-ai-document-editing` |
| Qualidade | Editor sem fluxo mobile completo demonstrado; dashboard com contadores estáticos; suíte automatizada e pipeline CI ausentes no repositório | Polimento e preparação de beta |

### Manter documentação com funções distintas

Destino proposto para etapas futuras: `openspec/specs/` contém contratos; `docs/` explica arquitetura, configuração e uso; README apresenta o projeto e aponta para essas fontes; roadmap mantém prioridades e links para changes. O roadmap atual será referência histórica, não fonte concorrente de status. Não executar essa reorganização dentro desta change de planejamento.

### Registrar confiança e verificação

- Leitura estática comprova presença e conexão dos caminhos de código, não funcionamento externo.
- Na investigação anterior desta conversa, ESLint passou e `tsc --noEmit --incremental false` falhou com TS7006 no parâmetro `f` de `MetadataExtractor.ts:62`.
- Não foram executadas nesta consolidação chamadas reais de OAuth, Drive ou Claude, testes de navegador, medição de performance ou build de produção.
- Não há suíte automatizada nem script de testes no `package.json`; `docs/TESTING.md` é um roteiro manual.
- Validação OpenSpec comprova estrutura dos artefatos, não conformidade da aplicação com todos os cenários.

## Risks / Trade-offs

- [Confundir documentação com entrega] -> Preservar as lacunas e precondições; não marcar o MVP completo nem tarefas pendentes como executadas.
- [Congelar defeitos como contrato] -> Registrar defeitos nesta matriz e tratar suas correções em changes próprias; não exigir que falhas atuais sejam preservadas.
- [Contrato amplo demais para evidência disponível] -> Manter chat no nível de API, listagem no nível de pasta e contexto no nível textual; revisão documental antes de publicar.
- [Documentação concorrente continuar induzindo erro] -> Reorganizar README/docs/roadmap em uma etapa documental posterior, sem duplicar checklists de entrega.

## Migration Plan

1. Revisar proposta e seis delta specs contra as fontes e a matriz de lacunas.
2. Validar com `openspec validate document-current-capabilities --strict` e conferir consistência entre capacidades e arquivos.
3. Após solicitação posterior para aplicar a change documental, executar suas tarefas de revisão. Não corrigir código para encerrar esta base.
4. Após revisão concluída e solicitação de arquivamento, incorporar os requisitos a `openspec/specs/` pelo fluxo de archive e validar as specs principais. Não arquivar como se integrações externas tivessem sido testadas.
5. Abrir propostas separadas para as correções e features priorizadas. Cada uma altera apenas os contratos afetados.

Não há migração de dados nem deploy de aplicação. Antes da publicação, rollback consiste em descartar apenas os artefatos desta change; depois da publicação, reverter o commit documental correspondente, preservando alterações posteriores.
