# Authentication Spec Delta

## Purpose

Permitir que o usuário entre com sua conta Google e acesse documentos e operações da aplicação mediante uma sessão autenticada.

## ADDED Requirements

### Requirement: Google sign-in
The system SHALL oferecer login Google em `/login`, solicitando identidade, perfil, email e acesso ao Google Drive.

#### Scenario: Iniciar autenticação
- **WHEN** o usuário escolhe continuar com Google na página de login
- **THEN** o sistema inicia o fluxo OAuth Google com os escopos de identidade e Drive configurados

### Requirement: Authenticated session
The system SHALL disponibilizar a identidade do usuário e o access token recebido do Google na sessão autenticada.

#### Scenario: Sessão após autorização
- **WHEN** o Google conclui uma autorização válida
- **THEN** a sessão disponibiliza os dados do usuário e o access token para operações autenticadas

### Requirement: Protected access
The system SHALL proteger as páginas do dashboard e exigir uma sessão com access token nos handlers das APIs de Drive, metadata e chat.

#### Scenario: Página protegida sem sessão
- **WHEN** um visitante sem sessão solicita uma página do dashboard
- **THEN** o sistema encaminha o visitante ao login

#### Scenario: Handler sem access token
- **WHEN** um handler de Drive, metadata ou chat recebe uma requisição cuja sessão não contém access token
- **THEN** o handler retorna HTTP 401 sem executar a operação solicitada

### Requirement: Sign-out
The system SHALL permitir encerrar a sessão pelo menu do usuário.

#### Scenario: Encerrar sessão
- **WHEN** o usuário escolhe Log Out
- **THEN** o sistema encerra a sessão e encaminha o usuário para `/login`
