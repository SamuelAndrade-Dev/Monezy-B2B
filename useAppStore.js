// Exemplo didático de consumo de API REST externa (JSONPlaceholder).
// Substituir pela API definida pelo grupo, se o professor exigir uma API específica.
const API_URL = "https://jsonplaceholder.typicode.com";

export async function fetchApiExample() {
  const response = await fetch(`${API_URL}/posts/1`);
  if (!response.ok) throw new Error(`Falha na API: ${response.status}`);
  return response.json();
}
