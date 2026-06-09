export function unwrapEntity(data) {
  if (!data || typeof data !== 'object') return data;
  const result = { ...data };
  delete result._links;
  delete result._embedded;
  return result;
}

export function unwrapList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data._embedded) {
    const embedded = Object.values(data._embedded).find(Array.isArray);
    return embedded ?? [];
  }
  if (Array.isArray(data.content)) return data.content;
  return [];
}
