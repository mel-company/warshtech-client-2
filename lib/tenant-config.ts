/** Fixed workshop tenant (subdomain or id). Empty env value = editable field. */
const fromEnv = process.env.NEXT_PUBLIC_FIXED_TENANT;

export const FIXED_TENANT_ID = fromEnv?.trim() ?? "";
// export const FIXED_TENANT_ID = fromEnv?.trim() ?? "";

export const isTenantLocked = FIXED_TENANT_ID.length > 0;

const LAST_REGISTERED_TENANT_KEY = "last_registered_tenant";

export function getDefaultTenantId() {
    if (FIXED_TENANT_ID) return FIXED_TENANT_ID;
    if (typeof window === "undefined") return "";
    return localStorage.getItem(LAST_REGISTERED_TENANT_KEY) ?? "";
}

export function saveLastRegisteredTenant(tenantId: string) {
    if (typeof window !== "undefined") {
        localStorage.setItem(LAST_REGISTERED_TENANT_KEY, tenantId);
    }
}
