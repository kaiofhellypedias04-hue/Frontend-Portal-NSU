import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
const files = [];
function walk(dir) { for (const name of readdirSync(dir)) { const path = join(dir, name); if (statSync(path).isDirectory()) walk(path); else if (/\.(tsx|ts|css|html)$/.test(name)) files.push(path); } }
walk(join(root, 'src')); files.push(join(root, 'index.html'));
const content = files.map((file) => [file, readFileSync(file, 'utf8')]);
const failures = [];
if (content.some(([, text]) => text.includes('window.confirm('))) failures.push('Ainda existe window.confirm; use ConfirmDialog.');
const html = readFileSync(join(root, 'index.html'), 'utf8');
if (!html.includes('lang="pt-BR"')) failures.push('Idioma pt-BR ausente no HTML.');
if (!html.includes('width=device-width')) failures.push('Viewport responsivo ausente.');
const css = readFileSync(join(root, 'src/styles.css'), 'utf8');
if (!css.includes('prefers-reduced-motion')) failures.push('Suporte a redução de movimento ausente.');
if (!css.includes("data-theme='light'") || !css.includes("data-theme='dark'")) failures.push('Temas claro/escuro incompletos.');
if (failures.length) { console.error(`Auditoria de UI falhou:\n- ${failures.join('\n- ')}`); process.exit(1); }
console.log(`Auditoria de UI aprovada (${files.length} arquivos verificados).`);
