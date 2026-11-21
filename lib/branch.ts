export const ALL_BRANCHES = "all";
const BRANCH_KEY = "branch_id";

export interface WorkshopBranch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  isMain: boolean;
  isActive?: boolean;
}

export interface PublicWorkshop {
  name: string;
  subdomain: string;
  logo: string | null;
  branches: WorkshopBranch[];
}

export function getStoredBranchChoice(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(BRANCH_KEY) ?? "";
}

/** Branch sent to the API. "All branches" sends nothing so lists stay workshop-wide. */
export function getSelectedBranchId(): string | null {
  const value = getStoredBranchChoice();
  if (!value || value === ALL_BRANCHES) return null;
  return value;
}

export function saveBranchChoice(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BRANCH_KEY, id);
}
