# 🏗️ Calculadora de Construcción Costa Rica

Herramienta gratuita para estimar costos de construcción en Costa Rica.
Desplegada en GitHub Pages con Google AdSense.

---

## 📁 Estructura del Repositorio

```
/
├── index.html       ← Página principal (HTML + CSS)
├── app.js           ← Lógica de la calculadora (ofuscada)
├── privacy.html     ← Política de privacidad (requerida por AdSense)
├── ads.txt          ← Autorización de AdSense (requerida)
├── robots.txt       ← Directivas para buscadores
├── sitemap.xml      ← Mapa del sitio para SEO
└── README.md        ← Este archivo
```

---

## 🚀 Pasos para publicar en GitHub Pages

### Paso 1 — Crear el repositorio
1. Ve a [github.com/new](https://github.com/new)
2. Ponle un nombre, ej: `calculadora-construccion-cr`
3. Márcalo como **Public** (GitHub Pages es gratis solo en repos públicos)
4. Haz clic en **Create repository**

### Paso 2 — Subir los archivos
**Opción A — Desde el navegador (sin terminal):**
1. Abre tu repositorio en GitHub
2. Haz clic en **"uploading an existing file"**
3. Arrastra todos estos archivos a la vez:
   - `index.html`
   - `app.js`
   - `privacy.html`
   - `ads.txt`
   - `robots.txt`
   - `sitemap.xml`
4. Escribe el mensaje: `Initial deploy` y haz clic en **Commit changes**

**Opción B — Desde terminal (git):**
```bash
git clone https://github.com/TU-USUARIO/calculadora-construccion-cr.git
cd calculadora-construccion-cr
# Copia todos los archivos aquí
git add .
git commit -m "Initial deploy"
git push origin main
```

### Paso 3 — Activar GitHub Pages
1. Ve a tu repositorio → **Settings** → **Pages** (menú izquierdo)
2. En **Source**, selecciona: `Deploy from a branch`
3. En **Branch**, selecciona: `main` y carpeta `/root`
4. Haz clic en **Save**
5. Espera 1-2 minutos → tu sitio estará en:
   `https://TU-USUARIO.github.io/calculadora-construccion-cr/`

---

## ⚠️ Cosas que DEBES personalizar antes de subir

### 1. Tu dominio en robots.txt y sitemap.xml
Reemplaza `TU-USUARIO` y `TU-REPO` con tus datos reales:

**robots.txt:**
```
Sitemap: https://TU-USUARIO.github.io/calculadora-construccion-cr/sitemap.xml
```

**sitemap.xml:** Cambia ambas URLs `<loc>` con tu URL real.

### 2. El Ad Slot de AdSense en index.html
Busca esta línea en `index.html`:
```html
data-ad-slot="XXXXXXXXXX"
```
Reemplaza `XXXXXXXXXX` con tu **Ad Unit ID** real de Google AdSense.

Para obtenerlo:
1. Ve a [AdSense](https://www.google.com/adsense) → Anuncios → Por sitio
2. Crea una nueva unidad de anuncio
3. Copia el valor de `data-ad-slot`

### 3. (Opcional) Dominio propio
Google AdSense **raramente aprueba** dominios `.github.io`.
Se recomienda apuntar un dominio propio (ej: `calculadoracr.com`):
1. Compra un dominio en Namecheap, GoDaddy, etc.
2. En GitHub Pages → Custom domain → escribe tu dominio
3. En tu DNS, agrega un CNAME: `www` → `TU-USUARIO.github.io`

---

## 📋 Checklist para aprobación de AdSense

- [ ] Sitio publicado y accesible públicamente
- [ ] `privacy.html` accesible en `/privacy.html`
- [ ] `ads.txt` accesible en `/ads.txt` con tu pub-ID
- [ ] Al menos 5-10 páginas o contenido de valor
- [ ] Dominio activo por al menos 6 meses (recomendado)
- [ ] No hay contenido copiado de otros sitios
- [ ] El sitio carga rápido y es responsive (✅ ya cumple)
- [ ] Formulario de solicitud enviado en [AdSense](https://www.google.com/adsense)

---

## 🔒 Nota sobre protección del código

El archivo `app.js` está ofuscado. Esto significa:
- El código fuente legible **no** está disponible públicamente
- Las variables tienen nombres como `_0x1a2b` y las strings están en base64
- Cualquiera que intente copiar el código obtendrá algo ilegible
- **No afecta el rendimiento** de la aplicación

---

## 📞 Soporte

Para actualizar las tasas o hacer cambios al código, edita `app.js` con la versión fuente original y vuelve a correr el proceso de ofuscación.
