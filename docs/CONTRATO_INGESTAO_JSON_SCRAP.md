# Contrato proposto — ingestão JSON de Material Scrap

Status: proposta para protótipo e alinhamento com backend  
Versão do contrato: `1.0-draft`  
Data: 19/08/2026

## 1. O que foi possível inferir

A automação atual não contém regras de negócio do scrap. Ela:

1. localiza todos os CSVs de uma pasta;
2. tenta detectar separador e codificação;
3. concatena colunas diferentes;
4. ignora silenciosamente linhas desalinhadas com `on_bad_lines="skip"`;
5. grava um novo CSV consolidado.

Portanto, o formato do JSON precisa ser definido como contrato. Os campos abaixo foram derivados da planilha, da aba `Analysis` e do adaptador atual `api-dashboard.js`.

## 2. Fluxo recomendado

```text
Robô de extração
  → POST /api/v1/scrap-ingestions
  → valida envelope, tamanho, versão e checksum
  → grava payload bruto em staging
  → publica ingestion_id na fila
  → responde HTTP 202
  → worker valida e normaliza registros
  → upsert idempotente no banco
  → publica novo snapshot do dashboard
```

A fila deve receber uma referência ao `ingestion_id`, não necessariamente repetir o JSON inteiro. Isso reduz pressão sobre a fila e permite reprocessar o payload original.

## 3. Endpoint de recebimento

### Requisição

`POST /api/v1/scrap-ingestions`

Headers recomendados:

```http
Content-Type: application/json
Content-Encoding: gzip
Idempotency-Key: bot-run-20260819T120000Z
```

### Resposta imediata

```json
{
  "ingestion_id": "ing_01J5Q9Y8A6Z4K2M1",
  "bot_run_id": "bot-run-20260819T120000Z",
  "status": "queued",
  "received_records": 48228,
  "received_at": "2026-08-19T12:00:08-04:00"
}
```

Status HTTP: `202 Accepted`.

## 4. Envelope do JSON

```json
{
  "schema_version": "1.0",
  "bot_run_id": "bot-run-20260819T120000Z",
  "trigger": "scheduled",
  "mode": "snapshot",
  "source": "GERP",
  "timezone": "America/Manaus",
  "extracted_at": "2026-08-19T11:58:31-04:00",
  "sent_at": "2026-08-19T12:00:03-04:00",
  "window": {
    "from": "2026-01-01T00:00:00-04:00",
    "to": "2026-08-19T11:58:31-04:00"
  },
  "record_count": 48228,
  "checksum_sha256": "<hash-do-array-records>",
  "records": []
}
```

Regras:

- `trigger`: `scheduled` ou `manual`;
- `mode`: começar com `snapshot`; admitir `delta` somente quando o robô conseguir informar inclusões, alterações e exclusões;
- `bot_run_id`: único por execução e estável em retentativas;
- `record_count`: deve ser igual ao tamanho de `records`;
- `checksum_sha256`: detecta payload truncado ou diferente em uma retentativa.

## 5. Registro de scrap

```json
{
  "source_record_id": "GERP-20260622-000184",
  "transaction_at": "2026-06-22T00:00:00-04:00",
  "organization_code": "IF-COST",
  "department": "FA",
  "division": "MS",
  "product": "TV",
  "line": "A03",
  "sector": "Final Assembly",
  "station_code": "P07",
  "make_item": "34G600A-BB",
  "item": "EBT3025869",
  "item_description": "MATERIAL DESCRIPTION",
  "item_type": "Module",
  "issue_quantity": -1,
  "amount_usd_original": -26.68,
  "amount_brl_original": -162.74,
  "exchange_rate": 6.10,
  "reason": "SCRAP",
  "request_reason": "MATERIAL_DAMAGE",
  "request_comment": "Material solicitado para fechamento da locação 70",
  "source_updated_at": "2026-08-19T11:57:10-04:00"
}
```

### Campos essenciais para a primeira versão

| Campo | Obrigatório | Uso |
|---|---:|---|
| `source_record_id` | recomendado | Idempotência do registro na origem. |
| `transaction_at` | sim | Período, mês, semana e ordenação. |
| `product` | sim | Produto/área, incluindo BM. |
| `line` | sim | Linha ou departamento de recebimento usado no dashboard. |
| `sector` | recomendado | Filtro industrial e validação de combinações. |
| `station_code` | recomendado | Heatmap e investigação por posto. |
| `make_item` | sim | Modelo/produto fabricado. |
| `item` | sim | Código do material/Part Number. |
| `item_type` | recomendado | Agrupamento de componentes. |
| `issue_quantity` | sim | Quantidade original com sinal preservado. |
| `amount_usd_original` | sim | Valor original com sinal preservado. |
| `request_comment` | não | Comentário REQ imutável da origem. |

O robô não deve enviar justificativa humana, causa raiz, responsável ou plano de ação. Esses dados pertencem ao sistema e ficam vinculados ao registro importado.

## 6. Identidade da ocorrência

Na primeira versão:

- cada registro válido recebido gera uma `occurrence_id` interna;
- se `source_record_id` existir, a chave idempotente é `source + source_record_id`;
- sem identificador da origem, o backend calcula um fingerprint canônico com campos estáveis;
- retentativas da mesma execução não criam novas ocorrências;
- data, produto, linha, setor, posto, modelo e item são dimensões de consulta, não a chave primária.

Fingerprint provisório:

```text
SHA-256(
  source + transaction_at + organization_code + product + line + sector +
  station_code + make_item + item + issue_quantity + amount_usd_original
)
```

O fingerprint deve ser uma contingência. Um `source_record_id` fornecido pelo GERP é mais seguro.

## 7. Regras derivadas no backend

O JSON preserva os sinais originais. O backend deriva:

```text
qty_signed    = -issue_quantity
qty_gross     = max(qty_signed, 0)
qty_reversal  = max(-qty_signed, 0)
qty_net       = qty_gross - qty_reversal

usd_signed    = -amount_usd_original
usd_gross     = max(usd_signed, 0)
usd_reversal  = max(-usd_signed, 0)
usd_net       = usd_gross - usd_reversal
```

O valor original nunca é sobrescrito. Dados humanos também não alteram o payload bruto.

## 8. Snapshot, duplicidade e remoções

Como a carga é enviada a cada duas horas:

- uma retentativa com o mesmo `bot_run_id` e checksum retorna a mesma ingestão;
- o mesmo `bot_run_id` com checksum diferente deve ser rejeitado com conflito;
- um snapshot novo faz upsert dos registros presentes;
- registros ausentes não devem ser excluídos imediatamente;
- a remoção só ocorre após regra explícita de reconciliação, pois uma raspagem parcial pode omitir dados por falha.

## 9. Validação e observabilidade

Não repetir o comportamento atual de ignorar linhas inválidas. Cada execução deve registrar:

- recebidos, válidos, rejeitados e duplicados;
- erro por registro com índice, campo e motivo;
- status `queued`, `processing`, `partial`, `completed` ou `failed`;
- timestamps e duração;
- versão do schema e do normalizador;
- snapshot publicado ou não.

Rotas auxiliares sugeridas:

```http
GET /api/v1/scrap-ingestions/{ingestion_id}
GET /api/v1/scrap-ingestions/{ingestion_id}/errors
POST /api/v1/scrap-ingestions/{ingestion_id}/reprocess
```

## 10. Consultas do Dashboard

Para multisseleção, a proposta usa parâmetros repetidos:

```http
GET /dashboard/data?year=2026&product=TV&product=BM&receipt_department=A03&sector=Final%20Assembly
```

O backend deve aplicar `OR` dentro da mesma dimensão e `AND` entre dimensões:

```text
(product = TV OR product = BM)
AND receipt_department = A03
AND sector = Final Assembly
```

Quando a combinação não existir, retorna coleção vazia e metadados de consulta; isso não é erro HTTP. O frontend informa que as dimensões selecionadas não possuem relação no recorte.

O objeto `filters` da resposta deve continuar trazendo o domínio completo permitido para o ano, além das opções compatíveis com o recorte. Não deve devolver apenas os valores já selecionados, pois isso impediria o usuário de trocar ou ampliar a seleção.
