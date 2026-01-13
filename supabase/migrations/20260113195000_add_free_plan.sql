-- ============================================
-- FIX: Agregar 'free' a los planes de subscripción válidos
-- ============================================

-- Eliminar constraint actual
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS valid_subscription_plan;

-- Crear nueva constraint incluyendo 'free'
ALTER TABLE tenants ADD CONSTRAINT valid_subscription_plan CHECK (
  subscription_plan IN ('free', 'basic', 'pro', 'enterprise')
);
