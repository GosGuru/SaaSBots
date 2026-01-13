# 🚀 SASbot - Plan de Implementación Multi-Tenant

## Resumen Ejecutivo
Convertir el workflow hardcodeado en un sistema dinámico multi-tenant donde cada cliente tiene su propia configuración, prompt, servicios e imágenes almacenadas en Supabase.

---

## 📋 Checklist de Implementación

### Fase 1: Preparar Supabase ✅
- [x] Crear proyecto Supabase
- [x] Esquema de base de datos con RLS
- [x] Autenticación de usuarios
- [x] Dashboard básico funcionando

### Fase 2: API Endpoints para n8n
- [ ] Crear endpoint `/api/n8n/identify-tenant` - Identifica tenant por número WhatsApp
- [ ] Crear endpoint `/api/n8n/get-config` - Obtiene toda la configuración del bot
- [ ] Crear endpoint `/api/n8n/log-message` - Guarda mensajes en historial
- [ ] Crear endpoint `/api/n8n/get-services` - Lista servicios del tenant
- [ ] Crear endpoint `/api/n8n/get-images` - Lista imágenes del tenant

### Fase 3: Modificar Workflow n8n
- [ ] Duplicar workflow actual como "V2 - Multi-Tenant"
- [ ] Agregar nodo HTTP para identificar tenant
- [ ] Agregar nodo HTTP para cargar configuración
- [ ] Modificar System Prompt para ser dinámico
- [ ] Ajustar Redis para usar prefijo por tenant
- [ ] Modificar nodos de envío para usar credenciales dinámicas

### Fase 4: Dashboard - Configuración del Bot
- [ ] Página de configuración del perfil del bot
- [ ] Página de gestión de servicios
- [ ] Página de galería de imágenes
- [ ] Página de horarios/disponibilidad
- [ ] Página de conexión WhatsApp (Evolution API)

### Fase 5: Onboarding Automático
- [ ] Al crear tenant, duplicar workflow template en n8n
- [ ] Configurar webhook único por tenant
- [ ] Crear instancia en Evolution API (opcional)

---

## 🔧 Detalles Técnicos

### Endpoint: Identificar Tenant
```
GET /api/n8n/identify-tenant?whatsapp_number=+5491234567890

Response:
{
  "tenant_id": "uuid",
  "tenant_name": "Mi Empresa",
  "redis_prefix": "tenant_abc123",
  "is_active": true
}
```

### Endpoint: Obtener Configuración
```
GET /api/n8n/get-config?tenant_id=uuid

Response:
{
  "system_prompt": "Eres Andrea, una escort premium...",
  "personality": {
    "tone": "seductora",
    "language": "es"
  },
  "services": [...],
  "images": [...],
  "availability": {...},
  "rules": {
    "blocked_words": [...],
    "auto_responses": {...}
  }
}
```

### System Prompt Dinámico
```
{{system_prompt_template}}

=== INFORMACIÓN DEL PERFIL ===
Nombre: {{profile.nombre}}
Descripción: {{profile.descripcion}}
Ubicación: {{profile.ubicacion}}

=== SERVICIOS DISPONIBLES ===
{{#each services}}
- {{name}}: {{price}} {{currency}} ({{duration}} min)
{{/each}}

=== HORARIOS ===
{{availability_text}}

=== REGLAS ===
{{rules_text}}
```

---

## 📁 Estructura de Archivos a Crear

```
src/
├── app/
│   ├── api/
│   │   └── n8n/
│   │       ├── identify-tenant/
│   │       │   └── route.ts
│   │       ├── get-config/
│   │       │   └── route.ts
│   │       ├── log-message/
│   │       │   └── route.ts
│   │       ├── get-services/
│   │       │   └── route.ts
│   │       └── get-images/
│   │           └── route.ts
│   │
│   └── (dashboard)/
│       └── dashboard/
│           ├── bot/
│           │   ├── profile/
│           │   │   └── page.tsx      # Editar perfil del bot
│           │   ├── services/
│           │   │   └── page.tsx      # Gestionar servicios
│           │   ├── images/
│           │   │   └── page.tsx      # Galería de imágenes
│           │   ├── availability/
│           │   │   └── page.tsx      # Horarios
│           │   └── whatsapp/
│           │       └── page.tsx      # Conexión WhatsApp
│           └── conversations/
│               └── page.tsx          # Ver conversaciones
```

---

## 🔄 Flujo del Workflow n8n Modificado

### 1. Webhook Recibe Mensaje
```json
{
  "instance": "tenant_abc123",
  "sender": "+5491234567890",
  "message": "Hola, quiero información"
}
```

### 2. Identificar Tenant (HTTP Request)
```
GET https://tu-app.vercel.app/api/n8n/identify-tenant?whatsapp_number={{instance}}
```

### 3. Cargar Configuración (HTTP Request)
```
GET https://tu-app.vercel.app/api/n8n/get-config?tenant_id={{tenant_id}}
```

### 4. Construir Prompt (Set Node)
Combinar template + datos del tenant

### 5. AI Agent
Usar prompt dinámico + memoria Redis con prefijo

### 6. Enviar Respuesta
Usar credenciales del tenant para Evolution API

### 7. Guardar en Historial (HTTP Request)
```
POST https://tu-app.vercel.app/api/n8n/log-message
```

---

## 🎯 Próximos Pasos Inmediatos

1. **Crear los endpoints de API** para que n8n pueda consultar Supabase
2. **Poblar datos de prueba** en bot_configurations para tu tenant actual
3. **Duplicar el workflow** en n8n y empezar a modificarlo
4. **Probar el flujo completo** con un tenant de prueba

---

## 💡 Decisiones de Arquitectura

### Opción A: Un Webhook por Tenant (Actual)
- ✅ Más simple
- ❌ Difícil de escalar
- ❌ Cada tenant necesita su propio workflow

### Opción B: Webhook Maestro (Recomendado) ⭐
- ✅ Un solo workflow para todos
- ✅ Fácil mantenimiento
- ✅ Configuración 100% desde Supabase
- ❌ Más complejo inicialmente

### Opción C: Híbrido
- Webhook maestro para recibir
- Sub-workflows por tipo de industria
- Balance entre flexibilidad y mantenimiento

**Recomendación:** Empezar con **Opción B** - Es más trabajo inicial pero escala mejor.

---

## 📊 Estimación de Tiempo

| Tarea | Tiempo Estimado |
|-------|-----------------|
| Endpoints API | 2-3 horas |
| Datos de prueba | 30 min |
| Modificar workflow n8n | 3-4 horas |
| Dashboard configuración bot | 4-6 horas |
| Testing completo | 2 horas |
| **Total** | **12-16 horas** |

---

## 🔐 Seguridad

1. **API Keys** - Los endpoints de n8n deben validar un API key secreto
2. **Rate Limiting** - Limitar requests por tenant
3. **Validación** - Verificar que el tenant está activo y pagando
4. **Logs** - Registrar todas las llamadas para debugging

