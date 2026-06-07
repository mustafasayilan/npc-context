export interface SearchDocument {
  id: string;
  title: string;
  body: string;
  tags: string[];
}

export function searchDocuments(documents: SearchDocument[], query: string): SearchDocument[] {
  const normalized = query.toLowerCase();
  return documents.filter((document) =>
    [document.title, document.body, ...document.tags].some((value) => value.toLowerCase().includes(normalized))
  );
}

export function rankSearchResults(documents: SearchDocument[], query: string): SearchDocument[] {
  return [...searchDocuments(documents, query)].sort((left, right) => left.title.localeCompare(right.title));
}
