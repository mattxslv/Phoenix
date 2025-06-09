export async function updatePrompt(id, newPrompt) {
  // Example: Replace this with your real API call
  // return fetch(`/api/prompts/${id}`, { method: 'PUT', body: JSON.stringify({ prompt: newPrompt }) });
  return Promise.resolve({ id, prompt: newPrompt });
}