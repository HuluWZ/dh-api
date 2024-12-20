export function extractMentionedUsers(content: string): string[] {
  const matches = content.match(/@(\w+)/g);
  return matches ? matches.map((mention) => mention.slice(1)) : [];
}
