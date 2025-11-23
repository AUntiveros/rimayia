# 🔧 Troubleshooting - RimiApp

## ✅ Problema Resuelto: PostCSS + Tailwind v4

### Error Original
```
[postcss] It looks like you're trying to use tailwindcss directly as a PostCSS plugin.
```

### Causa
Conflicto de versiones entre Tailwind CSS v4 (experimental) y la configuración de PostCSS.

### Solución Aplicada

1. **Desinstalación de versión conflictiva:**
   ```bash
   npm uninstall tailwindcss @tailwindcss/postcss
   ```

2. **Instalación de versión estable:**
   ```bash
   npm install -D tailwindcss@3.4.17 postcss autoprefixer
   ```

3. **Configuración de PostCSS (postcss.config.js):**
   ```javascript
   export default {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   }
   ```

### Versiones Instaladas
- `tailwindcss@3.4.17` (estable)
- `postcss@8.5.6`
- `autoprefixer@10.4.22`

### Verificación
```bash
npm list tailwindcss postcss autoprefixer
npm run dev
```

---

## Otros Problemas Comunes

### Error: "Cannot find module"
**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"
**Solución:**
```bash
# Cambiar puerto en vite.config.ts
export default defineConfig({
  server: {
    port: 3000
  }
})
```

### Error: TypeScript "Cannot find type definition"
**Solución:**
```bash
npm install -D @types/node
```

### Animaciones no funcionan
**Verificar:**
- Framer Motion instalado: `npm list framer-motion`
- Import correcto: `import { motion } from 'framer-motion'`

### Estilos de Tailwind no se aplican
**Verificar:**
1. `index.css` tiene las directivas de Tailwind
2. `tailwind.config.js` tiene los paths correctos en `content`
3. Servidor reiniciado después de cambios en config

---

## 🆘 Soporte

Si encuentras otros problemas:
1. Verifica la consola del navegador (F12)
2. Revisa la terminal donde corre `npm run dev`
3. Limpia caché: `npm run build` y reinicia
