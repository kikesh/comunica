# Guía Completa: Configuración de la API de Google Gemini para ConverGT

## 📋 Introducción

La API de Google Gemini es el motor de inteligencia artificial que potencia las funcionalidades avanzadas de ConverGT, incluyendo el análisis de oportunidades de prensa y la generación de contenido para redes sociales. Esta guía te llevará paso a paso a través del proceso completo de configuración.

## 🎯 ¿Qué es la API de Gemini?

Google Gemini es un modelo de IA multimodal desarrollado por Google DeepMind que puede procesar y generar texto, imágenes, audio y video. En ConverGT, utilizamos específicamente las capacidades de procesamiento de texto para:

- **Análisis de Actividades**: Identificar oportunidades de comunicación en las actividades registradas
- **Generación de Contenido**: Crear publicaciones adaptadas para diferentes redes sociales
- **Optimización de Comunicados**: Sugerir mejoras en los textos de comunicación externa

## 🚀 Paso 1: Obtener tu Clave de API de Gemini

### Opción A: Google AI Studio (Recomendado - Gratuito)

1. **Acceder a Google AI Studio**
   - Ve a: https://aistudio.google.com/app/apikey
   - Inicia sesión con tu cuenta de Google

2. **Crear una nueva API Key**
   - Haz clic en "Create API key"
   - Selecciona "Create API key in new project" (para un nuevo proyecto)
   - O selecciona un proyecto existente si ya tienes uno

3. **Copiar tu clave**
   - Una vez generada, copia la clave API
   - **¡IMPORTANTE!** Guárdala en un lugar seguro, no podrás verla de nuevo

### Opción B: Google Cloud Console (Para uso empresarial)

1. **Acceder a Google Cloud Console**
   - Ve a: https://console.cloud.google.com/
   - Crea un nuevo proyecto o selecciona uno existente

2. **Habilitar la API de Gemini**
   - Ve a "APIs & Services" > "Library"
   - Busca "Generative Language API"
   - Haz clic en "Enable"

3. **Crear credenciales**
   - Ve a "APIs & Services" > "Credentials"
   - Haz clic en "Create Credentials" > "API key"
   - Copia la clave generada

## 🔧 Paso 2: Configurar la API en tu Aplicación Local

### Para Desarrollo Local

1. **Crear archivo de variables de entorno**
   ```bash
   # En la carpeta raíz de tu proyecto ConverGT
   cp .env.example .env.local
   ```

2. **Editar el archivo .env.local**
   ```env
   # Reemplaza 'tu_clave_de_gemini_aqui' con tu clave real
   API_KEY=AIzaSyC-tu_clave_real_de_gemini_aqui
   
   # Configuración opcional
   VITE_APP_TITLE=ConverGT
   VITE_APP_DESCRIPTION=Comunicación Sindical en Red
   ```

3. **Verificar la configuración**
   ```bash
   # Ejecutar la aplicación en modo desarrollo
   npm run dev
   ```

4. **Probar las funcionalidades de IA**
   - Ve al Dashboard
   - Haz clic en "Analizar para Oportunidades de Prensa"
   - Si funciona correctamente, verás sugerencias generadas por IA

### Para Sistemas Operativos Específicos

#### Linux/macOS (Bash)
```bash
# Añadir al archivo ~/.bashrc o ~/.bash_profile
export GEMINI_API_KEY=tu_clave_de_gemini_aqui

# Aplicar los cambios
source ~/.bashrc
```

#### macOS (Zsh)
```bash
# Añadir al archivo ~/.zshrc
export GEMINI_API_KEY=tu_clave_de_gemini_aqui

# Aplicar los cambios
source ~/.zshrc
```

#### Windows (PowerShell)
```powershell
# Configurar variable de entorno temporal
$env:GEMINI_API_KEY="tu_clave_de_gemini_aqui"

# Para configuración permanente, usar el Panel de Control
# Sistema > Configuración avanzada > Variables de entorno
```

#### Windows (Command Prompt)
```cmd
# Configurar variable de entorno temporal
set GEMINI_API_KEY=tu_clave_de_gemini_aqui

# Para configuración permanente
setx GEMINI_API_KEY "tu_clave_de_gemini_aqui"
```

## 🌐 Paso 3: Configurar la API para Despliegue en Producción

### GitHub Pages con GitHub Actions

1. **Configurar Secrets en GitHub**
   - Ve a tu repositorio en GitHub
   - Settings > Secrets and variables > Actions
   - Haz clic en "New repository secret"
   - Nombre: `GEMINI_API_KEY`
   - Valor: Tu clave de API de Gemini

2. **El workflow ya está configurado**
   - El archivo `.github/workflows/deploy.yml` ya incluye la configuración necesaria
   - Se ejecutará automáticamente en cada push a la rama main

### Vercel

1. **Configurar variables de entorno en Vercel**
   - Ve a tu proyecto en Vercel Dashboard
   - Settings > Environment Variables
   - Añadir nueva variable:
     - Name: `API_KEY`
     - Value: Tu clave de API de Gemini
     - Environments: Production, Preview, Development

2. **Redesplegar si es necesario**
   ```bash
   # Si ya tienes el proyecto desplegado
   vercel --prod
   ```

### Netlify

1. **Configurar variables de entorno en Netlify**
   - Ve a tu sitio en Netlify Dashboard
   - Site settings > Environment variables
   - Añadir nueva variable:
     - Key: `API_KEY`
     - Value: Tu clave de API de Gemini

2. **Redesplegar**
   - El sitio se redesplegará automáticamente
   - O puedes forzar un nuevo deploy desde el dashboard

### Otras Plataformas de Hosting

#### Heroku
```bash
# Configurar variable de entorno
heroku config:set API_KEY=tu_clave_de_gemini_aqui --app tu-app-name
```

#### Railway
```bash
# En el dashboard de Railway
# Variables > Add Variable
# Key: API_KEY
# Value: tu_clave_de_gemini_aqui
```

#### DigitalOcean App Platform
```yaml
# En el archivo .do/app.yaml
envs:
- key: API_KEY
  value: tu_clave_de_gemini_aqui
```

## 🔒 Paso 4: Seguridad y Mejores Prácticas

### Reglas Críticas de Seguridad

1. **Nunca commitear claves en el código**
   ```bash
   # ❌ NUNCA hagas esto
   const API_KEY = "AIzaSyC-tu_clave_real_aqui";
   
   # ✅ Siempre usa variables de entorno
   const API_KEY = process.env.API_KEY;
   ```

2. **No exponer claves en el frontend**
   - Las claves en código cliente pueden ser extraídas
   - Usa siempre llamadas desde el servidor cuando sea posible

3. **Usar restricciones de API**
   - En Google Cloud Console, puedes restringir el uso de tu clave
   - Limitar por IP, dominio o aplicación

### Configuración de Restricciones

1. **Acceder a Google Cloud Console**
   - Ve a "APIs & Services" > "Credentials"
   - Haz clic en tu API key

2. **Configurar restricciones**
   - **Application restrictions**: Limitar por dominio web
   - **API restrictions**: Limitar a "Generative Language API"

3. **Ejemplo de restricciones recomendadas**
   ```
   Application restrictions:
   - HTTP referrers: https://tu-dominio.com/*
   
   API restrictions:
   - Generative Language API
   ```

## 📊 Paso 5: Verificar el Funcionamiento

### Pruebas Básicas

1. **Probar en desarrollo local**
   ```bash
   npm run dev
   # Ir a http://localhost:5173
   # Probar funcionalidades de IA
   ```

2. **Verificar en producción**
   - Acceder a tu aplicación desplegada
   - Probar el análisis de oportunidades
   - Probar la generación de contenido para redes sociales

### Solución de Problemas Comunes

#### Error: "API key not configured"
```javascript
// Verificar que la variable esté configurada
console.log('API Key configured:', !!process.env.API_KEY);
```

#### Error: "API key invalid"
- Verificar que la clave esté copiada correctamente
- Asegurarse de que no haya espacios extra
- Verificar que la API esté habilitada en Google Cloud

#### Error: "Quota exceeded"
- Verificar el uso en Google Cloud Console
- Considerar upgrade a plan de pago si es necesario

## 💰 Paso 6: Gestión de Costos y Límites

### Plan Gratuito de Google AI Studio

- **Límites**: 15 requests por minuto, 1,500 requests por día
- **Modelos incluidos**: Gemini 1.5 Flash, Gemini 1.5 Pro
- **Ideal para**: Desarrollo, pruebas, aplicaciones pequeñas

### Plan de Pago (Google Cloud)

- **Pricing**: Por token procesado
- **Gemini 1.5 Flash**: $0.075 por 1M tokens de entrada
- **Gemini 1.5 Pro**: $1.25 por 1M tokens de entrada
- **Ideal para**: Aplicaciones en producción, alto volumen

### Monitoreo de Uso

1. **Google AI Studio Dashboard**
   - Ve a https://aistudio.google.com/
   - Revisa el uso en la sección "Usage"

2. **Google Cloud Console**
   - APIs & Services > Dashboard
   - Monitoring > Metrics Explorer

### Optimización de Costos

1. **Usar prompts eficientes**
   - Ser específico y conciso
   - Evitar repetir información innecesaria

2. **Implementar caché**
   ```javascript
   // Ejemplo de caché simple
   const cache = new Map();
   
   async function getCachedResponse(prompt) {
     if (cache.has(prompt)) {
       return cache.get(prompt);
     }
     
     const response = await callGemini(prompt);
     cache.set(prompt, response);
     return response;
   }
   ```

3. **Configurar límites de rate**
   ```javascript
   // Implementar throttling
   const rateLimiter = {
     requests: 0,
     resetTime: Date.now() + 60000, // 1 minuto
     
     canMakeRequest() {
       if (Date.now() > this.resetTime) {
         this.requests = 0;
         this.resetTime = Date.now() + 60000;
       }
       
       return this.requests < 15; // Límite de 15 por minuto
     }
   };
   ```

## 🔄 Paso 7: Mantenimiento y Actualizaciones

### Rotación de Claves

1. **Crear nueva clave**
   - Generar nueva API key en Google AI Studio
   - Configurar en todas las plataformas de despliegue

2. **Actualizar aplicaciones**
   - Actualizar variables de entorno
   - Verificar funcionamiento

3. **Eliminar clave antigua**
   - Solo después de confirmar que la nueva funciona
   - Eliminar de Google Cloud Console

### Monitoreo Continuo

1. **Configurar alertas**
   - Google Cloud Monitoring
   - Alertas por uso excesivo
   - Alertas por errores de API

2. **Logs y debugging**
   ```javascript
   // Logging para debugging
   const callGemini = async (prompt) => {
     try {
       console.log('Calling Gemini API with prompt length:', prompt.length);
       const response = await api.call(prompt);
       console.log('Gemini API response received');
       return response;
     } catch (error) {
       console.error('Gemini API error:', error.message);
       throw error;
     }
   };
   ```

## 📚 Recursos Adicionales

### Documentación Oficial
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Google Cloud AI](https://cloud.google.com/ai)

### Herramientas Útiles
- [API Key Tester](https://aistudio.google.com/) - Para probar tu clave
- [Quota Monitor](https://console.cloud.google.com/) - Para monitorear uso
- [Cost Calculator](https://cloud.google.com/products/calculator) - Para estimar costos

### Comunidad y Soporte
- [Google AI Developer Community](https://developers.googleblog.com/en/ai-ml/)
- [Stack Overflow - Gemini API](https://stackoverflow.com/questions/tagged/gemini-api)
- [GitHub - Google Gemini Cookbook](https://github.com/google-gemini/cookbook)

## ✅ Checklist de Configuración

- [ ] Obtener clave de API de Google AI Studio
- [ ] Configurar variable de entorno local (.env.local)
- [ ] Probar funcionalidades de IA en desarrollo
- [ ] Configurar secrets en plataforma de despliegue
- [ ] Verificar funcionamiento en producción
- [ ] Configurar restricciones de seguridad
- [ ] Configurar monitoreo de uso
- [ ] Documentar la configuración para el equipo

## 🎉 Conclusión

Con esta configuración completa, tu aplicación ConverGT tendrá acceso a todas las capacidades de inteligencia artificial de Google Gemini. Las funcionalidades de análisis de oportunidades y generación de contenido estarán completamente operativas, proporcionando un valor significativo para la gestión de comunicación sindical.

Recuerda mantener tu clave de API segura y monitorear el uso regularmente para optimizar costos y rendimiento.

