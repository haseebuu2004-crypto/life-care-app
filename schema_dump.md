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

