"use client";

import * as React from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import type { Company, CompanyFormData } from "@/types";
import apiClient from "@/lib/api";
import { extractListData } from "@/lib/list-response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveModal, ConfirmDialog } from "@/components/responsive-modal";

interface CompanyFormProps {
  company?: Company;
  onSubmit: (data: CompanyFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function CompanyForm({
  company,
  onSubmit,
  onCancel,
  isLoading,
}: CompanyFormProps) {
  const { t } = useTranslation();
  const [name, setName] = React.useState(company?.name || "");
  const [phone, setPhone] = React.useState(company?.phone || "");
  const [address, setAddress] = React.useState(company?.address || "");
  const [notes, setNotes] = React.useState(company?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t.validation.required);
      return;
    }
    onSubmit({
      name: name.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rtl-auto">
      <div className="space-y-2">
        <Label htmlFor="company-name">{t.companies.name}</Label>
        <Input
          id="company-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company-phone">{t.companies.phone}</Label>
        <Input
          id="company-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          dir="ltr"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company-address">{t.companies.address}</Label>
        <Input
          id="company-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company-notes">{t.companies.notes}</Label>
        <Textarea
          id="company-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {t.actions.save}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t.actions.cancel}
        </Button>
      </div>
    </form>
  );
}

export function CompaniesPage() {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("companies", "write");

  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingCompany, setEditingCompany] = React.useState<
    Company | undefined
  >();
  const [deletingCompany, setDeletingCompany] = React.useState<
    Company | undefined
  >();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(true);

  const fetchCompanies = React.useCallback(async () => {
    try {
      setIsFetching(true);
      const response = await apiClient.get<{ data: Company[] }>(
        "/companies?take=500",
      );
      setCompanies(extractListData(response));
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      toast.error(t.messages.error.general);
    } finally {
      setIsFetching(false);
    }
  }, [t.messages.error.general]);

  React.useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  const filteredCompanies = React.useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const q = searchQuery.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)),
    );
  }, [companies, searchQuery]);

  const handleSubmit = async (data: CompanyFormData) => {
    setIsLoading(true);
    try {
      if (editingCompany) {
        await apiClient.patch(`/companies/${editingCompany.id}`, data);
        toast.success(t.messages.success.updated);
      } else {
        await apiClient.post("/companies", data);
        toast.success(t.messages.success.created);
      }
      setIsFormOpen(false);
      setEditingCompany(undefined);
      await fetchCompanies();
    } catch (error) {
      console.error("Company save failed:", error);
      toast.error(t.messages.error.general);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCompany) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/companies/${deletingCompany.id}`);
      toast.success(t.messages.success.deleted);
      setIsDeleteOpen(false);
      setDeletingCompany(undefined);
      await fetchCompanies();
    } catch (error) {
      console.error("Company delete failed:", error);
      toast.error(t.messages.error.general);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.companies.title}</h1>
          <p className="text-sm text-muted-foreground">{t.companies.subtitle}</p>
        </div>
        {canWrite && (
          <Button
            onClick={() => {
              setEditingCompany(undefined);
              setIsFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="size-4" />
            {t.companies.addNew}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.companies.searchPlaceholder}
              className="ps-9"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.companies.name}</TableHead>
                  <TableHead>{t.companies.phone}</TableHead>
                  <TableHead>{t.companies.address}</TableHead>
                  <TableHead>{t.companies.usageCount}</TableHead>
                  {canWrite && <TableHead className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching ? (
                  <TableRow>
                    <TableCell colSpan={canWrite ? 5 : 4} className="py-8 text-center">
                      {t.common.loading}
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canWrite ? 5 : 4} className="py-8 text-center text-muted-foreground">
                      {t.companies.empty}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="size-4 text-primary" />
                          <span className="font-medium">{company.name}</span>
                        </div>
                      </TableCell>
                      <TableCell dir="ltr">{company.phone || "—"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {company.address || "—"}
                      </TableCell>
                      <TableCell>{company.usageCount}</TableCell>
                      {canWrite && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingCompany(company);
                                  setIsFormOpen(true);
                                }}
                              >
                                <Pencil className="size-4" />
                                {t.actions.edit}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setDeletingCompany(company);
                                  setIsDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="size-4" />
                                {t.actions.delete}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ResponsiveModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editingCompany ? t.companies.editCompany : t.companies.addNew}
      >
        <CompanyForm
          company={editingCompany}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isLoading}
        />
      </ResponsiveModal>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t.companies.deleteCompany}
        description={t.companies.deleteConfirm}
        onConfirm={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}
