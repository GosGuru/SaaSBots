# 🔧 Guía: Modificar Workflow n8n para Multi-Tenant

## Paso 1: Duplicar el Workflow Actual

1. Ve a n8n: https://n8n-n8n.ua4qkv.easypanel.host
2. Abre el workflow "V1 | Chat Bot WPP"
3. Click en los 3 puntos (...) → "Duplicate"
4. Renombrar a "V2 | SASbot Multi-Tenant"
5. **NO activar todavía**

---

## Paso 2: Agregar Nodo "Identificar Tenant"

Después del nodo "Escucha wpp", agregar un **HTTP Request**:

### Configuración del nodo:
```
Name: Identificar Tenant
Method: GET
URL: https://tu-app.vercel.app/api/n8n/identify-tenant
Query Parameters:
  - whatsapp_number: {{ $json.instance }}
Headers:
  - x-api-key: sasbot-n8n-webhook-secret-change-me
```

### Código del nodo (alternativa con Code node):
```javascript
// Obtener el número de WhatsApp de la instancia
const instance = $input.first().json.instance || $input.first().json.data?.instance;
const apiKey = "sasbot-n8n-webhook-secret-change-me";
const baseUrl = "https://tu-app.vercel.app";

const response = await fetch(
  `${baseUrl}/api/n8n/identify-tenant?whatsapp_number=${encodeURIComponent(instance)}`,
  {
    headers: {
      "x-api-key": apiKey
    }
  }
);

const data = await response.json();

if (!data.success) {
  throw new Error(`Tenant not found: ${data.message}`);
}

return [{
  json: {
    ...$input.first().json,
    tenant: data
  }
}];
```

---

## Paso 3: Agregar Nodo "Cargar Configuración"

Después de identificar el tenant:

### Configuración del nodo HTTP:
```
Name: Cargar Config Tenant
Method: GET
URL: https://tu-app.vercel.app/api/n8n/get-config
Query Parameters:
  - tenant_id: {{ $json.tenant.tenant_id }}
Headers:
  - x-api-key: sasbot-n8n-webhook-secret-change-me
```

---

## Paso 4: Modificar el System Prompt del AI Agent

El nodo "AI Agent" o "Conversador" debe usar el prompt dinámico:

### En el campo System Prompt:
```
{{ $('Cargar Config Tenant').item.json.system_prompt }}
```

O si prefieres un formato más controlado:
```
{{ $('Cargar Config Tenant').item.json.system_prompt }}

=== INFORMACIÓN ADICIONAL ===
Fecha actual: {{ $now.format('yyyy-MM-dd HH:mm') }}
Zona horaria: {{ $('Cargar Config Tenant').item.json.tenant.timezone }}

=== SERVICIOS ===
{{ $('Cargar Config Tenant').item.json.services_text }}

=== DISPONIBILIDAD ===
{{ $('Cargar Config Tenant').item.json.availability_text }}
```

---

## Paso 5: Modificar Redis para usar Prefijo por Tenant

### En el nodo "Redis Chat Memory":
```
Session Key: {{ $('Identificar Tenant').item.json.tenant.redis_prefix }}_{{ $('Normalizacion').item.json.user_number }}
```

### En el nodo "Push message buffer":
```
Key: {{ $('Identificar Tenant').item.json.tenant.redis_prefix }}_{{ $('Normalizacion').item.json.user_number }}_buffer
```

---

## Paso 6: Agregar Nodo "Guardar Mensaje"

Al final del flujo, después de enviar respuesta:

### Nodo HTTP Request:
```
Name: Guardar en Historial
Method: POST
URL: https://tu-app.vercel.app/api/n8n/log-message
Headers:
  - x-api-key: sasbot-n8n-webhook-secret-change-me
  - Content-Type: application/json
Body (JSON):
{
  "tenant_id": "{{ $('Identificar Tenant').item.json.tenant.tenant_id }}",
  "phone_number": "{{ $('Normalizacion').item.json.user_number }}",
  "contact_name": "{{ $('Normalizacion').item.json.contact_name }}",
  "message_type": "text",
  "content": "{{ $json.output }}",
  "direction": "outbound"
}
```

---

## Paso 7: Manejar Imágenes Dinámicas

### Cuando el bot necesite enviar imágenes:

1. Las imágenes están en: `$('Cargar Config Tenant').item.json.images`
2. Cada imagen tiene: `{ id, url, caption, alt_text }`

### Ejemplo de selección de imagen:
```javascript
const images = $('Cargar Config Tenant').item.json.images;
const randomImage = images[Math.floor(Math.random() * images.length)];

return [{
  json: {
    imageUrl: randomImage.url,
    caption: randomImage.caption || ""
  }
}];
```

---

## Diagrama del Flujo Modificado

```
┌─────────────┐
│ Escucha wpp │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Identificar     │◄── API: /api/n8n/identify-tenant
│ Tenant          │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Cargar Config   │◄── API: /api/n8n/get-config
│ Tenant          │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Code: Guard     │ (existente, sin cambios)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Normalizacion   │ (existente, sin cambios)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Redis Buffer    │◄── Usar prefijo: tenant.redis_prefix
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ AI Agent        │◄── System Prompt DINÁMICO
│ (Conversador)   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Enviar Texto    │ (existente)
│ / Imagen        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Guardar en      │──► API: /api/n8n/log-message
│ Historial       │
└─────────────────┘
```

---

## Variables de Entorno en n8n

Crea estas credenciales/variables en n8n:

```
SASBOT_API_URL = https://tu-app.vercel.app
SASBOT_API_KEY = sasbot-n8n-webhook-secret-change-me
```

Luego úsalas en los nodos:
```
{{ $env.SASBOT_API_URL }}/api/n8n/identify-tenant
```

---

## Testing

1. **Activar el workflow V2** (desactivar V1 primero)
2. **Enviar mensaje de prueba** al número de WhatsApp
3. **Verificar en Supabase** que:
   - Se identifica el tenant correcto
   - Se carga la configuración
   - Se guardan los mensajes

---

## Troubleshooting

### Error: "Tenant not found"
- Verificar que el número de WhatsApp está registrado en la tabla `tenants`
- Formato correcto: `+5491234567890`

### Error: "Invalid API key"
- Verificar que el header `x-api-key` coincide con `N8N_WEBHOOK_SECRET`

### Error: "Tenant is not active"
- El tenant tiene status `suspended` o `cancelled`
- Cambiar a `trial` o `active` en Supabase

---

## Próximos Pasos

1. ✅ Crear endpoints de API
2. ⬜ Configurar datos de prueba en Supabase
3. ⬜ Duplicar y modificar workflow
4. ⬜ Probar flujo completo
5. ⬜ Crear dashboard de configuración del bot
