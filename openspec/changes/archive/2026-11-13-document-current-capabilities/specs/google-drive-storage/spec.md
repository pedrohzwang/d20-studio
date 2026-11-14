# Google Drive Storage Spec Delta

## Purpose

Permitir acesso aos documentos Markdown do usuário no Google Drive, preservando os arquivos em um formato portável sob sua conta.

## ADDED Requirements

### Requirement: Folder-scoped listing
The system SHALL listar os documentos não excluídos com MIME type `text/markdown` da pasta solicitada, usando a raiz quando nenhuma pasta for informada.

#### Scenario: Consultar documentos de uma pasta
- **WHEN** um usuário autenticado consulta `/api/drive/files` com `folderId`
- **THEN** a resposta contém a lista retornada pelo Drive para documentos Markdown diretamente nessa pasta, ordenada por nome

#### Scenario: Incluir pastas
- **WHEN** a consulta inclui `includeFolders=true`
- **THEN** a resposta também contém as subpastas diretamente na pasta consultada

### Requirement: Document creation and reading
The system SHALL permitir criar um documento com nome e conteúdo e recuperar o conteúdo textual de um documento por seu identificador.

#### Scenario: Criar documento sem extensão
- **WHEN** o usuário cria um documento com nome sem extensão e informa uma pasta
- **THEN** o sistema acrescenta `.md`, cria o documento na pasta informada e retorna seu identificador

#### Scenario: Nome vazio
- **WHEN** o usuário solicita criação com nome vazio ou composto apenas por espaços
- **THEN** o handler retorna HTTP 400 sem criar o documento

#### Scenario: Ler documento
- **WHEN** um usuário autenticado solicita um documento acessível por identificador
- **THEN** o sistema retorna seu conteúdo textual

### Requirement: Document updates
The system SHALL permitir substituir o conteúdo ou renomear um documento existente por seu identificador.

#### Scenario: Atualizar conteúdo
- **WHEN** o usuário envia conteúdo para um documento acessível e o Drive conclui a escrita
- **THEN** o sistema confirma o salvamento desse conteúdo

#### Scenario: Renomear documento
- **WHEN** o usuário informa um novo nome para um documento acessível e o Drive conclui a operação
- **THEN** o documento no Drive recebe o novo nome

### Requirement: Document deletion
The system SHALL permitir excluir um documento por seu identificador e exigir confirmação antes da exclusão pela sidebar.

#### Scenario: Cancelar exclusão
- **WHEN** o usuário cancela a confirmação de exclusão na sidebar
- **THEN** nenhuma requisição de exclusão é enviada

#### Scenario: Confirmar exclusão
- **WHEN** o usuário confirma a exclusão e o Drive conclui a operação
- **THEN** o documento é excluído do Drive e removido da lista da sidebar
