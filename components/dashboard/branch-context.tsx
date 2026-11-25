"use client";

import * as React from "react";
import { GitBranch } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { apiClient } from "@/lib/api";
import {
  ALL_BRANCHES,
  getStoredBranchChoice,
  saveBranchChoice,
  type WorkshopBranch,
} from "@/lib/branch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BranchContextValue = {
  branches: WorkshopBranch[];
  choice: string;
  selectBranch: (id: string) => void;
};

const BranchContext = React.createContext<BranchContextValue | null>(null);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [branches, setBranches] = React.useState<WorkshopBranch[]>([]);
  const [choice, setChoice] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    apiClient
      .get<WorkshopBranch[]>("/branches")
      .then((list) => {
        if (cancelled) return;
        const active = list.filter((branch) => branch.isActive !== false);
        const stored = getStoredBranchChoice();
        const known =
          stored === ALL_BRANCHES || active.some((branch) => branch.id === stored);
        const next = known
          ? stored
          : (active.find((branch) => branch.isMain) ?? active[0])?.id ?? "";
        if (next) saveBranchChoice(next);
        setBranches(active);
        setChoice(next);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectBranch = React.useCallback((id: string) => {
    saveBranchChoice(id);
    window.location.reload();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <BranchContext.Provider value={{ branches, choice, selectBranch }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = React.useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used inside BranchProvider");
  }
  return context;
}

export function BranchSwitcher() {
  const { t } = useTranslation();
  const context = React.useContext(BranchContext);
  if (!context || context.branches.length === 0) return null;

  if (context.branches.length === 1) {
    return (
      <span className="hidden items-center gap-1 text-sm text-muted-foreground sm:inline-flex">
        <GitBranch className="size-3.5" />
        {context.branches[0].name}
      </span>
    );
  }

  return (
    <Select value={context.choice} onValueChange={context.selectBranch}>
      <SelectTrigger className="h-9 w-40">
        <GitBranch className="size-3.5 text-muted-foreground" />
        <SelectValue placeholder={t.auth?.branch || "الفرع"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_BRANCHES}>
          {t.auth?.allBranches || "كل الفروع"}
        </SelectItem>
        {context.branches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
