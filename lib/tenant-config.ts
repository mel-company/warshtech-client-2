/** Fixed workshop tenant (subdomain or id). Empty env value = editable field. */
const fromEnv = process.env.NEXT_PUBLIC_FIXED_TENANT;

export const FIXED_TENANT_ID = ""
// export const FIXED_TENANT_ID = fromEnv?.trim() ?? "";

export const isTenantLocked = FIXED_TENANT_ID.length > 0;
