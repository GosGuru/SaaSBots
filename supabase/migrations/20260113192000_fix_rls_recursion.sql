-- ============================================
-- FIX: Corregir recursión infinita en políticas RLS
-- ============================================

-- Eliminar políticas problemáticas
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can update their own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view team members" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- ============================================
-- FUNCIÓN AUXILIAR: Obtener tenant_id sin recursión
-- Usa SECURITY DEFINER para bypasear RLS
-- ============================================
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid()
$$;

-- ============================================
-- FUNCIÓN AUXILIAR: Obtener rol del usuario
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$;

-- ============================================
-- NUEVAS POLÍTICAS RLS: users (sin recursión)
-- ============================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Los usuarios pueden ver miembros de su tenant (usa función auxiliar)
CREATE POLICY "Users can view team members"
  ON users FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Los usuarios pueden insertar su propio perfil (para onboarding)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================
-- NUEVAS POLÍTICAS RLS: tenants (sin recursión)
-- ============================================

-- Los usuarios pueden ver su propio tenant
CREATE POLICY "Users can view own tenant"
  ON tenants FOR SELECT
  USING (id = get_user_tenant_id());

-- Los usuarios admin/owner pueden actualizar su tenant
CREATE POLICY "Admins can update own tenant"
  ON tenants FOR UPDATE
  USING (id = get_user_tenant_id() AND get_user_role() IN ('owner', 'admin'));

-- Cualquier usuario autenticado puede crear un tenant (para onboarding)
CREATE POLICY "Authenticated users can create tenant"
  ON tenants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- ACTUALIZAR POLÍTICAS DEPENDIENTES
-- ============================================

-- bot_configurations
DROP POLICY IF EXISTS "Users can view tenant configs" ON bot_configurations;
DROP POLICY IF EXISTS "Users can insert tenant configs" ON bot_configurations;
DROP POLICY IF EXISTS "Users can update tenant configs" ON bot_configurations;
DROP POLICY IF EXISTS "Users can delete tenant configs" ON bot_configurations;

CREATE POLICY "Users can view tenant configs"
  ON bot_configurations FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can insert tenant configs"
  ON bot_configurations FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id() AND get_user_role() IN ('owner', 'admin'));

CREATE POLICY "Users can update tenant configs"
  ON bot_configurations FOR UPDATE
  USING (tenant_id = get_user_tenant_id() AND get_user_role() IN ('owner', 'admin'));

CREATE POLICY "Users can delete tenant configs"
  ON bot_configurations FOR DELETE
  USING (tenant_id = get_user_tenant_id() AND get_user_role() IN ('owner', 'admin'));

-- services
DROP POLICY IF EXISTS "Users can manage tenant services" ON services;

CREATE POLICY "Users can view tenant services"
  ON services FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can manage tenant services"
  ON services FOR ALL
  USING (tenant_id = get_user_tenant_id() AND get_user_role() IN ('owner', 'admin'));

-- images
DROP POLICY IF EXISTS "Users can manage tenant images" ON images;

CREATE POLICY "Users can view tenant images"
  ON images FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can manage tenant images"
  ON images FOR ALL
  USING (tenant_id = get_user_tenant_id() AND get_user_role() IN ('owner', 'admin'));

-- conversations
DROP POLICY IF EXISTS "Users can view tenant conversations" ON conversations;

CREATE POLICY "Users can view tenant conversations"
  ON conversations FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- messages
DROP POLICY IF EXISTS "Users can view tenant messages" ON messages;

CREATE POLICY "Users can view tenant messages"
  ON messages FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- blocked_numbers
DROP POLICY IF EXISTS "Users can manage blocked numbers" ON blocked_numbers;

CREATE POLICY "Users can manage blocked numbers"
  ON blocked_numbers FOR ALL
  USING (tenant_id = get_user_tenant_id());

-- availability_schedules
DROP POLICY IF EXISTS "Users can manage availability" ON availability_schedules;

CREATE POLICY "Users can manage availability"
  ON availability_schedules FOR ALL
  USING (tenant_id = get_user_tenant_id());

-- audit_logs
DROP POLICY IF EXISTS "Users can view audit logs" ON audit_logs;

CREATE POLICY "Users can view audit logs"
  ON audit_logs FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- api_keys
DROP POLICY IF EXISTS "Users can manage API keys" ON api_keys;

CREATE POLICY "Users can view API keys"
  ON api_keys FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can manage API keys"
  ON api_keys FOR ALL
  USING (tenant_id = get_user_tenant_id() AND get_user_role() IN ('owner', 'admin'));
