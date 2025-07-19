# Guía de Contribución a ConverGT

¡Gracias por tu interés en contribuir a ConverGT! Esta guía te ayudará a entender cómo puedes participar en el desarrollo de esta herramienta de comunicación sindical.

## 🤝 Formas de Contribuir

### Reportar Bugs
- Utiliza el sistema de issues de GitHub
- Incluye pasos para reproducir el problema
- Proporciona información del navegador y sistema operativo
- Adjunta capturas de pantalla si es relevante

### Sugerir Mejoras
- Abre un issue con la etiqueta "enhancement"
- Describe claramente la funcionalidad propuesta
- Explica por qué sería útil para los usuarios
- Considera la viabilidad técnica

### Contribuir Código
- Fork el repositorio
- Crea una rama para tu feature
- Sigue las convenciones de código
- Escribe tests si es aplicable
- Actualiza la documentación

## 🛠️ Configuración del Entorno de Desarrollo

### Prerrequisitos
```bash
# Node.js 18 o superior
node --version

# npm o yarn
npm --version
```

### Instalación
```bash
# Clonar tu fork
git clone https://github.com/tu-usuario/convergt.git
cd convergt

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu clave de Gemini

# Ejecutar en modo desarrollo
npm run dev
```

## 📝 Estándares de Código

### TypeScript
- Utilizar tipado estático en todas las funciones
- Definir interfaces para objetos complejos
- Evitar el uso de `any`

### React
- Componentes funcionales con hooks
- Props tipadas con interfaces
- Uso de memo para optimización cuando sea necesario

### Estilos
- Utilizar Tailwind CSS
- Mantener consistencia con el tema existente
- Responsive design obligatorio

### Nomenclatura
```typescript
// Componentes: PascalCase
const ActivityLogView = () => {}

// Funciones: camelCase
const handleSubmit = () => {}

// Constantes: UPPER_SNAKE_CASE
const API_ENDPOINTS = {}

// Interfaces: PascalCase con prefijo I
interface IActivity {}
```

## 🔄 Flujo de Trabajo

### 1. Preparación
```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear rama de feature
git checkout -b feature/nombre-descriptivo
```

### 2. Desarrollo
```bash
# Hacer cambios
# Probar localmente
npm run dev

# Verificar build
npm run build
```

### 3. Commits
```bash
# Seguir convención de commits
git commit -m "feat: añadir funcionalidad X"
git commit -m "fix: corregir bug en componente Y"
git commit -m "docs: actualizar README"
```

### 4. Pull Request
- Título descriptivo
- Descripción detallada de los cambios
- Referencias a issues relacionados
- Screenshots si hay cambios visuales

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
```

### Escribir Tests
```typescript
// Ejemplo de test para componente
import { render, screen } from '@testing-library/react'
import { ActivityLogView } from './ActivityLogView'

describe('ActivityLogView', () => {
  it('should render activity form', () => {
    render(<ActivityLogView />)
    expect(screen.getByText('Registrar Nueva Actividad')).toBeInTheDocument()
  })
})
```

## 📋 Checklist para Pull Requests

- [ ] El código compila sin errores
- [ ] Los tests pasan
- [ ] La documentación está actualizada
- [ ] Los cambios son responsive
- [ ] Se siguieron las convenciones de código
- [ ] No hay console.log olvidados
- [ ] Las variables de entorno están documentadas

## 🏷️ Etiquetas de Issues

- `bug`: Errores en el código
- `enhancement`: Nuevas funcionalidades
- `documentation`: Mejoras en documentación
- `good first issue`: Ideal para nuevos contribuidores
- `help wanted`: Se necesita ayuda
- `priority-high`: Alta prioridad
- `priority-low`: Baja prioridad

## 🎯 Áreas de Contribución Prioritarias

### Frontend
- Mejoras en UX/UI
- Optimización de rendimiento
- Accesibilidad
- Tests de componentes

### Backend (Futuro)
- API REST
- Base de datos
- Autenticación
- WebSockets para chat

### DevOps
- CI/CD improvements
- Docker configuration
- Monitoring setup

### Documentación
- Guías de usuario
- Documentación técnica
- Ejemplos de uso
- Traducciones

## 🚀 Proceso de Release

### Versionado
Seguimos [Semantic Versioning](https://semver.org/):
- `MAJOR`: Cambios incompatibles
- `MINOR`: Nuevas funcionalidades compatibles
- `PATCH`: Correcciones de bugs

### Changelog
Mantener actualizado el archivo CHANGELOG.md con:
- Nuevas funcionalidades
- Correcciones de bugs
- Cambios importantes
- Deprecaciones

## 💬 Comunicación

### Canales
- GitHub Issues: Bugs y features
- GitHub Discussions: Preguntas generales
- Pull Requests: Revisión de código

### Código de Conducta
- Ser respetuoso y constructivo
- Aceptar críticas constructivas
- Ayudar a otros contribuidores
- Mantener un ambiente inclusivo

## 🎓 Recursos para Nuevos Contribuidores

### Documentación Técnica
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Herramientas Recomendadas
- VS Code con extensiones de React/TypeScript
- Git con configuración de hooks
- Node Version Manager (nvm)

### Primeros Pasos
1. Revisar issues etiquetados como "good first issue"
2. Familiarizarse con la estructura del proyecto
3. Ejecutar la aplicación localmente
4. Hacer un pequeño cambio y crear un PR

## 📞 Contacto

Para preguntas sobre contribuciones:
- Crear un issue en GitHub
- Usar GitHub Discussions
- Contactar a los maintainers

¡Esperamos tus contribuciones para hacer de ConverGT una herramienta aún mejor para la comunicación sindical!

