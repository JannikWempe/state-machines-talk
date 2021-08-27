export const highlightQuery = (text, query) => {
  let parts = text.split(query);
  const result = [];
  for (let i = 0; i < parts.length; i++) {
    const isLastPart = i === parts.length - 1;
    result.push(parts[i]);
    if (!isLastPart) result.push(<mark key={i}>{query}</mark>);
  }
  return result;
};
