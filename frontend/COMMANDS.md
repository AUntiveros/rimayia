# 📝 Comandos Útiles - RimiApp

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🔍 Verificación

```bash
# Verificar configuración completa
node verify-setup.js

# Verificar versiones de dependencias
npm list tailwindcss postcss autoprefixer

# Verificar todas las dependencias
npm list

# Verificar dependencias desactualizadas
npm outdated
```

## 🧹 Limpieza

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar caché de npm
npm cache clean --force

# Limpiar build
rm -rf dist
```

## 📦 Gestión de Dependencias

```bash
# Instalar nueva dependencia
npm install <package>

# Instalar dependencia de desarrollo
npm install -D <package>

# Desinstalar dependencia
npm uninstall <package>

# Actualizar dependencia específica
npm update <package>
```

## 🔧 Tailwind CSS

```bash
# Regenerar configuración de Tailwind
npx tailwindcss init

# Regenerar configuración de Tailwind + PostCSS
npx tailwindcss init -p

# Build de Tailwind (standalone)
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch
```

## 🐛 Debugging

```bash
# Ejecutar con logs detallados
npm run dev -- --debug

# Verificar errores de TypeScript
npx tsc --noEmit

# Verificar errores de ESLint
npm run lint
```

## 📊 Análisis

```bash
# Analizar tamaño del bundle
npm run build
npx vite-bundle-visualizer

# Verificar dependencias no utilizadas
npx depcheck
```

## 🔐 Git

```bash
# Inicializar repositorio
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "Initial commit: RimiApp setup"

# Ver estado
git status

# Ver diferencias
git diff
```

## 🌐 Deployment

```bash
# Build para producción
npm run build

# Preview del build
npm run preview

# Deploy a Vercel (si está configurado)
vercel

# Deploy a Netlify (si está configurado)
netlify deploy --prod
```

## 📱 Testing (cuando se implemente)

```bash
# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm test -- --watch

# Ejecutar tests con coverage
npm test -- --coverage

# Ejecutar tests E2E
npm run test:e2e
```

## 🔄 Actualización de Dependencias

```bash
# Actualizar todas las dependencias (cuidado!)
npm update

# Actualizar a última versión (interactivo)
npx npm-check-updates -i

# Actualizar a última versión (automático)
npx npm-check-updates -u
npm install
```

## 💡 Tips

- Usa `npm run dev` para desarrollo local
- Ejecuta `node verify-setup.js` después de cambios en configuración
- Revisa `TROUBLESHOOTING.md` si encuentras errores
- Mantén las dependencias actualizadas regularmente
