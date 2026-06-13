# SECTION 2 — DATABASE DOCUMENTATION

# 2.1 Full Schema

### Table: `admin_config`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | [NEEDS CLARIFICATION] |
| `owner_id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `setup_completed` | `boolean` | NO | `false` | [NEEDS CLARIFICATION] |
| `default_shake_amount` | `bigint` | NO | `0` | [NEEDS CLARIFICATION] |
| `timezone` | `character varying` | NO | `'Asia/Kolkata'::character varying` | [NEEDS CLARIFICATION] |
| `low_stock_threshold` | `integer` | NO | `10` | [NEEDS CLARIFICATION] |
| `discount_alert_pct` | `integer` | NO | `30` | [NEEDS CLARIFICATION] |
| `updated_at` | `timestamp with time zone` | NO | `now()` | [NEEDS CLARIFICATION] |
| `club_name` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Foreign Key** (`admin_config_owner_id_fkey`): `FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE`
- **Unique** (`admin_config_owner_id_key`): `UNIQUE (owner_id)`
- **Primary Key** (`admin_config_pkey`): `PRIMARY KEY (id)`

### Table: `attendance`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | [NEEDS CLARIFICATION] |
| `owner_id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `customer_id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `attendance_date` | `date` | NO | `null` | [NEEDS CLARIFICATION] |
| `type` | `character varying` | NO | `null` | [NEEDS CLARIFICATION] |
| `shake_amount` | `bigint` | NO | `null` | [NEEDS CLARIFICATION] |
| `recorded_by` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `created_at` | `timestamp with time zone` | NO | `now()` | [NEEDS CLARIFICATION] |
| `is_deleted` | `boolean` | NO | `false` | [NEEDS CLARIFICATION] |
| `deleted_at` | `timestamp with time zone` | YES | `null` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Foreign Key** (`attendance_customer_id_fkey`): `FOREIGN KEY (customer_id) REFERENCES customers(id)`
- **Unique** (`attendance_owner_id_customer_id_attendance_date_key`): `UNIQUE (owner_id, customer_id, attendance_date)`
- **Foreign Key** (`attendance_owner_id_fkey`): `FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE`
- **Primary Key** (`attendance_pkey`): `PRIMARY KEY (id)`
- **Foreign Key** (`attendance_recorded_by_fkey`): `FOREIGN KEY (recorded_by) REFERENCES users(id)`
- **Check** (`attendance_type_check`): `CHECK (((type)::text = ANY ((ARRAY['default'::character varying, 'custom'::character varying])::text[])))`
- **Foreign Key** (`fk_attendance_customer_id`): `FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE`

**Indexes:**
- `idx_att_owner_date`: `CREATE INDEX idx_att_owner_date ON public.attendance USING btree (owner_id, attendance_date)`

### Table: `audit_log`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | [NEEDS CLARIFICATION] |
| `actor_id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `action` | `character varying` | NO | `null` | [NEEDS CLARIFICATION] |
| `table_name` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |
| `record_id` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |
| `old_json` | `jsonb` | YES | `null` | [NEEDS CLARIFICATION] |
| `new_json` | `jsonb` | YES | `null` | [NEEDS CLARIFICATION] |
| `created_at` | `timestamp with time zone` | NO | `now()` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Foreign Key** (`audit_log_actor_id_fkey`): `FOREIGN KEY (actor_id) REFERENCES users(id)`
- **Primary Key** (`audit_log_pkey`): `PRIMARY KEY (id)`

**Indexes:**
- `idx_audit_actor`: `CREATE INDEX idx_audit_actor ON public.audit_log USING btree (actor_id, created_at)`

### Table: `backup_logs`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | [NEEDS CLARIFICATION] |
| `owner_id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `backup_type` | `character varying` | NO | `null` | [NEEDS CLARIFICATION] |
| `file_name` | `character varying` | NO | `null` | [NEEDS CLARIFICATION] |
| `storage_provider` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |
| `file_url` | `text` | YES | `null` | [NEEDS CLARIFICATION] |
| `file_size` | `bigint` | YES | `null` | [NEEDS CLARIFICATION] |
| `status` | `character varying` | NO | `null` | [NEEDS CLARIFICATION] |
| `created_by` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |
| `notes` | `text` | YES | `null` | [NEEDS CLARIFICATION] |
| `restore_status` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |
| `restore_at` | `timestamp with time zone` | YES | `null` | [NEEDS CLARIFICATION] |
| `created_at` | `timestamp with time zone` | NO | `now()` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Foreign Key** (`backup_logs_owner_id_fkey`): `FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE`
- **Primary Key** (`backup_logs_pkey`): `PRIMARY KEY (id)`

**Indexes:**
- `idx_backup_owner`: `CREATE INDEX idx_backup_owner ON public.backup_logs USING btree (owner_id, created_at DESC)`

### Table: `customers`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | [NEEDS CLARIFICATION] |
| `owner_id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `name` | `character varying` | NO | `null` | [NEEDS CLARIFICATION] |
| `phone` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |
| `member_code` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |
| `joined_at` | `date` | NO | `CURRENT_DATE` | [NEEDS CLARIFICATION] |
| `is_active` | `boolean` | NO | `true` | [NEEDS CLARIFICATION] |
| `created_at` | `timestamp with time zone` | NO | `now()` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Foreign Key** (`customers_owner_id_fkey`): `FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE`
- **Primary Key** (`customers_pkey`): `PRIMARY KEY (id)`

**Indexes:**
- `idx_customers_owner`: `CREATE INDEX idx_customers_owner ON public.customers USING btree (owner_id)`

### Table: `migrations`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `integer` | NO | `nextval('migrations_id_seq'::regclass)` | [NEEDS CLARIFICATION] |
| `name` | `text` | YES | `null` | [NEEDS CLARIFICATION] |
| `executed_at` | `timestamp without time zone` | YES | `CURRENT_TIMESTAMP` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Unique** (`migrations_name_key`): `UNIQUE (name)`
- **Primary Key** (`migrations_pkey`): `PRIMARY KEY (id)`

### Table: `notifications`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | [NEEDS CLARIFICATION] |
| `user_id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `type` | `character varying` | NO | `null` | [NEEDS CLARIFICATION] |
| `title` | `character varying` | NO | `null` | [NEEDS CLARIFICATION] |
| `body` | `text` | NO | `null` | [NEEDS CLARIFICATION] |
| `data` | `jsonb` | YES | `null` | [NEEDS CLARIFICATION] |
| `read_at` | `timestamp with time zone` | YES | `null` | [NEEDS CLARIFICATION] |
| `created_at` | `timestamp with time zone` | NO | `now()` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Primary Key** (`notifications_pkey`): `PRIMARY KEY (id)`
- **Foreign Key** (`notifications_user_id_fkey`): `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`

**Indexes:**
- `idx_notif_user`: `CREATE INDEX idx_notif_user ON public.notifications USING btree (user_id, created_at)`

### Table: `password_resets`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | [NEEDS CLARIFICATION] |
| `user_id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `expires_at` | `timestamp with time zone` | NO | `null` | [NEEDS CLARIFICATION] |
| `used_at` | `timestamp with time zone` | YES | `null` | [NEEDS CLARIFICATION] |
| `created_at` | `timestamp with time zone` | NO | `now()` | [NEEDS CLARIFICATION] |
| `token_hash` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Primary Key** (`password_resets_pkey`): `PRIMARY KEY (id)`
- **Unique** (`password_resets_token_hash_key`): `UNIQUE (token_hash)`
- **Foreign Key** (`password_resets_user_id_fkey`): `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`

### Table: `product_variants`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `integer` | NO | `nextval('product_variants_id_seq'::regclass)` | [NEEDS CLARIFICATION] |
| `product_id` | `integer` | YES | `null` | [NEEDS CLARIFICATION] |
| `flavor` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |
| `vp` | `real` | YES | `0` | [NEEDS CLARIFICATION] |
| `sp` | `real` | YES | `0` | [NEEDS CLARIFICATION] |
| `is_active` | `integer` | YES | `1` | [NEEDS CLARIFICATION] |
| `owner_id` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Primary Key** (`product_variants_pkey`): `PRIMARY KEY (id)`
- **Unique** (`unique_product_variant_attrs`): `UNIQUE (product_id, flavor, vp, sp, owner_id)`

**Indexes:**
- `idx_product_variants_owner`: `CREATE INDEX idx_product_variants_owner ON public.product_variants USING btree (owner_id)`

### Table: `product_versions`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `product_id` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |
| `vendor_price` | `text` | YES | `null` | [NEEDS CLARIFICATION] |
| `is_active` | `boolean` | YES | `null` | [NEEDS CLARIFICATION] |
| `effective_from` | `timestamp with time zone` | YES | `null` | [NEEDS CLARIFICATION] |
| `effective_to` | `timestamp with time zone` | YES | `null` | [NEEDS CLARIFICATION] |
| `created_by` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |
| `volume_points` | `text` | YES | `null` | [NEEDS CLARIFICATION] |
| `version_label` | `text` | YES | `null` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Foreign Key** (`fk_product_versions_product_id`): `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`
- **Primary Key** (`product_versions_pkey`): `PRIMARY KEY (id)`

### Table: `products`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `owner_id` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |
| `name` | `text` | YES | `null` | [NEEDS CLARIFICATION] |
| `created_at` | `timestamp with time zone` | YES | `null` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Primary Key** (`products_pkey`): `PRIMARY KEY (id)`

### Table: `sale_items`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | [NEEDS CLARIFICATION] |
| `sale_id` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |
| `product_version_id` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |
| `variant_id` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |
| `quantity` | `integer` | YES | `null` | [NEEDS CLARIFICATION] |
| `price_charged` | `text` | YES | `null` | [NEEDS CLARIFICATION] |
| `standard_price_snap` | `text` | YES | `null` | [NEEDS CLARIFICATION] |
| `vendor_price_snap` | `text` | YES | `null` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Foreign Key** (`fk_sale_items_sale_id`): `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE`
- **Primary Key** (`sale_items_pkey`): `PRIMARY KEY (id)`

### Table: `sales`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | [NEEDS CLARIFICATION] |
| `owner_id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `customer_id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `sale_date` | `date` | NO | `null` | [NEEDS CLARIFICATION] |
| `created_at` | `timestamp with time zone` | NO | `now()` | [NEEDS CLARIFICATION] |
| `recorded_by` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `is_deleted` | `boolean` | NO | `false` | [NEEDS CLARIFICATION] |
| `deleted_at` | `timestamp with time zone` | YES | `null` | [NEEDS CLARIFICATION] |
| `deleted_by` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Foreign Key** (`fk_sales_customer_id`): `FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE`
- **Foreign Key** (`sales_customer_id_fkey`): `FOREIGN KEY (customer_id) REFERENCES customers(id)`
- **Foreign Key** (`sales_deleted_by_fkey`): `FOREIGN KEY (deleted_by) REFERENCES users(id)`
- **Foreign Key** (`sales_owner_id_fkey`): `FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE`
- **Primary Key** (`sales_pkey`): `PRIMARY KEY (id)`
- **Foreign Key** (`sales_recorded_by_fkey`): `FOREIGN KEY (recorded_by) REFERENCES users(id)`

**Indexes:**
- `idx_sales_owner_date`: `CREATE INDEX idx_sales_owner_date ON public.sales USING btree (owner_id, sale_date)`
- `idx_sales_customer`: `CREATE INDEX idx_sales_customer ON public.sales USING btree (customer_id)`

### Table: `sessions`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | [NEEDS CLARIFICATION] |
| `user_id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `expires_at` | `timestamp with time zone` | NO | `null` | [NEEDS CLARIFICATION] |
| `invalidated_at` | `timestamp with time zone` | YES | `null` | [NEEDS CLARIFICATION] |
| `ip_address` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |
| `device_info` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |
| `last_seen_at` | `timestamp with time zone` | NO | `now()` | [NEEDS CLARIFICATION] |
| `created_at` | `timestamp with time zone` | NO | `now()` | [NEEDS CLARIFICATION] |
| `tenant_id` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |
| `token_hash` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Primary Key** (`sessions_pkey`): `PRIMARY KEY (id)`
- **Foreign Key** (`sessions_user_id_fkey`): `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`

**Indexes:**
- `idx_sessions_user`: `CREATE INDEX idx_sessions_user ON public.sessions USING btree (user_id)`
- `idx_sessions_expires`: `CREATE INDEX idx_sessions_expires ON public.sessions USING btree (expires_at) WHERE (invalidated_at IS NULL)`

### Table: `settings`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `integer` | NO | `nextval('settings_id_seq'::regclass)` | [NEEDS CLARIFICATION] |
| `key` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |
| `value` | `text` | YES | `null` | [NEEDS CLARIFICATION] |
| `owner_id` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Unique** (`settings_key_owner_id_key`): `UNIQUE (key, owner_id)`
- **Primary Key** (`settings_pkey`): `PRIMARY KEY (id)`

### Table: `stock`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `product_version_id` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |
| `owner_id` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |
| `quantity` | `integer` | YES | `null` | [NEEDS CLARIFICATION] |
| `vendor_price_snap` | `text` | YES | `null` | [NEEDS CLARIFICATION] |
| `added_at` | `timestamp with time zone` | YES | `null` | [NEEDS CLARIFICATION] |
| `added_by` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |
| `variant_id` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Foreign Key** (`fk_stock_product_version_id`): `FOREIGN KEY (product_version_id) REFERENCES product_versions(id) ON DELETE CASCADE`
- **Primary Key** (`stock_pkey`): `PRIMARY KEY (id)`

### Table: `stock_entries`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `integer` | NO | `nextval('stock_entries_id_seq'::regclass)` | [NEEDS CLARIFICATION] |
| `owner_id` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |
| `variant_id` | `integer` | YES | `null` | [NEEDS CLARIFICATION] |
| `quantity_added` | `integer` | YES | `null` | [NEEDS CLARIFICATION] |
| `purchase_price` | `real` | YES | `null` | [NEEDS CLARIFICATION] |
| `added_by` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |
| `created_at` | `timestamp without time zone` | YES | `CURRENT_TIMESTAMP` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Primary Key** (`stock_entries_pkey`): `PRIMARY KEY (id)`
- **Foreign Key** (`stock_entries_variant_id_fkey`): `FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE`

### Table: `users`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `gen_random_uuid()` | [NEEDS CLARIFICATION] |
| `email` | `character varying` | NO | `null` | [NEEDS CLARIFICATION] |
| `password_hash` | `character varying` | NO | `null` | [NEEDS CLARIFICATION] |
| `role` | `character varying` | NO | `null` | [NEEDS CLARIFICATION] |
| `owner_id` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |
| `is_active` | `boolean` | NO | `true` | [NEEDS CLARIFICATION] |
| `failed_login_count` | `integer` | NO | `0` | [NEEDS CLARIFICATION] |
| `locked_until` | `timestamp with time zone` | YES | `null` | [NEEDS CLARIFICATION] |
| `last_login_at` | `timestamp with time zone` | YES | `null` | [NEEDS CLARIFICATION] |
| `force_password_change` | `boolean` | NO | `false` | [NEEDS CLARIFICATION] |
| `created_at` | `timestamp with time zone` | NO | `now()` | [NEEDS CLARIFICATION] |
| `created_by` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Foreign Key** (`users_created_by_fkey`): `FOREIGN KEY (created_by) REFERENCES users(id)`
- **Unique** (`users_email_key`): `UNIQUE (email)`
- **Foreign Key** (`users_owner_id_fkey`): `FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL`
- **Primary Key** (`users_pkey`): `PRIMARY KEY (id)`
- **Check** (`users_role_check`): `CHECK (((role)::text = ANY ((ARRAY['master'::character varying, 'admin'::character varying, 'user'::character varying])::text[])))`

### Table: `variant_rollback_archive`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `integer` | NO | `nextval('variant_rollback_archive_id_seq'::regclass)` | [NEEDS CLARIFICATION] |
| `name` | `character varying` | YES | `null` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Primary Key** (`variant_rollback_archive_pkey`): `PRIMARY KEY (id)`

### Table: `variants`

| Column Name | Data Type | Nullable | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | `null` | [NEEDS CLARIFICATION] |
| `owner_id` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |
| `name` | `text` | YES | `null` | [NEEDS CLARIFICATION] |
| `is_active` | `boolean` | YES | `null` | [NEEDS CLARIFICATION] |
| `created_at` | `timestamp with time zone` | YES | `null` | [NEEDS CLARIFICATION] |
| `sku` | `text` | YES | `null` | [NEEDS CLARIFICATION] |
| `product_version_id` | `uuid` | YES | `null` | [NEEDS CLARIFICATION] |
| `low_stock_threshold` | `integer` | YES | `5` | [NEEDS CLARIFICATION] |
| `alert_enabled` | `boolean` | YES | `true` | [NEEDS CLARIFICATION] |

**Constraints:**
- **Primary Key** (`variants_pkey`): `PRIMARY KEY (id)`

**Indexes:**
- `unique_variant_name_per_version`: `CREATE UNIQUE INDEX unique_variant_name_per_version ON public.variants USING btree (product_version_id, lower(TRIM(BOTH FROM name)))`
- `unique_variant_sku`: `CREATE UNIQUE INDEX unique_variant_sku ON public.variants USING btree (sku)`


## 2.2 Entity Relationship Summary

The database uses `users` (or `master_sessions`) as the highest level authentication.
Each `user` (often acting as the `owner_id` or `created_by`) owns `products` and `customers`.

`products` can have multiple `product_versions` (to track price changes over time).
Each `product_version` can have multiple `variants` (flavours or types like 'Choco', 'Paan').
Each `variant` acts as a unique stockable item.

`stock` entries directly reference `product_versions` or `variants` to increase inventory levels.

`sales` are linked to a `customer` and an `owner_id`.
Each `sale` has multiple `sale_items`, which link to the specific `variant` sold.

`attendance` tracks daily visits for `customers`.

### ASCII Diagram

```text
users (1) 
  │
  ├─── (many) ──→ products (1) ──→ (many) product_versions (1) ──→ (many) variants
  │                                           │
  ├─── (many) ──→ customers (1)               │
  │                 │                         └── (many) stock
  │                 └── (many) attendance
  │
  └─── (many) ──→ sales (1) ──→ (many) sale_items (many) ──→ (1) variants
```

---

## 2.3 Every Database Query

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 10)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 17)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 26)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 29)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 36)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 42)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\addConstraints.js` (Line 45)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\add_club_name.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS club_name VARCHAR(100);`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\add_club_name.js` (Line 9)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\add_club_name_column.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS club_name VARCHAR(100)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\add_last_activity_at.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\add_setting.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const check = await db.query(`SELECT id FROM settings WHERE key = 'SYSTEM_LOW_STOCK_THRESHOLD'`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\add_setting.js` (Line 8)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(`INSERT INTO settings (key, value) VALUES ('SYSTEM_LOW_STOCK_THRESHOLD', '10')`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\alter.js` (Line 18)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(sql);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\alter_password_resets.js` (Line 11)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS token_hash VARCHAR(255) UNIQUE;`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\analyze_sales.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const salesRes = await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\analyze_stock.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const stockRes = await pool.query('SELECT product_version_id, quantity FROM stock');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\analyze_stock.js` (Line 8)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const salesRes = await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\checkDuplicates.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const stock = await db.query('SELECT s.id, s.product_version_id, s.quantity, pv.product_id FROM stock s JOIN product_versions pv ON s.product_version_id = pv.id WHERE s.owner_id = $1', [owner]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\checkDuplicates.js` (Line 7)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const pv = await db.query('SELECT pv.id, pv.product_id, p.name FROM product_versions pv JOIN products p ON pv.product_id = p.id WHERE p.owner_id = $1', [owner]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\checkDuplicates.js` (Line 9)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const flavours = await db.query('SELECT id, product_id, name FROM flavours WHERE owner_id = $1', [owner]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\checkFlavours.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await db.query(`SELECT * FROM flavours`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\checkFunc.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await db.query(`SELECT pg_get_functiondef('create_sale_atomic'::regproc)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\checkOwner.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query("SELECT id, owner_id FROM users WHERE email = 'hasieeyy4444@gmail.com'");
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\checkProductConstraints.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\checkSaleItems.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const r = await db.query('SELECT count(*) as total, count(flavour_id) as with_flavour FROM sale_items');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\checkSales.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const r = await db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\checkStock.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query('SELECT * FROM stock WHERE owner_id = $1', [owner]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\checkStockColumns.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'stock'`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\checkUserProducts.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query('SELECT pv.id as pv_id, p.owner_id, p.name, f.name as flavour FROM product_versions pv JOIN products p ON pv.product_id = p.id LEFT JOIN flavours f ON f.product_id = p.id WHERE p.owner_id = $1', [owner]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\check_admins.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await db.query(`SELECT email FROM users WHERE role = 'admin'`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\check_attendance.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await pool.query('SELECT * FROM attendance');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\check_constraints.js` (Line 10)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\check_db.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const r1 = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\check_db.js` (Line 8)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const r2 = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='product_versions'");
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\check_db.js` (Line 11)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const r3 = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='products'");
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\check_db.js` (Line 14)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const r4 = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='variants'");
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\check_db_id.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const r = await db.query(`SELECT tc.constraint_type, tc.table_name, kcu.column_name
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\check_nulls.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\check_stock.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await pool.query('SELECT id, product_version_id, quantity FROM stock WHERE quantity < 0');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 28)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 31)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS users (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 49)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 50)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 51)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 57)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const { rows: adminRows } = await client.query(`SELECT id FROM users WHERE username = $1`, ['admin']);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 60)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`, ['admin', hash, 'admin']);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 63)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const { rows: userRows } = await client.query(`SELECT id FROM users WHERE username = $1`, ['user']);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 66)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`, ['user', hash, 'user']);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 70)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS products (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 80)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS product_variants (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 91)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS stock (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 99)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS sales (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 109)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS sale_items (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 121)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS settings (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 130)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS attendance (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 141)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS login_history (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 154)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS refresh_tokens (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 163)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS backup_logs (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 180)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 181)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 182)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 183)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_name ON attendance(name)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 184)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 187)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_products_owner ON products(owner_id)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 188)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_product_variants_owner ON product_variants(owner_id)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 189)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_stock_owner ON stock(owner_id)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 190)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_owner ON sales(owner_id)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 191)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_owner_date ON sales(owner_id, date)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 192)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sale_items_owner ON sale_items(owner_id)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 193)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_owner ON attendance(owner_id)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 195)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\config\db.js` (Line 197)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\create_backup_logs.js` (Line 23)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(sql);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\db.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
query: (text, params) => pool.query(text, params),
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\debug_attendance.js` (Line 9)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
let res = await pool.query('SELECT count(*) FROM attendance');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\debug_attendance.js` (Line 13)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
res = await pool.query('SELECT count(*) FROM attendance WHERE is_deleted = false');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\debug_attendance.js` (Line 17)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
res = await pool.query('SELECT count(*) FROM attendance a JOIN customers c ON a.customer_id = c.id WHERE a.is_deleted = false');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\debug_attendance.js` (Line 21)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
res = await pool.query('SELECT count(*) FROM attendance a JOIN users u ON a.recorded_by = u.id WHERE a.is_deleted = false');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\debug_attendance.js` (Line 25)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
res = await pool.query('SELECT is_deleted, deleted_at FROM attendance LIMIT 3');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\debug_sales.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
let res = await pool.query('SELECT count(*) FROM sales');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\debug_sales.js` (Line 9)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
res = await pool.query('SELECT count(*) FROM sales WHERE is_deleted = false');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\debug_sales.js` (Line 12)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
res = await pool.query('SELECT is_deleted, deleted_at FROM sales LIMIT 3');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\debug_timestamps.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
let res = await pool.query('SELECT is_deleted, deleted_at FROM attendance WHERE is_deleted = true LIMIT 5');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\debug_timestamps.js` (Line 9)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
res = await pool.query('SELECT is_deleted, deleted_at FROM sales WHERE is_deleted = true LIMIT 5');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\debug_timing.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res1 = await pool.query('SELECT created_at, is_deleted FROM attendance WHERE is_deleted = false');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\debug_timing.js` (Line 9)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res2 = await pool.query('SELECT created_at, is_deleted FROM attendance WHERE is_deleted = true LIMIT 3');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 11)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const stockRes = await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 24)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`UPDATE stock SET quantity = $1 WHERE id = $2`, [row.total_qty, primaryId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 28)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM stock WHERE id = $1`, [dup]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 35)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const productsRes = await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 49)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`UPDATE product_versions SET product_id = $1 WHERE product_id = $2`, [primaryId, dup]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 51)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`UPDATE flavours SET product_id = $1 WHERE product_id = $2`, [primaryId, dup]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 53)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM products WHERE id = $1`, [dup]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 60)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const activeVersionsRes = await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 74)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`UPDATE product_versions SET is_active = false WHERE id = $1`, [dup]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 81)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const flavoursRes = await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 95)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`UPDATE sale_items SET flavour_id = $1 WHERE flavour_id = $2`, [primaryId, dup]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 97)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM flavours WHERE id = $1`, [dup]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 102)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\deduplicate.js` (Line 105)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\delete_f1.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await db.query(`DELETE FROM products WHERE name = 'Formula 1 Shake'`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\drop_constraint.js` (Line 11)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE "product_variants" DROP CONSTRAINT IF EXISTS "unique_product_flavor_owner";`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 35)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const hashRes = await pool.query("SELECT crypt('password123', gen_salt('bf')) as hash");
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 38)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
let userRes = await pool.query("SELECT id FROM users WHERE email = 'e2e_admin@example.com'");
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 40)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
userRes = await pool.query("INSERT INTO users (email, password_hash, role) VALUES ('e2e_admin@example.com', $1, 'admin') RETURNING id", [hash]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 43)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query("UPDATE users SET password_hash = $1 WHERE email = 'e2e_admin@example.com'", [hash]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 53)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const oldProducts = await pool.query("SELECT id FROM products WHERE name = 'E2E Shake'");
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 57)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM sale_items WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id = $1)", [pId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 58)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM sales WHERE id NOT IN (SELECT sale_id FROM sale_items)"); // cleanup empty sales
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 59)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM stock WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id = $1)", [pId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 60)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM product_versions WHERE product_id = $1", [pId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 61)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM products WHERE id = $1", [pId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 70)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const prodDb = await pool.query("SELECT id FROM product_versions WHERE product_id = $1 AND is_active = true", [productId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 78)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const custId = cRes.data.customer_id || (await pool.query("SELECT id FROM customers LIMIT 1")).rows[0].id;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 95)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const prodDb2 = await pool.query("SELECT id FROM product_versions WHERE product_id = $1 AND is_active = true", [productId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 131)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 144)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const oldProducts2 = await pool.query("SELECT id FROM products WHERE name = 'E2E Shake'");
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 147)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM sale_items WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id = $1)", [pId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 148)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM stock WHERE product_version_id IN (SELECT id FROM product_versions WHERE product_id = $1)", [pId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 149)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM product_versions WHERE product_id = $1", [pId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\e2e.js` (Line 150)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query("DELETE FROM products WHERE id = $1", [pId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.queries.js` (Line 3)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.queries.js` (Line 26)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.queries.js` (Line 47)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT default_shake_amount FROM admin_config WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.queries.js` (Line 54)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.queries.js` (Line 73)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.queries.js` (Line 84)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.service.js` (Line 13)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
result = await db.query(query.text, query.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.service.js` (Line 16)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
result = await db.query(query.text, query.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.service.js` (Line 39)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const conf = await db.query(confQuery.text, confQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.service.js` (Line 46)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const attRes = await db.query(attQuery.text, attQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\attendance\attendance.service.js` (Line 73)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query(updateQuery.text, updateQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT * FROM users WHERE email = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 8)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT * FROM users WHERE id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 14)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE users SET failed_login_count = $1, locked_until = $2 WHERE id = $3`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 18)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE users SET failed_login_count = 0, locked_until = NULL, last_login_at = NOW() WHERE id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 24)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `INSERT INTO sessions (user_id, token_hash, tenant_id, expires_at, ip_address, device_info) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 28)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT s.id as session_id, s.expires_at, u.id, u.email, u.role, u.owner_id, u.is_active, u.force_password_change
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 35)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT s.id as session_id, s.expires_at, u.id, u.email, u.role, u.owner_id, u.is_active, u.force_password_change
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 42)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 46)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE token_hash = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 50)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND id = $2 AND invalidated_at IS NULL`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 54)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND invalidated_at IS NULL`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 58)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id = $1 AND token_hash != $2 AND invalidated_at IS NULL`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 62)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT id, device_info, created_at, last_seen_at, ip_address FROM sessions WHERE user_id = $1 AND expires_at > NOW() AND invalidated_at IS NULL ORDER BY last_seen_at DESC`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 66)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE id IN (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 77)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE password_resets SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 81)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 85)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT * FROM password_resets WHERE token_hash = $1 ORDER BY created_at DESC LIMIT 1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 89)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE password_resets SET used_at = NOW() WHERE token_hash = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 95)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT password_hash FROM users WHERE id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 99)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE users SET password_hash = $1, force_password_change = false WHERE id = $2`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 105)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT id FROM sessions WHERE user_id = $1 AND ip_address = $2 AND device_info = $3 AND id != $4 AND created_at > NOW() - INTERVAL '30 days' LIMIT 1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 111)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET last_seen_at = NOW() WHERE id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.queries.js` (Line 115)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET last_seen_at = NOW() WHERE token_hash = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 26)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 45)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(fQ.text, fQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 52)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(sQ.text, sQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 57)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const prevSessionRes = await db.query(prevSessQ.text, prevSessQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 74)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(evictQ.text, evictQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 82)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const sessionRes = await db.query(sessQ.text, sessQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 92)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 111)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 117)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(invQ.text, invQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 127)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(resetQ.text, resetQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 166)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query(lookupQ.text, lookupQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 188)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 194)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(updQ.text, updQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 198)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(consQ.text, consQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 202)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(invQ.text, invQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 204)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 206)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 219)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const userRecord = (await db.query(userQ.text, userQ.values)).rows[0];
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 229)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(updQ.text, updQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 234)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(iQ.text, iQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 237)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(iQ.text, iQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 248)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const userRes = await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 257)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 262)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(iQ.text, iQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 272)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 278)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const currentRes = await db.query(currentQ.text, currentQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 294)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 305)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\auth\auth.service.js` (Line 323)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
db.query(bQ.text, bQ.values).catch(e => console.error("Failed to bump session activity", e));
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.controller.js` (Line 13)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const adminConfigRes = await pool.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.controller.js` (Line 45)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(logQ.text, logQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.controller.js` (Line 50)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(logQ.text, logQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.controller.js` (Line 66)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const { rows } = await pool.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.controller.js` (Line 104)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const countRes = await pool.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.controller.js` (Line 120)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(logQ.text, logQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT club_name FROM admin_config WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 10)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 19)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 28)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT * FROM backup_logs WHERE owner_id = $1 ORDER BY created_at DESC LIMIT 50`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 33)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 43)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 55)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT id, owner_id, name, phone, member_code, joined_at as date, is_active, created_at FROM customers WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 60)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT id, owner_id, customer_id, attendance_date, type, (shake_amount::numeric / 100.0)::float as shake_amount, recorded_by, created_at, is_deleted, deleted_at FROM attendance WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 65)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT id, owner_id, customer_id, sale_date, created_at, recorded_by, is_deleted, deleted_at, deleted_by FROM sales WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 70)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT si.id, si.sale_id, si.product_version_id, si.variant_id, si.quantity, (si.price_charged::numeric / 100.0)::float as price_charged, (si.standard_price_snap::numeric / 100.0)::float as standard_price_snap, (si.vendor_price_snap::numeric / 100.0)::float as vendor_price_snap FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 75)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT id, owner_id, name, created_at FROM products WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 80)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT pv.id, pv.product_id, (pv.vendor_price::numeric / 100.0)::float as vendor_price, pv.is_active, pv.effective_from, pv.effective_to, pv.created_by FROM product_versions pv JOIN products p ON pv.product_id = p.id WHERE p.owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 85)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT id, product_version_id, owner_id, name, is_active, created_at, sku, low_stock_threshold, alert_enabled FROM variants WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 90)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT id, owner_id, product_version_id, quantity, (vendor_price_snap::numeric / 100.0)::float as vendor_price_snap, added_at, added_by FROM stock WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 98)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 109)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 121)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE owner_id = $1)`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 126)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `DELETE FROM product_versions WHERE product_id IN (SELECT id FROM products WHERE owner_id = $1)`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.queries.js` (Line 131)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `DELETE FROM ${tableName} WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 14)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.customers = (await pool.query(queries.getExportCustomers(ownerId).text, queries.getExportCustomers(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 17)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.attendance = (await pool.query(queries.getExportAttendance(ownerId).text, queries.getExportAttendance(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 20)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.sales = (await pool.query(queries.getExportSales(ownerId).text, queries.getExportSales(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 21)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.sale_items = (await pool.query(queries.getExportSaleItems(ownerId).text, queries.getExportSaleItems(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 24)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.products = (await pool.query(queries.getExportProducts(ownerId).text, queries.getExportProducts(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 25)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.product_versions = (await pool.query(queries.getExportProductVersions(ownerId).text, queries.getExportProductVersions(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 26)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.variants = (await pool.query(queries.getExportVariants(ownerId).text, queries.getExportVariants(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 27)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.stock = (await pool.query(queries.getExportStock(ownerId).text, queries.getExportStock(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 30)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.customers = (await pool.query(queries.getExportCustomers(ownerId).text, queries.getExportCustomers(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 31)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.attendance = (await pool.query(queries.getExportAttendance(ownerId).text, queries.getExportAttendance(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 32)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.sales = (await pool.query(queries.getExportSales(ownerId).text, queries.getExportSales(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 33)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.sale_items = (await pool.query(queries.getExportSaleItems(ownerId).text, queries.getExportSaleItems(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 34)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.products = (await pool.query(queries.getExportProducts(ownerId).text, queries.getExportProducts(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 35)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.product_versions = (await pool.query(queries.getExportProductVersions(ownerId).text, queries.getExportProductVersions(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 36)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.variants = (await pool.query(queries.getExportVariants(ownerId).text, queries.getExportVariants(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\backup.service.js` (Line 37)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
data.stock = (await pool.query(queries.getExportStock(ownerId).text, queries.getExportStock(ownerId).values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 97)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 101)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const preSalesRes = await client.query(snapQ.text, snapQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 149)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(query, values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 152)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(query, values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 158)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const postSalesRes = await client.query(snapQ.text, snapQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 171)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(updQ.text, updQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 175)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\backup\restore.service.js` (Line 178)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 21)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 28)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 35)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`UPDATE customers SET is_active = false WHERE id = $1 AND owner_id = $2`, [id, ownerId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 39)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`SELECT * FROM customers WHERE id = $1 AND owner_id = $2`, [id, ownerId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 43)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 56)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 66)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`SELECT id FROM customers WHERE owner_id = $1 AND name ILIKE $2`, [ownerId, customerName.trim()]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\customers\customers.queries.js` (Line 70)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`INSERT INTO customers (owner_id, name) VALUES ($1, $2) RETURNING id`, [ownerId, customerName.trim()]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 7)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT low_stock_threshold, setup_completed, default_shake_amount FROM admin_config WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 18)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 30)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 45)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 71)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 94)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 114)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 132)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT id FROM sales WHERE owner_id = $1 AND is_deleted = false`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 143)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT delete_sale_restore_stock($1, $2, $3)`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 154)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE attendance SET is_deleted = true, deleted_at = NOW() WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 165)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE users SET is_active = false WHERE id = $1 OR owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 176)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id IN (SELECT id FROM users WHERE id = $1 OR owner_id = $1)`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 187)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE admin_config SET setup_completed = true WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 198)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 214)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 236)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE attendance SET is_deleted = false, deleted_at = null WHERE id = $1 AND owner_id = $2`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 247)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT product_version_id, variant_id, quantity FROM sale_items WHERE sale_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 258)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT quantity FROM stock WHERE product_version_id = $1 AND variant_id = $2 AND owner_id = $3`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 269)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE stock SET quantity = quantity - $1 WHERE product_version_id = $2 AND variant_id = $3 AND owner_id = $4`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 280)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE sales SET is_deleted = false, deleted_at = null WHERE id = $1 AND owner_id = $2`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.queries.js` (Line 291)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT password_hash FROM users WHERE id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 56)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
confRes = await db.query(confQuery.text, confQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 60)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const sysRes = await db.query("SELECT value FROM settings WHERE key = 'SYSTEM_LOW_STOCK_THRESHOLD'");
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 72)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
pitScalarRes = await db.query(pitScalarQuery.text, pitScalarQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 73)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
res4 = await db.query(lowStockQuery.text, lowStockQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 101)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
periodScalarRes = await db.query(periodScalarQuery.text, periodScalarQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 102)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
res5 = await db.query(monthlySalesQuery.text, monthlySalesQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 103)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
res6 = await db.query(topCustomersQuery.text, topCustomersQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 104)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
res7 = await db.query(shakeProfitQuery.text, shakeProfitQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 153)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 162)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const activeSalesRes = await client.query(activeSalesQuery.text, activeSalesQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 166)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(delQuery.text, delQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 169)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM stock WHERE owner_id = $1`, [ownerId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 170)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM stock_entries WHERE owner_id = $1`, [ownerId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 175)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(softDelAttQuery.text, softDelAttQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 180)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE owner_id = $1)`, [ownerId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 181)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM sales WHERE owner_id = $1`, [ownerId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 183)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM products WHERE owner_id = $1`, [ownerId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 186)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 191)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 201)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 204)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(deactQuery.text, deactQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 207)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(invSessQuery.text, invSessQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 209)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 212)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 221)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(query.text, query.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 241)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(`UPDATE admin_config SET ${updates.join(', ')} WHERE owner_id = $${i}`, values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 248)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 258)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(queryStr, params);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 259)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 264)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 274)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 284)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const salesRes = await client.query(queryStr, params);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 288)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(delQuery.text, delQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 291)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 296)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 307)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const userRes = await db.query(userQuery.text, userQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 351)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const userRes = await db.query(userQuery.text, userQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 377)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const attRes = await db.query(attQuery.text, attQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 380)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const salesRes = await db.query(salesQuery.text, salesQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 398)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 402)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 405)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const itemsRes = await client.query(itemsQ.text, itemsQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 409)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const stockRes = await client.query(stockQ.text, stockQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 417)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(deductQ.text, deductQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 420)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(restoreSaleQ.text, restoreSaleQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 425)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\dashboard\dashboard.service.js` (Line 430)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\inventory\inventory.queries.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\inventory\inventory.queries.js` (Line 31)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\inventory\inventory.queries.js` (Line 61)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\inventory\inventory.queries.js` (Line 109)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\inventory\inventory.queries.js` (Line 119)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`SELECT id FROM variants WHERE sku = $1 AND id != $2`, [sku, excludeVariantId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\inventory\inventory.queries.js` (Line 121)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`SELECT id FROM variants WHERE sku = $1`, [sku]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 3)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = true`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 7)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT COUNT(*) FROM users WHERE role = 'user' AND is_active = true`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 11)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT COUNT(DISTINCT user_id) FROM sessions WHERE expires_at > NOW() AND invalidated_at IS NULL AND last_seen_at > NOW() - INTERVAL '1 day'`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 15)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT s.id, s.ip_address, s.device_info, s.created_at, s.expires_at, s.invalidated_at, s.last_seen_at, u.email, u.role
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 20)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT a.id, a.action, a.table_name, a.created_at, u.email as actor_email, u.role as actor_role
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 25)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 33)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT id FROM users WHERE email = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 37)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `INSERT INTO users (email, password_hash, role, owner_id, force_password_change, created_by) VALUES ($1, $2, 'admin', null, true, $3) RETURNING id`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 41)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE users SET owner_id = $1 WHERE id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 45)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `INSERT INTO admin_config (owner_id) VALUES ($1)`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 49)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT is_active, role FROM users WHERE id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 53)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT role FROM users WHERE id = $1 AND is_active = true`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 57)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE users SET password_hash = $1, force_password_change = true, failed_login_count = 0, locked_until = NULL WHERE id = $2`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 61)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE users SET is_active = false WHERE (id = $1 OR owner_id = $1) AND role != 'master'`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 65)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE sessions SET invalidated_at = NOW() WHERE user_id IN (SELECT id FROM users WHERE id = $1 OR owner_id = $1) AND invalidated_at IS NULL`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 69)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE users SET is_active = $1 WHERE id = $2 OR owner_id = $2`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.queries.js` (Line 73)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT id FROM users WHERE id = $1 AND role = 'admin'`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 14)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const totalAdminsRes = await db.query(queries.getMasterAppStatsAdmins().text);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 15)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const totalUsersRes = await db.query(queries.getMasterAppStatsUsers().text);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 16)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const activeSessionsRes = await db.query(queries.getMasterAppStatsSessions().text);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 25)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await db.query(queries.getMasterLiveSessions().text);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 40)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return (await db.query(queries.getMasterActivityLog().text)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 44)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return (await db.query(queries.getMasterAdmins().text)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 50)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const existCheck = await db.query(exQ.text, exQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 58)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 60)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const userRes = await client.query(insQ.text, insQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 64)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(setQ.text, setQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 67)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(confQ.text, confQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 69)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 74)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 83)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const userCheck = await db.query(uQ.text, uQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 92)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(updQ.text, updQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 103)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const userCheck = await db.query(uQ.text, uQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 111)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 113)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(updQ.text, updQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 117)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(invQ.text, invQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 120)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 124)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 133)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const adminCheck = await db.query(chkQ.text, chkQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 137)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(updQ.text, updQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 145)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 148)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const updateRes = await client.query(updQ.text, updQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 150)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 155)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(invQ.text, invQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 157)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\master\master.service.js` (Line 160)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\notifications\notifications.queries.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\notifications\notifications.queries.js` (Line 12)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`SELECT email FROM users WHERE id = $1`, [userId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\notifications\notifications.queries.js` (Line 16)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\notifications\notifications.queries.js` (Line 25)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\notifications\notifications.queries.js` (Line 32)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\notifications\notifications.queries.js` (Line 39)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 21)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 30)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return client.query(
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 37)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return client.query(
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 44)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return client.query(
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 51)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return client.query(`SELECT id FROM product_versions WHERE product_id = $1 AND is_active = true`, [productId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 55)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return client.query(`UPDATE product_versions SET is_active = false, effective_to = NOW() WHERE id = $1`, [oldVersionId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 59)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return client.query(
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 67)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 75)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`SELECT id, is_active FROM product_versions WHERE product_id = $1 ORDER BY effective_from DESC LIMIT 1`, [productId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 79)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`UPDATE product_versions SET is_active = $1 WHERE id = $2`, [newStatus, versionId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 83)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`INSERT INTO variants (id, product_version_id, owner_id, name, is_active) VALUES (gen_random_uuid(), $1, $2, $3, true) RETURNING id`, [productVersionId, ownerId, name]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 87)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`SELECT is_active FROM variants WHERE id = $1`, [id]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 91)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`UPDATE variants SET is_active = $1 WHERE id = $2`, [newStatus, id]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 96)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.queries.js` (Line 105)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return db.query(`DELETE FROM variants WHERE id = $1`, [id]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 61)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 95)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 105)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 110)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
if (client) await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 125)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 143)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const oldVariantsRes = await client.query(`SELECT id, name FROM variants WHERE product_version_id = $1 AND is_active = true`, [oldVersionId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 150)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 162)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\products\products.service.js` (Line 166)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
if (client) await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 29)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 46)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 61)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 73)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT COUNT(*) as count FROM customers WHERE owner_id = $1 AND is_active = true`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 83)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT club_name FROM admin_config WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 93)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT * FROM customers WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 103)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 121)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT id FROM customers WHERE id = $1 AND owner_id = $2`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 128)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE customers SET name = $1, phone = $2 WHERE id = $3`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 135)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `INSERT INTO customers (id, owner_id, name, phone) VALUES ($1, $2, $3, $4)`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 142)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `INSERT INTO customers (owner_id, name, phone) VALUES ($1, $2, $3)`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 152)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `INSERT INTO products (owner_id, name) VALUES ($1, $2) RETURNING id`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 159)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `INSERT INTO product_versions (product_id, vendor_price, created_by) VALUES ($1, $2, $3) RETURNING id`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 166)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `INSERT INTO variants (product_id, owner_id, name) VALUES ($1, $2, $3) RETURNING id`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.queries.js` (Line 173)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `INSERT INTO stock (product_version_id, variant_id, owner_id, quantity, vendor_price_snap, added_by) VALUES ($1, $2, $3, $4, $5, $6)`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 25)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 39)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 56)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const salesRes = await db.query(sStatsQ.text, sStatsQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 57)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const attRes = await db.query(aStatsQ.text, aStatsQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 58)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const custRes = await db.query(cCountQ.text, cCountQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 63)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const salesList = await db.query(sListQ.text, sListQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 64)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const attendanceList = await db.query(aListQ.text, aListQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 89)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const adminConfigRes = await db.query(confQ.text, confQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 123)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const adminConfigRes = await db.query(confQ.text, confQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 138)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const customers = await db.query(custQ.text, custQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 154)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const sales = await db.query(salesQ.text, salesQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 186)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 208)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const existing = await client.query(chkQ.text, chkQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 211)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(updQ.text, updQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 214)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(insQ.text, insQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 219)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(insNoIdQ.text, insNoIdQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 241)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const prodRes = await client.query(prodQ.text, prodQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 245)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const pvRes = await client.query(verQ.text, verQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 249)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const variantRes = await client.query(variantQ.text, variantQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 253)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(stockQ.text, stockQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 259)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\reports\reports.service.js` (Line 263)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
if (client) await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.controller.js` (Line 12)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query(query.text, query.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.controller.js` (Line 19)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const itemsRes = await db.query(itemsQuery.text, itemsQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.controller.js` (Line 127)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const saleRes = await db.query(permQuery.text, permQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 7)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 26)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 97)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT create_sale_atomic($1, $2, $3, $4, $5::jsonb) as sale_id`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 108)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT delete_sale_restore_stock($1, $2, $3) as success`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 119)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT low_stock_threshold, discount_alert_pct FROM admin_config WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 130)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT email FROM users WHERE id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 141)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT name FROM customers WHERE id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 152)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT quantity FROM stock WHERE product_version_id = $1 AND variant_id = $2 AND owner_id = $3`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 163)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT p.name FROM products p JOIN product_versions pv ON pv.product_id = p.id WHERE pv.id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 174)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT recorded_by FROM sales WHERE id = $1 AND owner_id = $2 AND is_deleted = false`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 185)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 201)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT count(*) FROM sale_items WHERE sale_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 212)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `DELETE FROM sale_items WHERE id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.queries.js` (Line 223)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 10)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await db.query(query.text, query.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 74)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await db.query(atomicQuery.text, atomicQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 91)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const configRes = await db.query(configQuery.text, configQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 95)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const sysRes = await db.query("SELECT value FROM settings WHERE key = 'SYSTEM_LOW_STOCK_THRESHOLD'");
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 105)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const userRes = await db.query(userQuery.text, userQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 110)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const custRes = await db.query(custQuery.text, custQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 116)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const stockRes = await db.query(stockQuery.text, stockQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 119)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const productNameRes = await db.query(prodNameQuery.text, prodNameQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 141)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await db.query(query.text, query.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 159)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 163)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const itemRes = await client.query(itemQuery.text, itemQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 178)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const countRes = await client.query(countQuery.text, countQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 183)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 189)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(deleteQuery.text, deleteQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 193)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(restoreQuery.text, restoreQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 195)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\sales\sales.service.js` (Line 200)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
if (client) await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT id, email as username, email, role, is_active, last_login_at FROM users WHERE owner_id = $1 AND is_active = true ORDER BY created_at DESC`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 8)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT COUNT(*) FROM users WHERE owner_id = $1 AND role = 'user' AND is_active = true`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 12)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT id, is_active, owner_id FROM users WHERE email = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 16)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE users SET is_active = true, password_hash = $1, role = $2, force_password_change = true, locked_until = NULL WHERE id = $3 RETURNING id, email, role`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 20)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `INSERT INTO users (email, password_hash, role, owner_id, force_password_change, created_by) VALUES ($1, $2, $3, $4, true, $5) RETURNING id, email, role`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 24)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE users SET role = $1 WHERE id = $2 AND owner_id = $3 RETURNING id`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 28)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE users SET is_active = false, locked_until = NOW() WHERE id = $1 AND owner_id = $2 RETURNING id`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 33)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE users SET password_hash = $1, force_password_change = true WHERE id = $2 AND owner_id = $3`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 37)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT s.ip_address, s.device_info, s.created_at, s.expires_at, s.invalidated_at, u.email as user_email
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 45)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT club_name FROM admin_config WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 49)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE admin_config SET club_name = $1, updated_at = NOW() WHERE owner_id = $2`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 53)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT ac.club_name, u.email FROM admin_config ac JOIN users u ON u.id = ac.owner_id WHERE ac.owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 57)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `SELECT low_stock_threshold, setup_completed, default_shake_amount FROM admin_config WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 61)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE admin_config SET setup_completed = true, updated_at = NOW() WHERE owner_id = $1`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.queries.js` (Line 65)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE admin_config SET default_shake_amount = $1, low_stock_threshold = $2, updated_at = NOW() WHERE owner_id = $3`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 20)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
return (await db.query(q.text, q.values)).rows;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 34)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const countRes = await db.query(countQ.text, countQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 49)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const existing = await db.query(exQ.text, exQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 60)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const updateRes = await db.query(rQ.text, rQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 68)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const newRes = await db.query(insQ.text, insQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 76)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const updRes = await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 82)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const delRes = await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 94)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query(updQ.text, updQ.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 103)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 120)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 126)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 132)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 143)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 148)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const current = await db.query(queries.getAdminConfig(ownerId).text, queries.getAdminConfig(ownerId).values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\settings\settings.service.js` (Line 153)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(q.text, q.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.queries.js` (Line 3)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.queries.js` (Line 28)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.queries.js` (Line 42)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.queries.js` (Line 52)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.queries.js` (Line 62)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `UPDATE stock SET quantity = $1 WHERE variant_id = $2 AND owner_id = $3 RETURNING id`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.queries.js` (Line 69)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
text: `DELETE FROM stock WHERE variant_id = $1 AND owner_id = $2`,
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 11)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query(query.text, query.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 40)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 44)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const pvRes = await client.query(pvQuery.text, pvQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 47)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 57)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const updateRes = await client.query(updateQuery.text, updateQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 62)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(insertQuery.text, insertQuery.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 65)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 69)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
if (client) await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 81)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const result = await db.query(query.text, query.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\features\stock\stock.service.js` (Line 99)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(query.text, query.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\find_owner.js` (Line 7)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const stats = await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\find_owner.js` (Line 29)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const dashStats = await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\find_owner.js` (Line 38)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const stockItems = await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\find_owner.js` (Line 47)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const saleItems = await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\find_owner2.js` (Line 8)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const stockItems = await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\fixHistory.js` (Line 11)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\fixMissingFlavours.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const saleItems = await db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\fixMissingFlavours.js` (Line 15)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const fRes = await db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\fixMissingFlavours.js` (Line 21)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(`UPDATE sale_items SET flavour_id = $1 WHERE id = $2`, [flavourId, item.sale_item_id]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\fix_attendance.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await pool.query('UPDATE attendance SET is_deleted = false, deleted_at = null WHERE is_deleted = true');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\fix_stock.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await pool.query('UPDATE stock SET quantity = 0 WHERE quantity < 0');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\fix_stock_post_restore.js` (Line 21)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const updateRes = await pool.query(updateQuery);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\get_func.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await pool.query("SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'delete_sale_restore_stock'");
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\list_users.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await db.query('SELECT id, email, role, owner_id FROM users');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrateData.js` (Line 41)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrateData.js` (Line 46)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`TRUNCATE TABLE ${tableName} CASCADE`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrateData.js` (Line 55)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(query, values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrateData.js` (Line 59)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const { rows: maxRows } = await client.query(`SELECT MAX(id) as max_id FROM ${tableName}`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrateData.js` (Line 62)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`SELECT setval('${tableName}_id_seq', ${maxId})`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrateData.js` (Line 65)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrateData.js` (Line 69)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrate_functions.js` (Line 106)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(sql);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\001_add_total_profit_to_sales.js` (Line 11)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(q);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\002_add_google_auth_to_users.js` (Line 11)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(q);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\003_multi_tenant_isolation.js` (Line 9)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS owner_id VARCHAR(255)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 7)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const { rows: users } = await client.query("SELECT id, username, email FROM users");
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 13)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('UPDATE products SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 14)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('UPDATE product_variants SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 15)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('UPDATE stock SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 16)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('UPDATE sales SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 17)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('UPDATE sale_items SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 18)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('UPDATE attendance SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 19)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('UPDATE settings SET owner_id = $1 WHERE owner_id = $2', [stableOwnerId, oldId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 22)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\004_migrate_owner_id_to_email.js` (Line 24)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\005_add_owner_id_to_users.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS owner_id VARCHAR(255)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\005_add_owner_id_to_users.js` (Line 8)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\005_add_owner_id_to_users.js` (Line 18)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\005_add_owner_id_to_users.js` (Line 25)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE users ADD CONSTRAINT users_username_owner_key UNIQUE (username, owner_id)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\006_create_refresh_tokens.js` (Line 3)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`CREATE TABLE IF NOT EXISTS refresh_tokens (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\006_create_refresh_tokens.js` (Line 12)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\007_add_product_variants_unique.js` (Line 4)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\index.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`CREATE TABLE IF NOT EXISTS migrations (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\index.js` (Line 12)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const { rows } = await pool.query(`SELECT name FROM migrations`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\migrations\index.js` (Line 37)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`INSERT INTO migrations (name) VALUES ($1)`, [filename]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\provide_runtime_evidence.js` (Line 10)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const userRes = await client.query('SELECT id FROM users LIMIT 1');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\queries.js` (Line 36)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const userRes = await client.query(`SELECT id FROM users LIMIT 1`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\queries.js` (Line 40)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const p1Res = await client.query(`INSERT INTO products (id, name, owner_id) VALUES (gen_random_uuid(), 'Formula 1 Test', $1) RETURNING id`, [userId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\queries.js` (Line 42)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const pv1Res = await client.query(`INSERT INTO product_versions (id, product_id, vendor_price, volume_points) VALUES (gen_random_uuid(), $1, 1000, 10) RETURNING id`, [f1Id]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\queries.js` (Line 44)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const vChocoRes = await client.query(`INSERT INTO variants (id, product_version_id, name, is_active) VALUES (gen_random_uuid(), $1, 'Choco Test', true) RETURNING id`, [pv1Id]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\queries.js` (Line 50)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM stock WHERE variant_id = $1`, [vChoco]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\queries.js` (Line 51)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM variants WHERE id = $1`, [vChoco]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\queries.js` (Line 52)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM product_versions WHERE id = $1`, [pv1Id]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\queries.js` (Line 53)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`DELETE FROM products WHERE id = $1`, [f1Id]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\recoverStock.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\recoverStock.js` (Line 9)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\recoverStock.js` (Line 13)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\recreate_tables.js` (Line 22)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('CREATE TABLE IF NOT EXISTS ' + table + ' (' + cols + ')');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\reset_pwd.js` (Line 11)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
pool.query('UPDATE users SET password = $1 WHERE username = $2', [hash, 'admin'])
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\restoreTestStock.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\data_integrity_verifier.js` (Line 12)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await client.query(`SELECT * FROM ${t} ORDER BY id ASC`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\migrateToSaaS.js` (Line 10)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS raw_password VARCHAR(255)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\migrateToSaaS.js` (Line 11)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS session_token VARCHAR(255)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\migrateToSaaS.js` (Line 12)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\migrateToSaaS.js` (Line 22)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const { rows: masterRows } = await pool.query('SELECT id FROM users WHERE role = $1', ['master']);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\migrateToSaaS.js` (Line 24)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\migrateToSaaS.js` (Line 35)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const { rows: allUsers } = await pool.query('SELECT id, email, username FROM users WHERE role != $1', ['master']);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\migrateToSaaS.js` (Line 42)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\migration_backup_manager.js` (Line 22)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const res = await pool.query(`SELECT * FROM ${table}`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\migration_backup_manager.js` (Line 29)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
try { const res = await pool.query(`SELECT * FROM variants`); data['variants'] = res.rows; } catch(e) { data['variants'] = []; }
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\migration_backup_manager.js` (Line 30)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
try { const res = await pool.query(`SELECT * FROM flavours`); data['flavours'] = res.rows; } catch(e) { data['flavours'] = []; }
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\migration_validator.js` (Line 8)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const prodRes = await client.query('SELECT name, count(*) FROM products GROUP BY name HAVING count(*) > 1');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\migration_validator.js` (Line 14)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const stockRes = await client.query('SELECT count(*) FROM stock WHERE product_version_id NOT IN (SELECT id FROM product_versions)');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 38)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 43)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`SAVEPOINT before_table`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 45)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE IF EXISTS ${table} DISABLE TRIGGER USER;`); // Use USER instead of ALL to avoid system trigger errors
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 46)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`TRUNCATE TABLE ${table} CASCADE;`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 54)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`INSERT INTO ${table} (${colsStr}) VALUES (${placeholders})`, vals);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 56)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE IF EXISTS ${table} ENABLE TRIGGER USER;`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 57)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`RELEASE SAVEPOINT before_table`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 60)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`ROLLBACK TO SAVEPOINT before_table`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 64)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\restore_backup.js` (Line 67)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\validate_inventory_integrity.js` (Line 10)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const duplicates = await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\validate_inventory_integrity.js` (Line 26)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const duplicateSkus = await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\validate_inventory_integrity.js` (Line 44)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const orphanStock = await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\validate_inventory_integrity.js` (Line 59)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const orphanSales = await client.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 11)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const userRes = await client.query('SELECT id FROM users LIMIT 1');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 17)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(q1.text, q1.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 21)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(q2.text, q2.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 25)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(q3.text, q3.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 29)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(q4.text, q4.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 33)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(q5.text, q5.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 37)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(q6.text, q6.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\scripts\verify_stats.js` (Line 41)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(q7.text, q7.values);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\set_stock_exact.js` (Line 6)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`UPDATE stock SET quantity = 10 WHERE product_version_id = '09aac69c-3be7-4ca0-a2c8-24148a463ad5'`); // Kulfi
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\set_stock_exact.js` (Line 7)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`UPDATE stock SET quantity = 10 WHERE product_version_id = 'ee75949a-1e3b-4604-a969-5c70a531ad1f'`); // Chocolate
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\set_stock_exact.js` (Line 8)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`UPDATE stock SET quantity = 23 WHERE product_version_id = '4ad95177-2e17-4f15-aff5-ead1977a418a'`); // Formula 1
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 27)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('BEGIN');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 30)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS users (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 48)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 49)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 50)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 56)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const { rows: adminRows } = await client.query(`SELECT id FROM users WHERE username = $1`, ['admin']);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 59)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`, ['admin', hash, 'admin']);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 62)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const { rows: userRows } = await client.query(`SELECT id FROM users WHERE username = $1`, ['user']);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 65)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`, ['user', hash, 'user']);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 69)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS products (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 79)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS product_variants (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 90)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS stock (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 98)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS sales (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 108)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS sale_items (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 120)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS settings (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 129)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS attendance (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 140)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS login_history (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 153)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS refresh_tokens (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 162)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE TABLE IF NOT EXISTS backup_logs (
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 179)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 180)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 181)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 182)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_name ON attendance(name)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 183)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 186)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_products_owner ON products(owner_id)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 187)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_product_variants_owner ON product_variants(owner_id)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 188)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_stock_owner ON stock(owner_id)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 189)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_owner ON sales(owner_id)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 190)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sales_owner_date ON sales(owner_id, date)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 191)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_sale_items_owner ON sale_items(owner_id)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 192)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query(`CREATE INDEX IF NOT EXISTS idx_attendance_owner ON attendance(owner_id)`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 194)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('COMMIT');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 196)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await client.query('ROLLBACK');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\db\connection.js` (Line 206)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
query: (text, params) => pool.query(text, params),
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\services\auditLogService.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\services\cronService.js` (Line 29)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const { rows: admins } = await pool.query("SELECT id, username FROM users WHERE role = 'admin'");
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\services\cronService.js` (Line 57)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\services\cronService.js` (Line 66)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\shared\utils\audit.js` (Line 5)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\update_master.js` (Line 11)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const check = await db.query(`SELECT id FROM users WHERE role = 'master'`);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\update_master.js` (Line 14)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(`UPDATE users SET email = $1, password_hash = $2 WHERE role = 'master'`, [email, hash]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\update_master.js` (Line 17)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
await db.query(`INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'master')`, [email, hash]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\verify.js` (Line 7)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const ownerId = (await pool.query('SELECT owner_id FROM stock LIMIT 1')).rows[0].owner_id;
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\verify.js` (Line 10)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const pvRes = await pool.query('SELECT * FROM product_versions');
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\verify.js` (Line 13)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const adminConfig = await pool.query('SELECT low_stock_threshold FROM admin_config WHERE owner_id = $1', [ownerId]);
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\verify.js` (Line 16)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const lowStockItems = await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

### Query in `E:\development\club app(web)\backend\verify.js` (Line 26)
- **Purpose:** [NEEDS CLARIFICATION]
- **Full SQL Call:**
```javascript
const salesStats = await pool.query(`
```
- **Parameters:** [NEEDS CLARIFICATION]
- **Returns:** [NEEDS CLARIFICATION]
- **Called By:** [NEEDS CLARIFICATION]

