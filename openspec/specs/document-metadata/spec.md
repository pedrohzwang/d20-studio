# document-metadata Specification

## Purpose

Converter documentos Markdown em metadata estruturada para consulta e contexto de campanha, persistindo representações auxiliares no Drive.

## Requirements

### Requirement: Structured extraction
The system SHALL extrair identificação, título, campos, seções, tags e resumo de Markdown válido, considerando frontmatter e campos textuais reconhecidos.

#### Scenario: Documento estruturado
- **WHEN** a extração recebe Markdown válido com título, campos em negrito, seções e tags
- **THEN** o resultado contém a identificação do documento e as informações reconhecidas nesses elementos

#### Scenario: Documento sem heading
- **WHEN** o documento não contém heading reconhecido como título
- **THEN** o título extraído usa o nome do arquivo sem a extensão `.md`

### Requirement: Document classification
The system SHALL classificar documentos como NPC, sessão, local, item ou genérico, usando tipo explícito reconhecido no frontmatter ou heurísticas textuais.

#### Scenario: Tipo explícito
- **WHEN** o frontmatter contém um tipo reconhecido
- **THEN** a extração usa esse tipo e preenche os campos específicos reconhecidos

#### Scenario: Sem indícios de tipo
- **WHEN** não há tipo explícito reconhecido nem palavras indicativas de um tipo especializado
- **THEN** a extração classifica o documento como genérico

### Requirement: Metadata persistence
The system SHALL permitir extrair metadata por `/api/metadata` e persistir o resultado em um arquivo auxiliar denominado `<fileId>.meta.json` no Drive.

#### Scenario: Primeira extração
- **WHEN** uma requisição autenticada válida informa `fileId` e `filename`, o documento é legível e não existe arquivo auxiliar
- **THEN** o sistema extrai a metadata, cria seu arquivo auxiliar e retorna a metadata

#### Scenario: Atualizar metadata existente
- **WHEN** a extração encontra um arquivo auxiliar existente para o identificador informado
- **THEN** o sistema substitui seu conteúdo pela metadata extraída

#### Scenario: Identificação incompleta
- **WHEN** a requisição de extração não informa `fileId` ou `filename`
- **THEN** o handler retorna HTTP 400

### Requirement: Extraction after editor save
The system SHALL solicitar extração de metadata em segundo plano após um salvamento bem-sucedido de conteúdo alterado no editor.

#### Scenario: Solicitar extração
- **WHEN** o editor recebe sucesso ao salvar conteúdo alterado
- **THEN** envia uma requisição de extração com o identificador e nome do documento sem bloquear a edição

### Requirement: Folder-scoped metadata access
The system SHALL permitir consultar metadata persistida diretamente na pasta informada, usando a raiz quando nenhuma pasta for informada, e separar arquivos auxiliares da listagem Markdown.

#### Scenario: Consultar metadata de uma pasta
- **WHEN** uma requisição autenticada consulta metadata com `folderId` e os arquivos auxiliares são acessíveis e válidos
- **THEN** a resposta contém a metadata desses arquivos diretamente na pasta consultada

#### Scenario: Arquivos auxiliares na navegação
- **WHEN** a sidebar lista os documentos Markdown de uma pasta
- **THEN** os arquivos auxiliares criados como JSON não aparecem na lista de documentos Markdown
