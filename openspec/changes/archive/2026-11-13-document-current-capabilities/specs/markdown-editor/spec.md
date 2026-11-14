# Markdown Editor Spec Delta

## Purpose

Permitir que o usuário navegue por pastas e edite documentos Markdown do Drive com salvamento manual, automático e indicação de resultado.

## ADDED Requirements

### Requirement: File and folder navigation
The system SHALL oferecer uma sidebar com documentos e pastas, navegação por breadcrumb e seleção de documento para edição.

#### Scenario: Entrar e voltar em pastas
- **WHEN** o usuário abre uma pasta e depois seleciona um ancestral no breadcrumb
- **THEN** a sidebar consulta e apresenta o conteúdo da pasta correspondente a cada seleção

#### Scenario: Abrir documento
- **WHEN** o usuário seleciona um documento acessível
- **THEN** o editor carrega e apresenta o conteúdo desse documento

### Requirement: Markdown editing
The system SHALL permitir editar o texto Markdown do documento selecionado, com destaque de sintaxe e suporte aos temas claro e escuro.

#### Scenario: Editar texto
- **WHEN** o usuário altera o texto de um documento carregado
- **THEN** o editor apresenta o texto alterado com destaque de sintaxe Markdown

### Requirement: Manual and automatic saving
The system SHALL salvar alterações pelo botão Save, pelo atalho Ctrl+S ou Cmd+S e automaticamente após dois segundos sem nova edição.

#### Scenario: Salvamento manual
- **WHEN** o usuário aciona Save ou o atalho com conteúdo alterado
- **THEN** o sistema envia o conteúdo para o documento selecionado

#### Scenario: Salvamento automático no mesmo documento
- **WHEN** o usuário altera o documento e permanece nele por dois segundos sem nova edição
- **THEN** o sistema envia o conteúdo alterado para salvamento

### Requirement: Editor feedback
The system SHALL apresentar carregamento ao abrir documentos e os resultados de salvamento em andamento, concluído ou com erro.

#### Scenario: Escrita concluída
- **WHEN** uma solicitação de salvamento termina com sucesso
- **THEN** o editor apresenta temporariamente a indicação Saved

#### Scenario: Escrita falhou
- **WHEN** uma solicitação de salvamento falha
- **THEN** o editor apresenta a indicação Save failed

#### Scenario: Nenhum documento selecionado
- **WHEN** o editor é aberto sem documento selecionado
- **THEN** o sistema orienta o usuário a selecionar ou criar um arquivo
