# AI Chat Spec Delta

## Purpose

Oferecer uma API autenticada de assistência textual ao mestre, usando perguntas, histórico informado e metadata disponível da campanha como contexto.

## ADDED Requirements

### Requirement: Text conversation API
The system SHALL aceitar perguntas textuais em `/api/chat` e retornar uma resposta textual do assistente quando autenticação, configuração e serviços externos estiverem disponíveis.

#### Scenario: Pergunta válida
- **WHEN** um usuário autenticado envia uma mensagem textual não vazia e o provedor conclui a solicitação
- **THEN** a API retorna JSON com a resposta textual no campo `reply`

#### Scenario: Pergunta ausente ou em branco
- **WHEN** a requisição não informa mensagem ou informa uma string composta somente por espaços
- **THEN** o handler retorna HTTP 400

### Requirement: Campaign context in conversation
The system SHALL construir contexto a partir da metadata disponível na pasta solicitada e incorporá-lo às instruções do assistente.

#### Scenario: Pergunta com metadata disponível
- **WHEN** a requisição informa uma pasta com metadata acessível
- **THEN** o sistema seleciona contexto dessa metadata para acompanhar a pergunta enviada ao provedor

#### Scenario: Sem metadata disponível
- **WHEN** não há metadata disponível para compor contexto
- **THEN** o sistema envia a pergunta usando as instruções básicas do assistente

### Requirement: Caller-provided conversation history
The system SHALL encaminhar o histórico de mensagens informado pelo consumidor antes da pergunta atual, usando um histórico vazio quando omitido.

#### Scenario: Continuação de conversa
- **WHEN** uma requisição válida inclui mensagens anteriores com papéis de usuário e assistente
- **THEN** o provedor recebe essas mensagens antes da mensagem atual

### Requirement: Conversation failure response
The system SHALL retornar um erro JSON quando uma falha for capturada durante o processamento da conversa.

#### Scenario: Falha do provedor durante processamento
- **WHEN** o provedor lança um erro dentro do processamento protegido pelo handler
- **THEN** a API retorna HTTP 500 com um campo `error`
