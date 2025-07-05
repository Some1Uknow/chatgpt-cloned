export async function fetchWithErrorHandlers(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response;
}
