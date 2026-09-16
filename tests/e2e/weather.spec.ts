import { expect, test } from '@playwright/test';

const saoPauloCity = {
  id: 3448439,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  country_code: 'BR',
  latitude: -23.55,
  longitude: -46.63,
};

const rioDeJaneiroCity = {
  id: 3451190,
  name: 'Rio de Janeiro',
  admin1: 'Rio de Janeiro',
  country: 'Brasil',
  country_code: 'BR',
  latitude: -22.91,
  longitude: -43.17,
};

async function mockGeocoding(
  page: Parameters<typeof test>[0]['page'],
  cityName: string,
  results: unknown[] | undefined,
) {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    const url = new URL(route.request().url());

    expect(url.searchParams.get('name')).toBe(cityName);
    expect(url.searchParams.get('language')).toBe('pt');

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(results === undefined ? {} : { results }),
    });
  });
}

async function mockForecast(
  page: Parameters<typeof test>[0]['page'],
  latitude: string,
  longitude: string,
  temperature: number,
) {
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    const url = new URL(route.request().url());

    expect(url.searchParams.get('latitude')).toBe(latitude);
    expect(url.searchParams.get('longitude')).toBe(longitude);
    expect(url.searchParams.get('forecast_days')).toBe('5');
    expect(url.searchParams.get('temperature_unit')).toBe('celsius');

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'America/Sao_Paulo',
        current: {
          temperature_2m: temperature,
          weather_code: 0,
          relative_humidity_2m: 70,
          wind_speed_10m: 12,
          precipitation: 0,
          surface_pressure: 1015,
        },
        daily: {
          time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
          weather_code: [0, 1, 2, 3, 61],
          temperature_2m_max: [25, 24, 23, 22, 21],
          temperature_2m_min: [15, 14, 13, 12, 11],
          precipitation_probability_max: [0, 10, 20, 30, 40],
        },
      }),
    });
  });
}

test('busca uma cidade, exibe a previsão de 5 dias e converte a temperatura', async ({ page }) => {
  await mockGeocoding(page, 'São Paulo', [saoPauloCity]);
  await mockForecast(page, '-23.55', '-46.63', 20);

  await page.goto('/');
  await page.getByRole('textbox', { name: 'Buscar cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page.getByText('São Paulo, Brasil')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão para os próximos dias' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Temperatura atual: 20°C' })).toBeVisible();

  await page.getByRole('button', { name: 'Usar graus Fahrenheit' }).click();

  await expect(page.getByRole('heading', { name: 'Temperatura atual: 68°F' })).toBeVisible();
});

test('mostra estado vazio quando o geocoding não retorna resultados', async ({ page }) => {
  await mockGeocoding(page, 'Atlantis', undefined);

  await page.goto('/');
  await page.getByRole('textbox', { name: 'Buscar cidade' }).fill('Atlantis');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  await expect(page.getByText('Tente buscar outra cidade.')).toBeVisible();
});

test('renderiza o clima corretamente no fluxo principal em viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockGeocoding(page, 'Rio de Janeiro', [rioDeJaneiroCity]);
  await mockForecast(page, '-22.91', '-43.17', 27);

  await page.goto('/');
  await page.getByRole('textbox', { name: 'Buscar cidade' }).fill('Rio de Janeiro');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page.getByText('Rio de Janeiro, Brasil')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Temperatura atual: 27°C' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão para os próximos dias' })).toBeVisible();
  await expect(page.getByText('Máx.')).toHaveCount(5);
});
