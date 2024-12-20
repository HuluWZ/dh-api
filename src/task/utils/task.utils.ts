function extractTaskIdentifier(content: string): string | number | null {
  const match = content.match(/@task (.+)/);
  if (!match) return null;

  const identifier = match[1].trim();
  return /^\d+$/.test(identifier) ? parseInt(identifier, 10) : identifier;
}
