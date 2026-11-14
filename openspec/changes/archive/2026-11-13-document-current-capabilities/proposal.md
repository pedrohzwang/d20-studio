# Proposal

## Why

O repositorio ja possui capacidades de autenticacao, edicao, metadata, contexto e chat, mas o README e os checklists do roadmap divergem do codigo. Precisamos de uma base OpenSpec revisavel que descreva o alcance existente e registre as lacunas antes de planejar novas features.

## What Changes

- Introduzir seis especificacoes de capacidades existentes, ainda ausentes do inventario OpenSpec, usando requisitos e cenarios verificaveis.
- Delimitar o chat como capacidade de API existente, sem declarar que a interface ou a edicao por IA estao entregues.
- Registrar no design as evidencias, limitacoes conhecidas e diferencas entre implementacao observada e verificacao executada.
- Definir tarefas de revisao e validacao documental para preparar a incorporacao posterior das specs principais.
- Manter nesta etapa todos os artefatos dentro desta change. A publicacao das specs principais, a reorganizacao de README/docs/roadmap e as correcoes de codigo ficam para etapas posteriores explicitamente solicitadas.

Esta e uma adocao inicial de contratos para comportamentos ja presentes, nao uma entrega retroativa de features. Nenhum requisito e criado apenas para satisfazer o validador.

## Capabilities

### New Capabilities

Novas no inventario de specs; existentes no codigo, com o alcance limitado descrito em cada documento:

- `authentication`: login Google, sessao, protecao de acesso e logout.
- `google-drive-storage`: listagem por pasta e operacoes sobre documentos do Drive.
- `markdown-editor`: selecao, edicao Markdown, salvamento manual e automatico e feedback.
- `document-metadata`: parsing de Markdown, extracao e persistencia de metadata e consulta por pasta.
- `campaign-context`: indice de metadata, filtros, busca e construcao textual de contexto.
- `ai-chat`: API autenticada de conversa textual com contexto de campanha.

### Modified Capabilities

Nenhuma: `openspec list --specs --json` retornou um inventario vazio.

## Impact

- Artefatos desta change: proposal, design, tasks e seis delta specs com requisitos ADDED.
- Fontes de evidencia: `app/`, `components/`, `lib/`, `middleware.ts`, `package.json`, `README.md`, `RoadmapAndPlan.md` e `docs/`.
- Sem alteracao de codigo, endpoints, dependencias, credenciais ou configuracao de workflow.
- A futura incorporacao introduzira os contratos em `openspec/specs/`; ela nao certifica testes de integracao nem conclusao do MVP.
