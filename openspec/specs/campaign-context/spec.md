# campaign-context Specification

## Purpose

Selecionar e apresentar informações de documentos da campanha como contexto textual para perguntas, a partir de metadata previamente extraída.

## Requirements

### Requirement: Metadata filtering and search
The system SHALL permitir consultar um conjunto carregado de metadata por tipo, por qualquer tag solicitada ou por texto em título, resumo, tags e seções.

#### Scenario: Filtrar por tipo
- **WHEN** o consumidor solicita documentos de um tipo
- **THEN** o resultado contém somente documentos desse tipo presentes no conjunto carregado

#### Scenario: Filtrar por tags
- **WHEN** o consumidor informa tags de consulta
- **THEN** o resultado contém documentos com pelo menos uma dessas tags normalizadas

#### Scenario: Buscar trecho textual
- **WHEN** o consumidor pesquisa um trecho presente no título ou resumo de um documento
- **THEN** esse documento aparece nos resultados independentemente da capitalização do trecho

### Requirement: Query-oriented context
The system SHALL ordenar os documentos por correspondência textual com os termos da pergunta e compor um contexto com títulos e informações disponíveis desses documentos.

#### Scenario: Ordenar por correspondência
- **WHEN** documentos possuem quantidades diferentes de correspondências com termos da pergunta
- **THEN** o documento com maior correspondência é considerado primeiro para inclusão no contexto

#### Scenario: Índice vazio
- **WHEN** o consumidor solicita contexto sem metadata carregada
- **THEN** o resultado é uma string vazia

### Requirement: Bounded document inclusion
The system SHALL usar um orçamento aproximado de caracteres para limitar o contexto, com padrão de 8.000 caracteres.

#### Scenario: Próximo bloco não cabe
- **WHEN** um bloco de documento ultrapassaria o orçamento configurado no momento da seleção
- **THEN** esse bloco fica fora do contexto

#### Scenario: Informações formatadas
- **WHEN** um documento é incluído no contexto
- **THEN** seu bloco contém título e tipo, além de resumo, tags, campos e trechos de seções quando disponíveis
