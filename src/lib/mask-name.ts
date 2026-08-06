export function maskName(name: string, isPrivate: boolean): string {
  if (!isPrivate || !name) return name;
  return `${name.charAt(0)}*****`;
}
