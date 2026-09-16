# Integração com a Open-Meteo

Esta referência descreve os contratos externos necessários para a primeira versão do Weather App. Os valores de temperatura são sempre solicitados em Celsius; `Unit` só é aplicado na apresentação.

## Geocoding

**URL:** `https://geocoding-api.open-meteo.com/v1/search`

Parâmetros relevantes:

| Parâmetro | Valor | Finalidade |
| --- | --- | --- |
| `name` | termo normalizado | Nome da cidade pesquisada. |
| `count` | limite definido pelo cliente | Limita as opções de localidade retornadas. |
| `language` | `pt` | Solicita nomes localizados em português. |
| `format` | `json` | Solicita uma resposta JSON. |
| `current` | não aplicável | Este endpoint não retorna condições atuais. |
| `daily` | não aplicável | Este endpoint não retorna previsão diária. |
| `timezone` | não aplicável | O fuso é retornado pelo endpoint de forecast. |

Exemplo resumido de resposta:

```json
{
  "results": [
    {
      "id": 3448439,
      "name": "Sao Paulo",
      "admin1": "Sao Paulo",
      "country": "Brasil",
      "country_code": "BR",
      "latitude": -23.5475,
      "longitude": -46.6361
    }
  ]
}
```

Mapeamento para `City`:

| Resposta Open-Meteo | Campo interno |
| --- | --- |
| `results[].id` | `id` |
| `results[].name` | `name` |
| `results[].admin1` | `region` |
| `results[].country` | `country` |
| `results[].country_code` | `countryCode` |
| `results[].latitude` | `latitude` |
| `results[].longitude` | `longitude` |

Se `results` estiver ausente, o serviço retorna uma lista vazia. Itens sem `name` ou coordenadas numéricas são inválidos e devem ser descartados. Como `City.country` é obrigatório, a implementação deve usar um rótulo neutro como `País não informado` quando esse campo não vier na resposta.

## Forecast

**URL:** `https://api.open-meteo.com/v1/forecast`

Parâmetros relevantes:

| Parâmetro | Valor | Finalidade |
| --- | --- | --- |
| `latitude` | `City.latitude` | Coordenada da cidade selecionada. |
| `longitude` | `City.longitude` | Coordenada da cidade selecionada. |
| `current` | `temperature_2m,weather_code` | Solicita temperatura e código WMO atuais. |
| `daily` | `weather_code,temperature_2m_max,temperature_2m_min` | Solicita condição, máxima e mínima diárias. |
| `forecast_days` | `5` | Solicita hoje e os quatro dias seguintes. |
| `timezone` | `auto` | Retorna dados alinhados ao fuso da localidade. |
| `temperature_unit` | `celsius` | Mantém Celsius como dado-base para conversão local. |

Exemplo resumido de resposta:

```json
{
  "timezone": "America/Sao_Paulo",
  "current": {
    "temperature_2m": 24.1,
    "weather_code": 2
  },
  "daily": {
    "time": ["2026-09-16", "2026-09-17"],
    "weather_code": [2, 61],
    "temperature_2m_max": [27.3, 25.8],
    "temperature_2m_min": [18.4, 17.1]
  }
}
```

Mapeamento para `WeatherData`:

| Resposta Open-Meteo | Campo interno |
| --- | --- |
| cidade selecionada no geocoding | `city` |
| `timezone` | `timezone` |
| `current.temperature_2m` | `current.temperatureCelsius` |
| `current.weather_code` | `current.weatherCode` |
| `daily.time[index]` | `forecast[index].date` |
| `daily.weather_code[index]` | `forecast[index].weatherCode` |
| `daily.temperature_2m_min[index]` | `forecast[index].minTemperatureCelsius` |
| `daily.temperature_2m_max[index]` | `forecast[index].maxTemperatureCelsius` |

O serviço deve criar cada `ForecastDay` pelo mesmo índice de `daily.time`, preservando a ordem cronológica. Deve exigir cinco datas; valores meteorológicos ausentes podem permanecer `undefined` nos campos opcionais. `timezone` e o bloco `daily` são obrigatórios para formar `WeatherData`; resposta HTTP não bem-sucedida, JSON inválido ou arrays sem alinhamento devem gerar erro tratável.