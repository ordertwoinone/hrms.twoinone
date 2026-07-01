-- Seed system roles, the permission catalog, and role -> permission grants.
-- Idempotent (on conflict do nothing). Joins by key, never by generated id.

insert into public.roles (key, name, description, is_system) values
  ('super_admin','Super Admin','Full system access; manages users and settings.', true),
  ('admin','Admin','Administrative access across modules (no user management).', true),
  ('hr_manager','HR Manager','Manages employees, attendance, leave, and documents.', true),
  ('hr_executive','HR Executive','Day-to-day HR operations.', true),
  ('finance','Finance','Payroll and finance operations.', true),
  ('department_manager','Department Manager','Manages their department and approvals.', true),
  ('employee','Employee','Self-service access.', true)
on conflict (key) do nothing;

insert into public.permissions (key, resource, action, description) values
  ('user:view','user','view','View users'),
  ('user:create','user','create','Create users'),
  ('user:update','user','update','Update users'),
  ('user:delete','user','delete','Deactivate or delete users'),
  ('user:manage','user','manage','Full user management'),
  ('role:view','role','view','View roles'),
  ('role:manage','role','manage','Manage roles and permissions'),
  ('audit:view','audit','view','View audit logs'),
  ('settings:view','settings','view','View settings'),
  ('settings:manage','settings','manage','Manage settings'),
  ('employee:view','employee','view','View employees'),
  ('employee:create','employee','create','Create employees'),
  ('employee:update','employee','update','Update employees'),
  ('employee:delete','employee','delete','Delete employees'),
  ('department:view','department','view','View departments'),
  ('department:manage','department','manage','Manage departments'),
  ('attendance:view','attendance','view','View attendance'),
  ('attendance:manage','attendance','manage','Manage attendance'),
  ('leave:view','leave','view','View leave'),
  ('leave:request','leave','request','Request leave'),
  ('leave:approve','leave','approve','Approve leave'),
  ('payroll:view','payroll','view','View payroll'),
  ('payroll:process','payroll','process','Process payroll'),
  ('document:view','document','view','View documents'),
  ('document:manage','document','manage','Manage documents'),
  ('report:view','report','view','View reports')
on conflict (key) do nothing;

-- super_admin gets every permission
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.key = 'super_admin'
on conflict do nothing;

with mapping (role_key, permission_key) as (
  values
    ('admin','role:view'),('admin','audit:view'),('admin','settings:view'),('admin','settings:manage'),
    ('admin','employee:view'),('admin','employee:create'),('admin','employee:update'),('admin','employee:delete'),
    ('admin','department:view'),('admin','department:manage'),
    ('admin','attendance:view'),('admin','attendance:manage'),
    ('admin','leave:view'),('admin','leave:approve'),
    ('admin','payroll:view'),('admin','payroll:process'),
    ('admin','document:view'),('admin','document:manage'),
    ('admin','report:view'),
    ('hr_manager','employee:view'),('hr_manager','employee:create'),('hr_manager','employee:update'),('hr_manager','employee:delete'),
    ('hr_manager','department:view'),('hr_manager','department:manage'),
    ('hr_manager','attendance:view'),('hr_manager','attendance:manage'),
    ('hr_manager','leave:view'),('hr_manager','leave:approve'),
    ('hr_manager','document:view'),('hr_manager','document:manage'),
    ('hr_manager','payroll:view'),
    ('hr_manager','report:view'),
    ('hr_executive','employee:view'),('hr_executive','employee:create'),('hr_executive','employee:update'),
    ('hr_executive','department:view'),
    ('hr_executive','attendance:view'),('hr_executive','attendance:manage'),
    ('hr_executive','leave:view'),('hr_executive','leave:approve'),
    ('hr_executive','document:view'),('hr_executive','document:manage'),
    ('hr_executive','report:view'),
    ('finance','payroll:view'),('finance','payroll:process'),
    ('finance','employee:view'),
    ('finance','document:view'),
    ('finance','report:view'),
    ('department_manager','employee:view'),
    ('department_manager','department:view'),
    ('department_manager','attendance:view'),
    ('department_manager','leave:view'),('department_manager','leave:approve'),
    ('department_manager','report:view'),
    ('employee','attendance:view'),
    ('employee','leave:view'),('employee','leave:request'),
    ('employee','document:view')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from mapping m
join public.roles r on r.key = m.role_key
join public.permissions p on p.key = m.permission_key
on conflict do nothing;
