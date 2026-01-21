# D20 Studio - Plano de Implementação Completo

## 📋 Visão Geral do Produto

### Objetivo
D20 Studio é uma aplicação web que permite mestres de RPG gerenciarem suas campanhas com auxílio de IA, mantendo arquivos em Markdown no Google Drive e fornecendo contexto rico através de extração automática de metadata.

### Princípios de Design
- **Simplicidade Visual**: UI minimalista e intuitiva
- **Liberdade de Escrita**: Usuário escreve em Markdown natural, sem estruturas rígidas
- **IA Invisível**: Extração de metadata acontece automaticamente nos bastidores
- **Zero Lock-in**: Arquivos ficam no Google Drive do usuário em formato portável
- **Sistema Agnóstico**: Funciona com qualquer sistema de RPG (D&D, Pathfinder, etc)

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Editor**: Monaco Editor ou CodeMirror (para edição de Markdown)
- **Estado**: Zustand (gerenciamento de estado leve)
- **Markdown Parser**: gray-matter (parsing de frontmatter) + remark/unified

### Backend/APIs
- **API Routes**: Next.js API Routes
- **IA**: Anthropic Claude API (Sonnet 4.5)
- **Storage**: Google Drive API (via REST ou MCP)
- **Auth**: NextAuth.js com Google OAuth 2.0

### Infraestrutura
- **Deploy**: Vercel
- **Ambiente**: Node.js 18+
- **Banco de Dados**: Nenhum (MVP usa apenas Google Drive)

---

## 📐 Arquitetura do Sistema

### Padrão Storage Adapter
```typescript
interface StorageProvider {
  listFiles(folderId?: string): Promise<File[]>;
  readFile(fileId: string): Promise<string>;
  writeFile(fileId: string, content: string): Promise<void>;
  createFile(name: string, content: string, folderId?: string): Promise<string>;
  deleteFile(fileId: string): Promise<void>;
}
```

### Fluxo de Dados
```
User → Next.js Frontend → API Routes → Google Drive API
                ↓
        Claude API (contexto)
                ↓
        Metadata Extraction
                ↓
        .meta.json (oculto no Drive)
```

---

## 🎯 MVP - Fases de Implementação

## FASE 1: Fundação (Semana 1-2)

### Sprint 1.1: Setup Inicial e Autenticação
**Duração**: 3-4 dias

#### Objetivos
- Projeto Next.js configurado
- Autenticação com Google funcionando
- Acesso básico ao Google Drive

#### Tarefas
1. **Setup do Projeto**
   - [ ] Inicializar projeto Next.js 14 com TypeScript
   - [ ] Configurar Tailwind CSS
   - [ ] Instalar shadcn/ui base components
   - [ ] Configurar ESLint e Prettier
   - [ ] Setup de variáveis de ambiente (.env.local)

2. **Autenticação**
   - [ ] Configurar NextAuth.js
   - [ ] Setup Google OAuth 2.0 (Client ID e Secret)
   - [ ] Criar página de login (`/login`)
   - [ ] Implementar proteção de rotas
   - [ ] Criar layout base com header (logo, nome usuário, logout)

3. **Google Drive - Conexão Básica**
   - [ ] Configurar Google Drive API credentials
   - [ ] Implementar `StorageProvider` interface
   - [ ] Criar `GoogleDriveStorage` class
   - [ ] Testar leitura/escrita básica de arquivos
   - [ ] Implementar error handling para API do Drive

#### Entregáveis
- Aplicação com login Google funcional
- Usuário consegue fazer login e ver seu nome
- Conexão com Drive estabelecida (validada nos logs)

---

### Sprint 1.2: Editor Básico de Markdown
**Duração**: 3-4 dias

#### Objetivos
- Editor de Markdown funcional
- Leitura e escrita de arquivos do Drive
- Interface básica de navegação

#### Tarefas
1. **Interface de Navegação**
   - [ ] Criar sidebar com lista de arquivos do Drive
   - [ ] Implementar navegação de pastas
   - [ ] Adicionar filtro por tipo de arquivo (.md)
   - [ ] Estado de "arquivo selecionado"
   - [ ] Loading states para operações

2. **Editor de Markdown**
   - [ ] Integrar Monaco Editor ou CodeMirror
   - [ ] Configurar syntax highlighting para Markdown
   - [ ] Implementar auto-save (debounced após 2s de inatividade)
   - [ ] Botão manual "Salvar"
   - [ ] Indicador de "salvando..." / "salvo"
   - [ ] Preview de Markdown (opcional para MVP)

3. **Operações CRUD Básicas**
   - [ ] Criar novo arquivo
   - [ ] Abrir arquivo existente
   - [ ] Salvar alterações
   - [ ] Deletar arquivo (com confirmação)
   - [ ] Renomear arquivo

#### Entregáveis
- Editor funcional que lê/escreve no Google Drive
- Usuário consegue navegar, criar, editar e salvar arquivos .md

---

## FASE 2: Inteligência de Contexto (Semana 3-4)

### Sprint 2.1: Sistema de Metadata
**Duração**: 4-5 dias

#### Objetivos
- Parser de Markdown para extração de metadata
- Sistema de arquivos .meta.json
- Índice de contexto em memória

#### Tarefas
1. **Estruturas de Dados**
   - [ ] Definir interfaces TypeScript para metadata:
     - `NPCMetadata`
     - `SessionMetadata`
     - `LocationMetadata`
     - `ItemMetadata`
     - `GenericMetadata`
   - [ ] Criar tipo union `DocumentMetadata`
   - [ ] Definir estrutura do índice de contexto

2. **Parser de Markdown**
   - [ ] Criar `MarkdownParser` class
   - [ ] Implementar extração de título (# heading)
   - [ ] Implementar extração de campos `**Campo:** Valor`
   - [ ] Implementar detecção de seções (## Headers)
   - [ ] Implementar extração de listas
   - [ ] Implementar extração de blockquotes (segredos)
   - [ ] Criar heurísticas para detectar tipo de documento

3. **Sistema de Metadata**
   - [ ] Criar `MetadataExtractor` class
   - [ ] Implementar extração automática via regex/AST
   - [ ] Gerar arquivos `.meta.json` no Drive
   - [ ] Implementar cache de metadata em memória
   - [ ] Sistema de atualização incremental (detect changes)

4. **Gerenciamento de Arquivos Ocultos**
   - [ ] Função para listar apenas .md (esconder .meta.json da UI)
   - [ ] Função para sincronizar .md ↔ .meta.json
   - [ ] Limpeza de .meta.json órfãos

#### Entregáveis
- Sistema que extrai metadata automaticamente ao salvar
- Arquivos .meta.json criados e ocultos do usuário
- Índice de contexto funcional em memória

---

### Sprint 2.2: Context Builder
**Duração**: 3-4 dias

#### Objetivos
- Sistema de busca e filtro de metadata
- Construtor de contexto relevante para queries
- Grafo de relacionamentos

#### Tarefas
1. **Context Builder Class**
   - [ ] Criar `ContextBuilder` class
   - [ ] Implementar `loadFromDrive()` - carrega todos .meta.json
   - [ ] Implementar `findByType(type)` - busca por tipo de documento
   - [ ] Implementar `findByTags(tags)` - busca por tags
   - [ ] Implementar `findByLocation(location)` - busca por localização
   - [ ] Implementar `searchText(query)` - busca textual simples

2. **Sistema de Relacionamentos**
   - [ ] Criar `RelationshipGraph` class
   - [ ] Extrair relacionamentos de metadata
   - [ ] Construir grafo bidirecional
   - [ ] Implementar query `findRelated(entityName)`
   - [ ] Visualização textual do grafo (para debug)

3. **Contexto Inteligente**
   - [ ] Implementar `buildContextForQuery(userQuery)`
   - [ ] Detectar entidades mencionadas na query
   - [ ] Carregar documentos relacionados
   - [ ] Priorizar documentos recentes
   - [ ] Limitar contexto a ~10k tokens (para Claude)
   - [ ] Formatar contexto de forma legível para IA

4. **Otimizações**
   - [ ] Cache de queries frequentes
   - [ ] Lazy loading de markdown completo
   - [ ] Invalidação de cache ao salvar

#### Entregáveis
- Sistema de busca contextual funcional
- Contexto relevante gerado para queries
- Performance adequada (< 1s para queries simples)

---

## FASE 3: Agente Criativo (Semana 5-6)

### Sprint 3.1: Integração com Claude API
**Duração**: 3-4 dias

#### Objetivos
- Chat funcional com Claude
- Envio de contexto estruturado
- Interface de chat na UI

#### Tarefas
1. **API Routes para Claude**
   - [ ] Criar `/api/chat` endpoint
   - [ ] Implementar rate limiting básico
   - [ ] Configurar Anthropic API key
   - [ ] Error handling e retries
   - [ ] Logging de requests (para debug)

2. **Chat Service**
   - [ ] Criar `ClaudeService` class
   - [ ] Implementar `sendMessage(message, context)`
   - [ ] Implementar streaming de respostas (opcional)
   - [ ] Gerenciar histórico de conversa (últimas 10 msgs)
   - [ ] Formatar contexto para Claude

3. **UI de Chat**
   - [ ] Criar sidebar de chat (colapsável em mobile)
   - [ ] Componente de mensagem (user/assistant)
   - [ ] Input de texto com envio (Enter)
   - [ ] Loading indicator
   - [ ] Display de erros
   - [ ] Auto-scroll para última mensagem
   - [ ] Botão "Nova conversa"

4. **Sistema de Prompts**
   - [ ] Criar `PromptBuilder` class
   - [ ] Definir system prompt base para D20 Studio
   - [ ] Templates de prompts para ações comuns:
     - Gerar NPC
     - Resumir sessão
     - Sugerir plots
     - Expandir descrição
   - [ ] Injeção de contexto no prompt

#### Entregáveis
- Chat funcional com Claude
- Usuário consegue fazer perguntas e receber respostas
- Contexto da campanha é enviado automaticamente

---

### Sprint 3.2: Agente de Edição
**Duração**: 4-5 dias

#### Objetivos
- IA capaz de editar arquivos diretamente
- Comandos de criação e atualização
- Feedback visual de edições

#### Tarefas
1. **Sistema de Comandos**
   - [ ] Detectar intenção de edição em mensagens:
     - "cria", "adiciona", "atualiza", "remove"
   - [ ] Parser de comandos estruturados
   - [ ] Validação de permissões (confirmar antes de editar)

2. **Operações de Edição**
   - [ ] `createDocument(type, name, content)` - criar novo arquivo
   - [ ] `updateDocument(fileId, content)` - substituir conteúdo
   - [ ] `appendToDocument(fileId, section, content)` - adicionar em seção
   - [ ] `updateMetadata(fileId, metadata)` - atualizar campos específicos

3. **Prompts Especializados**
   - [ ] Prompt para gerar NPC completo
   - [ ] Prompt para gerar descrição de local
   - [ ] Prompt para gerar item mágico
   - [ ] Prompt para resumir sessão
   - [ ] Prompt para extrair metadata de texto livre

4. **Feedback e Confirmação**
   - [ ] Preview de mudanças antes de aplicar
   - [ ] Opção "Aceitar" / "Rejeitar"
   - [ ] Histórico de edições (últimas 5)
   - [ ] Função "Desfazer última edição"
   - [ ] Notificação visual quando arquivo é editado

5. **Templates de Documentos**
   - [ ] Template de NPC
   - [ ] Template de Sessão
   - [ ] Template de Local
   - [ ] Template de Item
   - [ ] Template de Facção

#### Entregáveis
- IA consegue criar e editar arquivos via chat
- Usuário vê mudanças em tempo real no editor
- Sistema de confirmação funcional

---

## FASE 4: Polimento do MVP (Semana 7)

### Sprint 4.1: UX e Performance
**Duração**: 3-4 dias

#### Objetivos
- Interface polida e responsiva
- Performance otimizada
- Tratamento de erros completo

#### Tarefas
1. **Refinamento de UI**
   - [ ] Design system consistente (cores, espaçamentos)
   - [ ] Animações suaves (transições, loading states)
   - [ ] Responsividade mobile (chat como bottom sheet)
   - [ ] Dark mode (padrão) e light mode
   - [ ] Atalhos de teclado:
     - `Ctrl+S` - Salvar
     - `Ctrl+K` - Focar chat
     - `Ctrl+N` - Novo arquivo
     - `Esc` - Fechar modais

2. **Performance**
   - [ ] Lazy loading de arquivos grandes
   - [ ] Debouncing de auto-save
   - [ ] Memoização de componentes React
   - [ ] Code splitting de rotas
   - [ ] Compressão de assets
   - [ ] Otimização de re-renders

3. **Error Handling**
   - [ ] Tratamento de erros de rede
   - [ ] Fallback para Drive offline
   - [ ] Mensagens de erro user-friendly
   - [ ] Retry automático em falhas temporárias
   - [ ] Estado de erro do aplicativo

4. **Feedback ao Usuário**
   - [ ] Toasts para ações (salvou, erro, etc)
   - [ ] Progress bars para operações longas
   - [ ] Estados vazios (sem arquivos, sem campanha)
   - [ ] Onboarding básico (primeiro acesso)

#### Entregáveis
- Interface polida e profissional
- Performance adequada (< 2s para carregar)
- Erros tratados graciosamente

---

### Sprint 4.2: Testes e Documentação
**Duração**: 2-3 dias

#### Objetivos
- Testes básicos implementados
- Documentação para usuários
- Preparação para beta

#### Tarefas
1. **Testes**
   - [ ] Testes unitários para parsers
   - [ ] Testes de integração para Google Drive
   - [ ] Testes E2E para fluxos principais:
     - Login → Criar arquivo → Editar → Salvar
     - Chat com IA → Criar NPC
   - [ ] Teste de carregamento (10, 50, 100 arquivos)

2. **Documentação**
   - [ ] README.md do projeto
   - [ ] Guia de instalação/setup
   - [ ] Documentação de arquitetura
   - [ ] Guia do usuário (como usar o app)
   - [ ] FAQ básico
   - [ ] Changelog

3. **Preparação Beta**
   - [ ] Configurar analytics (Vercel Analytics)
   - [ ] Configurar error tracking (Sentry)
   - [ ] Criar formulário de feedback
   - [ ] Setup de ambiente de staging
   - [ ] Checklist de deploy

#### Entregáveis
- Suite de testes básica funcionando
- Documentação completa
- App pronto para beta testers

---

## 🚀 Pós-MVP - Roadmap Futuro

## FASE 5: Agente de Voz (Fase 2 - Mês 3-4)

### Sprint 5.1: Transcrição de Sessões
**Duração**: 1 semana

#### Objetivos
- Gravar e transcrever sessões de RPG
- Extrair informações importantes automaticamente

#### Tarefas
1. **Gravação de Áudio**
   - [ ] Integrar Web Audio API
   - [ ] Botão "Gravar Sessão"
   - [ ] Upload de arquivo de áudio
   - [ ] Suporte a arquivos grandes (chunked upload)

2. **Transcrição**
   - [ ] Integração com Whisper API (OpenAI)
   - [ ] Ou alternativa: Deepgram, AssemblyAI
   - [ ] Processamento em chunks
   - [ ] Display de progresso

3. **Extração de Informações**
   - [ ] Prompt especializado para análise de transcrição
   - [ ] Detectar momentos-chave:
     - Encontros com NPCs
     - Descobertas de itens
     - Decisões importantes
     - Revelações de plot
   - [ ] Gerar resumo automático
   - [ ] Atualizar arquivos relevantes (NPCs, sessão)

4. **UI de Transcrição**
   - [ ] Visualizador de transcrição com timestamps
   - [ ] Highlights de momentos importantes
   - [ ] Edição manual da transcrição
   - [ ] Export para arquivo de sessão

#### Entregáveis
- Funcionalidade de gravação e transcrição
- Extração automática de informações
- Geração de resumo de sessão

---

### Sprint 5.2: Comandos de Voz em Tempo Real
**Duração**: 1-2 semanas

#### Objetivos
- Reconhecimento de fala em tempo real
- Comandos de voz para a IA
- "Segunda tela" para mestres

#### Tarefas
1. **Reconhecimento de Voz**
   - [ ] Integração com Web Speech API ou Whisper Streaming
   - [ ] Ativação por palavra-chave ("Ok, D20")
   - [ ] Detecção de comandos específicos

2. **Comandos Contextuais**
   - [ ] "Mostre a ficha de [NPC]"
   - [ ] "Qual o modificador de [skill]?"
   - [ ] "Como funciona [magia/habilidade]?"
   - [ ] "Anote que [informação]"

3. **Segunda Tela (Tablet/Mobile)**
   - [ ] App mobile ou PWA
   - [ ] Display automático de informações relevantes
   - [ ] Fichas de NPCs
   - [ ] Regras rápidas
   - [ ] Notas do mestre

4. **Modo Sessão Ativa**
   - [ ] Interface especial para durante a sessão
   - [ ] Mínimo de cliques
   - [ ] Acesso rápido a recursos
   - [ ] Timer de sessão
   - [ ] Notas rápidas

#### Entregáveis
- Comandos de voz funcionais
- Segunda tela para tablets
- Modo de sessão ativa

---

## FASE 6: Features Avançadas (Fase 3 - Mês 5-6)

### Sprint 6.1: Visualizações e Insights
**Duração**: 1-2 semanas

#### Objetivos
- Dashboard de campanha
- Visualizações de dados
- Análises e sugestões

#### Tarefas
1. **Dashboard**
   - [ ] Visão geral da campanha
   - [ ] Estatísticas: # sessões, NPCs, locais, itens
   - [ ] Timeline visual
   - [ ] Grafo de relacionamentos interativo
   - [ ] Plots abertos vs resolvidos

2. **Visualizações**
   - [ ] Mapa da campanha (integração com imagens)
   - [ ] Linha do tempo de eventos
   - [ ] Rede de relacionamentos (D3.js ou similar)
   - [ ] Gráficos de progresso

3. **IA Analítica**
   - [ ] Análise de padrões de jogadores
   - [ ] Sugestões de conteúdo baseado em preferências
   - [ ] Detecção de plots esquecidos
   - [ ] Alertas de inconsistências narrativas

4. **Gerador de Sessão**
   - [ ] Input: duração, dificuldade, foco (combate/roleplay)
   - [ ] IA gera estrutura completa de sessão
   - [ ] Baseado em contexto da campanha
   - [ ] Exporta como template editável

#### Entregáveis
- Dashboard funcional
- Visualizações interativas
- IA analítica básica

---

### Sprint 6.2: Colaboração e Compartilhamento
**Duração**: 1-2 semanas

#### Objetivos
- Compartilhar campanhas com outros mestres
- Co-mestria
- Biblioteca de recursos

#### Tarefas
1. **Sistema de Permissões**
   - [ ] Compartilhar campanha (read-only ou edit)
   - [ ] Convites via email
   - [ ] Gerenciamento de acessos

2. **Co-Mestria**
   - [ ] Edição colaborativa (real-time ou assíncrona)
   - [ ] Comentários em documentos
   - [ ] Histórico de versões (Git-like)

3. **Biblioteca Comunitária**
   - [ ] Publicar NPCs, plots, locais para comunidade
   - [ ] Buscar e importar recursos de outros mestres
   - [ ] Sistema de ratings e comentários
   - [ ] Templates de campanha

4. **Export/Import**
   - [ ] Export completo da campanha (ZIP)
   - [ ] Import de outras ferramentas (JSON, XML)
   - [ ] Backup automático

#### Entregáveis
- Sistema de compartilhamento funcional
- Biblioteca comunitária básica
- Export/Import robusto

---

## FASE 7: Storage Próprio (Opcional - Mês 7+)

### Sprint 7.1: Backend e Database
**Duração**: 2-3 semanas

#### Objetivos
- Storage próprio como alternativa ao Drive
- CRUDs estruturados
- Migração do Drive

#### Tarefas
1. **Infraestrutura**
   - [ ] Setup PostgreSQL (Supabase ou Railway)
   - [ ] Setup S3 ou similar para arquivos grandes
   - [ ] Migrations system
   - [ ] Backup automático

2. **Schema de Banco**
   - [ ] Tabelas: users, campaigns, documents, metadata, relationships
   - [ ] Índices otimizados
   - [ ] Full-text search

3. **API Backend**
   - [ ] Implementar `AppStorage` (implementação de StorageProvider)
   - [ ] CRUD endpoints
   - [ ] Sistema de autenticação próprio
   - [ ] Rate limiting

4. **Migração**
   - [ ] Ferramenta de migração Drive → App
   - [ ] Manter sincronização bidirecional (opcional)
   - [ ] UI de escolha de storage provider

#### Entregáveis
- Backend funcional
- Storage próprio como opção
- Migração do Drive funcional

---

### Sprint 7.2: Features Exclusivas do Storage Próprio
**Duração**: 1-2 semanas

#### Objetivos
- Aproveitar vantagens do DB estruturado
- Features que só são possíveis com backend próprio

#### Tarefas
1. **Busca Avançada**
   - [ ] Full-text search em todos documentos
   - [ ] Filtros complexos (AND, OR, NOT)
   - [ ] Busca por similaridade semântica

2. **Relacionamentos Visuais**
   - [ ] Editor de grafo interativo
   - [ ] Arraste e solte para criar relações
   - [ ] Visualização de clusters

3. **Automações**
   - [ ] Triggers (ex: quando NPC morre, notifica campanhas relacionadas)
   - [ ] Webhooks
   - [ ] Integrações (Discord, Slack)

4. **Analytics Avançado**
   - [ ] Métricas de uso
   - [ ] Heatmaps de atividade
   - [ ] Recomendações personalizadas

#### Entregáveis
- Features avançadas funcionais
- Valor claro para storage próprio
- Documentação de migração

---

## FASE 8: MCP e Vector Store (Longo Prazo - Mês 8+)

### Sprint 8.1: Vector Database Integration
**Duração**: 2-3 semanas

#### Objetivos
- Busca semântica avançada
- Contexto ultra relevante para IA
- Escalabilidade para milhares de documentos

#### Tarefas
1. **Setup Vector Store**
   - [ ] Escolher provider (Pinecone, Weaviate, ou Supabase pgvector)
   - [ ] Setup e configuração
   - [ ] Definir schema de embeddings

2. **Geração de Embeddings**
   - [ ] Integrar OpenAI Embeddings ou similar
   - [ ] Pipeline de processamento:
     - Markdown → chunks → embeddings → vector store
   - [ ] Sync automático ao salvar documentos
   - [ ] Re-indexação em background

3. **Busca Semântica**
   - [ ] Implementar similarity search
   - [ ] Hybrid search (keyword + semântica)
   - [ ] Ranking de resultados
   - [ ] Contexto dinâmico baseado em relevância

4. **Otimizações**
   - [ ] Cache de embeddings
   - [ ] Batch processing
   - [ ] Monitoramento de custos

#### Entregáveis
- Vector store integrado
- Busca semântica funcional
- Performance adequada

---

### Sprint 8.2: MCP Server Implementation
**Duração**: 2-3 semanas

#### Objetivos
- Claude acessa dados via MCP
- Protocolo padronizado
- Extensibilidade

#### Tarefas
1. **MCP Server**
   - [ ] Implementar MCP server spec
   - [ ] Definir tools/resources disponíveis:
     - `search_documents`
     - `get_document`
     - `list_campaigns`
     - `get_relationships`
   - [ ] Authentication e permissions

2. **Integração com Claude**
   - [ ] Configurar MCP client
   - [ ] Registrar tools no Claude
   - [ ] Testar chamadas de tool

3. **Advanced Tools**
   - [ ] `analyze_campaign` - análise profunda
   - [ ] `suggest_content` - sugestões contextuais
   - [ ] `find_inconsistencies` - detectar problemas
   - [ ] `generate_timeline` - gerar linha do tempo automática

4. **Monitoramento**
   - [ ] Logging de tool calls
   - [ ] Métricas de performance
   - [ ] Debug tools

#### Entregáveis
- MCP server funcional
- Claude usando tools via MCP
- Documentação completa do protocolo

---

## 📊 Estrutura de Diretórios do Projeto

```
d20-studio/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Dashboard principal
│   │   │   └── editor/
│   │   │       └── [fileId]/
│   │   │           └── page.tsx      # Editor de arquivo
│   │   └── api/
│   │       ├── auth/                 # NextAuth routes
│   │       ├── drive/                # Google Drive operations
│   │       ├── chat/                 # Claude chat
│   │       └── metadata/             # Metadata operations
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── editor/
│   │   │   ├── MarkdownEditor.tsx
│   │   │   ├── FileSidebar.tsx
│   │   │   └── Toolbar.tsx
│   │   ├── chat/
│   │   │   ├── ChatSidebar.tsx
│   │   │   ├── Message.tsx
│   │   │   └── ChatInput.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Layout.tsx
│   │
│   ├── lib/
│   │   ├── storage/
│   │   │   ├── StorageProvider.ts    # Interface
│   │   │   ├── GoogleDriveStorage.ts # Implementação Drive
│   │   │   └── MockStorage.ts        # Para testes
│   │   ├── ai/
│   │   │   ├── ClaudeService.ts
│   │   │   ├── PromptBuilder.ts
│   │   │   └── prompts/              # Templates de prompts
│   │   ├── metadata/
│   │   │   ├── MetadataExtractor.ts
│   │   │   ├── MarkdownParser.ts
│   │   │   └── types.ts              # Interfaces de metadata
│   │   ├── context/
│   │   │   ├── ContextBuilder.ts
│   │   │   └── RelationshipGraph.ts
│   │   └── utils/
│   │       ├── markdown.ts
│   │       └── file.ts
│   │
│   ├── store/                        # Zustand stores
│   │   ├── useAuthStore.ts
│   │   ├── useEditorStore.ts
│   │   └── useChatStore.ts
│   │
│   └── types/
│       ├── storage.ts
│       ├── metadata.ts
│       └── chat.ts
│
├── public/
│   ├── images/
│   └── icons/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── architecture.md
│   ├── user-guide.md
│   └── api.md
│
├── .env.example
├── .env.local                        # Git-ignored
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 📋 Convenções de Código

### TypeScript
- Usar strict mode
- Preferir interfaces a types para objetos
- Usar tipos explícitos em funções públicas
- Evitar `any`, usar `unknown` quando necessário

### React
- Functional components sempre
- Hooks customizados para lógica reutilizável
- Props desconstruídas com tipos explícitos
- Usar `memo` apenas quando necessário (performance)

### Naming
- Componentes: PascalCase (`MarkdownEditor`)
- Funções/variáveis: camelCase (`parseMarkdown`)
- Constantes: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- Arquivos: kebab-case para utils, PascalCase para componentes

### Organização
- Um componente por arquivo
- Exportar apenas o necessário
- Barrel exports (`index.ts`) para modules
- Co-locate testes com código (`Component.tsx` + `Component.test.tsx`)

---

## 🔒 Variáveis de Ambiente

```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Google Drive
GOOGLE_DRIVE_API_KEY=your-api-key

# Anthropic
ANTHROPIC_API_KEY=your-api-key

# Analytics (opcional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id

# Error Tracking (opcional)
SENTRY_DSN=your-sentry-dsn
```

---

## 🧪 Estratégia de Testes

### Unitários (Jest + React Testing Library)
- Parsers de Markdown
- Extratores de metadata
- Builders de contexto
- Utilitários puros

### Integração (Jest)
- Google Drive operations
- Claude API calls
- Fluxo completo: parse → extract → contextualize

### E2E (Playwright ou Cypress)
- Fluxo de autenticação
- Criar/editar/salvar arquivo
- Chat com IA
- Criar documento via IA

### Coverage Target
- Unitários: 80%+
- Integração: 60%+
- E2E: Fluxos críticos cobertos

---

## 🚀 Deploy e CI/CD

### Ambientes
- **Development**: Local (`localhost:3000`)
- **Staging**: Vercel preview deployments
- **Production**: Vercel production

### Pipeline CI/CD
1. **Pull Request**
   - Run linters (ESLint, Prettier)
   - Run type check (TypeScript)
   - Run unit tests
   - Build check

2. **Merge to Main**
   - Deploy to staging
   - Run integration tests
   - Manual QA
   - Deploy to production (manual trigger)

### Monitoramento
- **Vercel Analytics**: Performance, Core Web Vitals
- **Sentry** (opcional): Error tracking
- **LogRocket** (opcional): Session replay

---

## 📈 Métricas de Sucesso (MVP)

### Técnicas
- [ ] Page load < 2s (FCP)
- [ ] Time to Interactive < 3s (TTI)
- [ ] Editor responsivo (< 100ms input lag)
- [ ] API calls bem-sucedidos > 99%
- [ ] Zero crashes no beta

### Produto
- [ ] 10 beta testers completam onboarding
- [ ] Cada tester cria pelo menos 1 campanha
- [ ] Pelo menos 5 sessões criadas no total
- [ ] NPS > 7 (muito bom para MVP)
- [ ] Feedback qualitativo positivo sobre IA

### Negócio
- [ ] Custo de API Claude < $50/mês (beta)
- [ ] Tempo médio de sessão > 15min
- [ ] Retenção D7 > 50%
- [ ] Feature request top 3 identificadas

---

## 🎯 Critérios de Lançamento do MVP

### Must Have (Blocker)
- [x] Autenticação funcional
- [x] Editor de Markdown
- [x] Salvar no Google Drive
- [x] Chat com IA
- [x] Contexto básico funcionando
- [x] IA consegue criar documentos
- [x] Mobile responsivo

### Should Have (Importante)
- [x] Auto-save
- [x] Extração de metadata automática
- [x] Templates de documentos
- [x] Error handling robusto
- [x] Loading states

### Nice to Have (Pode ficar pós-MVP)
- [ ] Preview de Markdown
- [ ] Atalhos de teclado avançados
- [ ] Dark/Light mode toggle
- [ ] Export completo
- [ ] Histórico de versões

---

## 📞 Suporte e Feedback

### Durante Beta
- **Email**: beta@d20studio.app
- **Discord**: Servidor privado para beta testers
- **Formulário**: Integrado no app (botão feedback)

### Canais de Comunicação
- GitHub Issues: Bugs e feature requests
- GitHub Discussions: Perguntas e ideias
- Discord: Suporte em tempo real

---

## 📚 Recursos e Referências

### Documentação Técnica
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Google Drive API](https://developers.google.com/drive/api/guides/about-sdk)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Design Inspiration
- Notion (editor experience)
- Linear (UI/UX polish)
- Obsidian (Markdown + graph view)
- World Anvil (RPG organization)

### Comunidades
- r/rpg
- r/DMAcademy
- Discord: D&D, Pathfinder, etc

---

## 🔄 Processo de Revisão

### Code Review
- Todo PR precisa de 1 aprovação
- Checklist:
  - [ ] Código segue convenções
  - [ ] Testes passam
  - [ ] Sem warnings de TypeScript
  - [ ] Performance adequada
  - [ ] Documentação atualizada (se necessário)

### Sprint Review
- Toda sexta-feira
- Demo de features completadas
- Retrospectiva: o que funcionou, o que melhorar
- Planejamento da próxima sprint

---

## 🎨 Identidade Visual

### Cores Principais
- **Primary**: Purple 600 (#9333EA) → IA, magia, criatividade
- **Secondary**: Pink 600 (#DB2777) → Energia, diversão
- **Accent**: Cyan 500 (#06B6D4) → Confiança, tecnologia
- **Neutral**: Slate 950-100 → Base, texto

### Tipografia
- **Headings**: Inter (bold, clean)
- **Body**: Inter (regular)
- **Code/Editor**: JetBrains Mono (monospace)

### Iconografia
- Lucide React (consistente, leve)
- Ícone do app: D20 estilizado (roxo/rosa gradient)

---

## ⚠️ Riscos e Mitigações

### Riscos Técnicos
| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Google Drive API limits | Alto | Médio | Rate limiting, cache agressivo |
| Claude API custos altos | Alto | Médio | Limitar contexto, usar cache |
| Performance com muitos arquivos | Médio | Alto | Lazy loading, pagination |
| Extração de metadata imprecisa | Médio | Médio | Refinamento iterativo de prompts |

### Riscos de Produto
| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Usuários não entendem valor da IA | Alto | Baixo | Onboarding claro, exemplos |
| Preferem ferramentas existentes | Alto | Médio | Foco em diferencial (IA contextual) |
| Curva de aprendizado alta | Médio | Baixo | UI intuitiva, templates prontos |

---

## 📅 Timeline Resumido

```
Semana 1-2:  Setup + Auth + Editor Básico
Semana 3-4:  Metadata + Context Builder
Semana 5-6:  Claude Integration + Agente Criativo
Semana 7:    Polimento + Testes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              🎉 MVP PRONTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mês 3-4:     Agente de Voz
Mês 5-6:     Features Avançadas
Mês 7+:      Storage Próprio (opcional)
Mês 8+:      MCP + Vector Store (opcional)
```

---

## ✅ Checklist Final do MVP

### Funcionalidades
- [ ] Login com Google
- [ ] Listar arquivos do Drive
- [ ] Criar novo arquivo .md
- [ ] Editar arquivo existente
- [ ] Salvar no Drive (manual e auto-save)
- [ ] Deletar arquivo
- [ ] Chat com Claude
- [ ] IA cria documentos via chat
- [ ] IA edita documentos via chat
- [ ] Extração automática de metadata
- [ ] Contexto inteligente em queries
- [ ] Templates de NPC, Sessão, Local, Item

### Qualidade
- [ ] Zero crashes em testes
- [ ] Responsivo mobile/tablet/desktop
- [ ] Performance adequada (< 2s load)
- [ ] Erros tratados graciosamente
- [ ] Loading states em todas operações
- [ ] Feedback visual claro

### Documentação
- [ ] README completo
- [ ] Guia do usuário
- [ ] Setup instructions
- [ ] FAQ
- [ ] Changelog

### Deploy
- [ ] Ambiente production configurado
- [ ] Analytics rodando
- [ ] Error tracking configurado
- [ ] Backup strategy definida
- [ ] Rollback plan documentado

---

## 🎓 Lições Aprendidas (a serem preenchidas pós-MVP)

### O que funcionou bem
- _A ser preenchido após beta_

### O que pode melhorar
- _A ser preenchido após beta_

### Próximos passos
- _A ser preenchido após beta_

---

**Versão do Documento**: 1.0  
**Última Atualização**: 21/01/2026  
**Autor**: Documentação gerada para D20 Studio  
**Status**: 📋 Planejamento Completo - Pronto para Implementação