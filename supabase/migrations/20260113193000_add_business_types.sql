-- ============================================
-- FIX: Actualizar constraint de business_type para soportar más industrias
-- ============================================

-- Eliminar las constraints actuales
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS valid_business_type;
ALTER TABLE industry_templates DROP CONSTRAINT IF EXISTS valid_business_type;

-- Crear nuevas constraints con más tipos de negocio
ALTER TABLE tenants ADD CONSTRAINT valid_business_type CHECK (
  business_type IN (
    'escort', 
    'dental', 
    'retail', 
    'restaurant',
    'ecommerce',
    'services',
    'healthcare',
    'education',
    'finance',
    'realestate',
    'hospitality',
    'technology',
    'other'
  )
);

ALTER TABLE industry_templates ADD CONSTRAINT valid_business_type CHECK (
  business_type IN (
    'escort', 
    'dental', 
    'retail', 
    'restaurant',
    'ecommerce',
    'services',
    'healthcare',
    'education',
    'finance',
    'realestate',
    'hospitality',
    'technology',
    'other'
  )
);
