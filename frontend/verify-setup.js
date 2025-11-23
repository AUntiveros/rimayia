#!/usr/bin/env node

/**
 * Script de verificación de configuración de RimiApp
 * Ejecutar con: node verify-setup.js
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const checks = [];

// Verificar package.json
try {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
  
  // Verificar Tailwind CSS
  const tailwindVersion = pkg.devDependencies?.tailwindcss;
  if (tailwindVersion?.includes('3.4.17')) {
    checks.push({ name: 'Tailwind CSS v3.4.17', status: '✅' });
  } else {
    checks.push({ name: 'Tailwind CSS v3.4.17', status: '❌', actual: tailwindVersion });
  }
  
  // Verificar PostCSS
  const postcssVersion = pkg.devDependencies?.postcss;
  if (postcssVersion) {
    checks.push({ name: 'PostCSS', status: '✅' });
  } else {
    checks.push({ name: 'PostCSS', status: '❌' });
  }
  
  // Verificar Autoprefixer
  const autoprefixerVersion = pkg.devDependencies?.autoprefixer;
  if (autoprefixerVersion) {
    checks.push({ name: 'Autoprefixer', status: '✅' });
  } else {
    checks.push({ name: 'Autoprefixer', status: '❌' });
  }
  
  // Verificar dependencias críticas
  const criticalDeps = ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react'];
  criticalDeps.forEach(dep => {
    if (pkg.dependencies?.[dep]) {
      checks.push({ name: dep, status: '✅' });
    } else {
      checks.push({ name: dep, status: '❌' });
    }
  });
  
} catch (error) {
  console.error('❌ Error leyendo package.json:', error.message);
  process.exit(1);
}

// Verificar archivos de configuración
const configFiles = [
  'tailwind.config.js',
  'postcss.config.js',
  'vite.config.ts',
  'tsconfig.json',
];

configFiles.forEach(file => {
  try {
    readFileSync(`./${file}`, 'utf-8');
    checks.push({ name: file, status: '✅' });
  } catch {
    checks.push({ name: file, status: '❌' });
  }
});

// Mostrar resultados
console.log('\n🔍 Verificación de Configuración - RimiApp\n');
console.log('═'.repeat(50));

checks.forEach(check => {
  const actual = check.actual ? ` (actual: ${check.actual})` : '';
  console.log(`${check.status} ${check.name}${actual}`);
});

console.log('═'.repeat(50));

const failed = checks.filter(c => c.status === '❌').length;
if (failed === 0) {
  console.log('\n✅ Todas las verificaciones pasaron correctamente!');
  console.log('\n🚀 Puedes ejecutar: npm run dev\n');
} else {
  console.log(`\n❌ ${failed} verificación(es) fallaron.`);
  console.log('\n📖 Consulta TROUBLESHOOTING.md para más información.\n');
  process.exit(1);
}
