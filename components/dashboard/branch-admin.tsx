"use client";

import { useTranslation } from "@/lib/i18n";
import { ALL_BRANCHES } from "@/lib/branch";
import { useBranch } from "@/components/dashboard/branch-context";
import { BranchesCard } from "@/components/dashboard/branches-card";
import { EmployeesPage } from "@/components/dashboard/employees";
import { UsersPage } from "@/components/dashboard/users";
import { RolesPage } from "@/components/dashboard/roles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BranchAdminPage() {
  const { t } = useTranslation();
  const { branches, choice } = useBranch();
  const current =
    choice === ALL_BRANCHES
      ? null
      : branches.find((branch) => branch.id === choice);
  const branchName = current?.name || t.auth.allBranches;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {t.nav.branches}
          {branchName ? ` — ${branchName}` : ""}
        </h2>
        <p className="text-muted-foreground">
          موظفو الفرع المختار ومستخدمونه وأدواره. بدّل الفرع من الأعلى لترى
          إدارة فرع آخر.
        </p>
      </div>

      <Tabs defaultValue="employees">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="employees">{t.nav.employees}</TabsTrigger>
          <TabsTrigger value="users">{t.nav.users}</TabsTrigger>
          <TabsTrigger value="roles">{t.nav.roles}</TabsTrigger>
          <TabsTrigger value="places">{t.settings.branches}</TabsTrigger>
        </TabsList>
        <TabsContent value="employees" className="pt-4">
          <EmployeesPage />
        </TabsContent>
        <TabsContent value="users" className="pt-4">
          <UsersPage />
        </TabsContent>
        <TabsContent value="roles" className="pt-4">
          <RolesPage />
        </TabsContent>
        <TabsContent value="places" className="pt-4">
          <BranchesCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
