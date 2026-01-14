-- ============================================
-- SEED: Datos de prueba para Andreia
-- Ejecutar después de la migración y el template
-- ============================================

-- IMPORTANTE: Reemplaza 'TU-TENANT-ID' con el ID real de tu tenant
-- Para obtenerlo, ejecuta primero: SELECT id, name, slug FROM tenants;

-- Variable para el tenant_id (reemplazar con el valor real)
-- Ejemplo: DO $$ DECLARE tenant_uuid UUID := 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

DO $$ 
DECLARE 
  tenant_uuid UUID;
BEGIN
  -- Obtener el primer tenant (ajustar si tienes múltiples)
  SELECT id INTO tenant_uuid FROM tenants LIMIT 1;
  
  IF tenant_uuid IS NULL THEN
    RAISE EXCEPTION 'No se encontró ningún tenant. Primero completa el onboarding.';
  END IF;

  -- 1. Actualizar tenant con dirección y configuración
  UPDATE tenants SET
    address = 'Calle Pedro Muguruza 6',
    address_instructions = 'Cuando llegues avísame y abre la puerta blanca, no llames al timbre',
    timezone = 'Europe/Madrid',
    locale = 'es',
    business_type = 'escort'
  WHERE id = tenant_uuid;

  RAISE NOTICE 'Tenant actualizado: %', tenant_uuid;

  -- 2. Crear perfil del bot (si no existe)
  INSERT INTO bot_profiles (
    tenant_id, 
    bot_name, 
    bot_age, 
    bot_nationality, 
    bot_gender, 
    physical_description, 
    personality_traits, 
    tone_description,
    communication_style,
    role_description
  ) VALUES (
    tenant_uuid,
    'Andreia',
    28,
    'portuguesa',
    'female',
    '28 años, portuguesa. 160 cm, 56 kg, 90-60-90. Cabello platinado, ojos café, piel blanca. Delgada, busto grande, vedette. Depilación completa, tatuajes.',
    'elegante, educada y sofisticada. Dominante cuando la situación lo amerita, pero siempre mantienes tu clase y elegancia',
    'cercana pero sofisticada, coqueta y seductora. Elegante y educada. Dominante sutil. Natural y humana. Sin mensajes largos, sin modo corporativo',
    'informal',
    'Trabajas ofreciendo compañía íntima y encuentros personalizados. Con tu mirada atractiva y curvas preciosas, buscas crear conexiones genuinas con personas que compartan tus gustos y aficiones.'
  )
  ON CONFLICT (tenant_id) DO UPDATE SET
    bot_name = EXCLUDED.bot_name,
    bot_age = EXCLUDED.bot_age,
    bot_nationality = EXCLUDED.bot_nationality,
    physical_description = EXCLUDED.physical_description,
    personality_traits = EXCLUDED.personality_traits,
    tone_description = EXCLUDED.tone_description,
    role_description = EXCLUDED.role_description,
    updated_at = NOW();

  RAISE NOTICE 'Bot profile creado/actualizado';

  -- 3. Crear servicios/tarifas (eliminar existentes primero)
  DELETE FROM services WHERE tenant_id = tenant_uuid;
  
  INSERT INTO services (tenant_id, name, short_name, duration_minutes, price, currency, display_order, is_active) VALUES
    (tenant_uuid, 'Media hora', '30min/media hora', 30, 80, 'EUR', 1, TRUE),
    (tenant_uuid, 'Una hora', '1h', 60, 140, 'EUR', 2, TRUE);

  RAISE NOTICE 'Servicios creados';

  -- 4. Agregar números bloqueados (eliminar existentes primero)
  DELETE FROM blocked_numbers WHERE tenant_id = tenant_uuid;
  
  INSERT INTO blocked_numbers (tenant_id, phone_number, reason) VALUES
    (tenant_uuid, '34604372619', 'Bloqueado'),
    (tenant_uuid, '34617954209', 'Bloqueado'),
    (tenant_uuid, '34640966000', 'Bloqueado'),
    (tenant_uuid, '34633304054', 'Bloqueado'),
    (tenant_uuid, '34604863592', 'Bloqueado'),
    (tenant_uuid, '34604256966', 'Bloqueado'),
    (tenant_uuid, '34686589310', 'Bloqueado'),
    (tenant_uuid, '447506712426', 'Bloqueado');

  RAISE NOTICE 'Números bloqueados agregados';

  -- 5. Asignar el template de prompt al tenant
  UPDATE tenants SET
    prompt_template_id = (
      SELECT id FROM prompt_templates 
      WHERE business_type = 'escort' AND is_default = TRUE 
      LIMIT 1
    )
  WHERE id = tenant_uuid;

  RAISE NOTICE 'Template de prompt asignado';

  -- Resumen final
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SEED completado para tenant: %', tenant_uuid;
  RAISE NOTICE '========================================';
  
END $$;

-- Verificar los datos insertados
SELECT 'TENANT' as tipo, t.id, t.name, t.address, t.business_type, t.timezone
FROM tenants t;

SELECT 'BOT PROFILE' as tipo, bp.bot_name, bp.bot_age, bp.bot_nationality, bp.personality_traits
FROM bot_profiles bp;

SELECT 'SERVICES' as tipo, s.name, s.short_name, s.price, s.currency
FROM services s;

SELECT 'BLOCKED NUMBERS' as tipo, COUNT(*) as total
FROM blocked_numbers;

SELECT 'PROMPT TEMPLATE' as tipo, pt.name, pt.business_type
FROM prompt_templates pt WHERE pt.is_default = TRUE AND pt.business_type = 'escort';
