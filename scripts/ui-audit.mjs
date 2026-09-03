import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
const files = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(tsx|ts|css|html|mjs)$/.test(name)) files.push(path);
  }
}

walk(join(root, 'src'));
walk(join(root, 'scripts'));
files.push(join(root, 'index.html'));

const content = files.map((file) => [file, readFileSync(file, 'utf8')]);
const failures = [];

const modernTargets = content.filter(([file]) =>
  /src[\\/](components[\\/](layout|ui)|pages[\\/]Login\.tsx|styles\.css|hooks[\\/]useTheme\.ts)/.test(file),
);
const combined = modernTargets.map(([, text]) => text).join('\n');

if (combined.includes('window.confirm(') || combined.includes('confirm(')) failures.push('Ainda existe confirm nativo; use ConfirmDialog.');
if (!combined.includes("data-theme='light'") || !combined.includes("data-theme='dark'")) failures.push('Temas claro/escuro incompletos.');
if (!combined.includes('prefers-reduced-motion')) failures.push('Suporte a redução de movimento ausente.');
if (!combined.includes('inert') && !combined.includes('aria-hidden')) failures.push('Conteúdo oculto sem proteção de foco aparente.');
if (combined.includes('bg-slate-950') || combined.includes('text-slate-100') || combined.includes('text-sky-') || combined.includes('border-slate-')) failures.push('Ainda existem cores antigas proibidas em componentes novos.');
if (combined.includes('<img') && !combined.includes('alt=')) failures.push('Há imagens sem alt.');
if (!combined.includes('overflow-x-hidden')) failures.push('Proteção básica contra overflow horizontal ausente.');

if (failures.length) {
  console.error(`Auditoria de UI falhou:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Auditoria de UI aprovada (${files.length} arquivos verificados).`);
