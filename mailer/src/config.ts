import { readFileSync } from 'fs';
import { parse } from 'ini';

export function readConfig(fileName: string) {
  const text = readFileSync(fileName, 'utf-8');
  return parse(text);
}
