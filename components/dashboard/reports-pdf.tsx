"use client";

import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "IBM Plex Sans Arabic",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-sans-arabic@5.0.13/files/ibm-plex-sans-arabic-arabic-400-normal.woff",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-sans-arabic@5.0.13/files/ibm-plex-sans-arabic-arabic-700-normal.woff",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 56,
    fontFamily: "IBM Plex Sans Arabic",
    fontSize: 10,
    color: "#1a1a1a",
    direction: "rtl",
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerText: { alignItems: "flex-end", flex: 1 },
  workshopName: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 4,
    textAlign: "right",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#333",
    marginBottom: 4,
    textAlign: "right",
  },
  meta: { fontSize: 9, color: "#777", textAlign: "right", marginBottom: 2 },
  logo: {
    width: 48,
    height: 48,
    objectFit: "contain" as const,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 6,
    textAlign: "right",
    color: "#1a1a1a",
  },
  kpiGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  kpiCard: {
    width: "48%",
    padding: 10,
    backgroundColor: "#f7f7f7",
    borderRadius: 4,
  },
  kpiLabel: { fontSize: 8, color: "#888", textAlign: "right", marginBottom: 4 },
  kpiValue: { fontSize: 12, fontWeight: 700, textAlign: "right" },
  tableContainer: { marginBottom: 12 },
  tableHeaderRow: {
    flexDirection: "row-reverse",
    paddingVertical: 5,
    paddingHorizontal: 4,
    backgroundColor: "#eee",
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 700,
    textAlign: "right",
    color: "#333",
  },
  tableRow: {
    flexDirection: "row-reverse",
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8e8e8",
  },
  tableRowAlt: { backgroundColor: "#fafafa" },
  tableCell: { fontSize: 9, color: "#444", textAlign: "right" },
  tableCellBold: { fontSize: 9, fontWeight: 700, textAlign: "right" },
  colIdx: { width: 22, textAlign: "center" as const },
  colName: { flex: 2.5 },
  colSm: { flex: 1, textAlign: "center" as const },
  colNum: { flex: 1.2, textAlign: "left" as const },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#aaa",
    textAlign: "center",
  },
});

export interface ReportsPdfSnapshot {
  workshopName: string;
  workshopLogo?: string | null;
  pdfTitle: string;
  periodLabel: string;
  generatedAt: string;
  currency: string;
  kpis: { label: string; value: string }[];
  statusSectionTitle: string;
  statusRows: { label: string; count: number }[];
  monthlySectionTitle: string;
  monthlyHeaders: { month: string; revenue: string; invoices: string };
  monthlyRows: { month: string; revenue: number; invoices: number }[];
  topCustomersTitle: string;
  topCustomersHeaders: {
    customer: string;
    phone: string;
    count: string;
    revenue: string;
  };
  topCustomers: {
    name: string;
    phone: string;
    count: number;
    revenue: number;
  }[];
  topProductsTitle: string;
  topProductsHeaders: { product: string; quantity: string; revenue: string };
  topProducts: { name: string; qty: number; revenue: number }[];
  topServicesTitle: string;
  topServicesHeaders: { service: string; count: string; revenue: string };
  topServices: { name: string; count: number; revenue: number }[];
  inventoryTitle: string;
  inventorySummary: string;
  lowStockTitle: string;
  lowStockHeaders: { product: string; stock: string; minStock: string };
  lowStock: { name: string; stock: number; minStock: number }[];
  recentTitle: string;
  recentHeaders: {
    invoice: string;
    date: string;
    customer: string;
    status: string;
    amount: string;
  };
  recentInvoices: {
    number: string;
    date: string;
    customer: string;
    status: string;
    amount: number;
  }[];
  emptyNote: string;
  pageFooter: string;
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: React.ReactNode;
  rows: React.ReactNode;
}) {
  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeaderRow}>{headers}</View>
      {rows}
    </View>
  );
}

interface ReportsPDFProps {
  data: ReportsPdfSnapshot;
}

export function ReportsPDF({ data }: ReportsPDFProps) {
  const sym = data.currency;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            {data.workshopName ? (
              <Text style={styles.workshopName}>{data.workshopName}</Text>
            ) : null}
            <Text style={styles.title}>{data.pdfTitle}</Text>
            <Text style={styles.meta}>
              {data.periodLabel} — {data.generatedAt}
            </Text>
          </View>
          {data.workshopLogo ? (
            <Image src={data.workshopLogo} style={styles.logo} />
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>ملخص الأداء</Text>
        <View style={styles.kpiGrid}>
          {data.kpis.map((kpi, i) => (
            <View key={i} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{data.statusSectionTitle}</Text>
        <SimpleTable
          headers={
            <>
              <Text style={[styles.tableHeaderCell, styles.colName]}>
                الحالة
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colNum]}>العدد</Text>
            </>
          }
          rows={
            data.statusRows.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colName]}>
                  {data.emptyNote}
                </Text>
              </View>
            ) : (
              data.statusRows.map((row, i) => (
                <View
                  key={i}
                  style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <Text style={[styles.tableCellBold, styles.colName]}>
                    {row.label}
                  </Text>
                  <Text style={[styles.tableCell, styles.colNum]}>
                    {String(row.count)}
                  </Text>
                </View>
              ))
            )
          }
        />

        <Text style={styles.sectionTitle}>{data.monthlySectionTitle}</Text>
        <SimpleTable
          headers={
            <>
              <Text style={[styles.tableHeaderCell, styles.colName]}>
                {data.monthlyHeaders.month}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colNum]}>
                {data.monthlyHeaders.revenue}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colSm]}>
                {data.monthlyHeaders.invoices}
              </Text>
            </>
          }
          rows={data.monthlyRows.map((row, i) => (
            <View
              key={i}
              style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.tableCell, styles.colName]}>{row.month}</Text>
              <Text style={[styles.tableCell, styles.colNum]}>
                {row.revenue.toLocaleString("ar-SA")} {sym}
              </Text>
              <Text style={[styles.tableCell, styles.colSm]}>
                {String(row.invoices)}
              </Text>
            </View>
          ))}
        />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>{data.topCustomersTitle}</Text>
        <SimpleTable
          headers={
            <>
              <Text style={[styles.tableHeaderCell, styles.colIdx]}>#</Text>
              <Text style={[styles.tableHeaderCell, styles.colName]}>
                {data.topCustomersHeaders.customer}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colSm]}>
                {data.topCustomersHeaders.count}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colNum]}>
                {data.topCustomersHeaders.revenue}
              </Text>
            </>
          }
          rows={
            data.topCustomers.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{data.emptyNote}</Text>
              </View>
            ) : (
              data.topCustomers.map((c, i) => (
                <View
                  key={i}
                  style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <Text style={[styles.tableCell, styles.colIdx]}>
                    {String(i + 1)}
                  </Text>
                  <Text style={[styles.tableCellBold, styles.colName]}>
                    {c.name}
                    {c.phone ? `\n${c.phone}` : ""}
                  </Text>
                  <Text style={[styles.tableCell, styles.colSm]}>
                    {String(c.count)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colNum]}>
                    {c.revenue.toLocaleString("ar-SA")} {sym}
                  </Text>
                </View>
              ))
            )
          }
        />

        <Text style={styles.sectionTitle}>{data.topProductsTitle}</Text>
        <SimpleTable
          headers={
            <>
              <Text style={[styles.tableHeaderCell, styles.colIdx]}>#</Text>
              <Text style={[styles.tableHeaderCell, styles.colName]}>
                {data.topProductsHeaders.product}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colSm]}>
                {data.topProductsHeaders.quantity}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colNum]}>
                {data.topProductsHeaders.revenue}
              </Text>
            </>
          }
          rows={
            data.topProducts.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{data.emptyNote}</Text>
              </View>
            ) : (
              data.topProducts.map((p, i) => (
                <View
                  key={i}
                  style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <Text style={[styles.tableCell, styles.colIdx]}>
                    {String(i + 1)}
                  </Text>
                  <Text style={[styles.tableCellBold, styles.colName]}>
                    {p.name}
                  </Text>
                  <Text style={[styles.tableCell, styles.colSm]}>
                    {String(p.qty)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colNum]}>
                    {p.revenue.toLocaleString("ar-SA")} {sym}
                  </Text>
                </View>
              ))
            )
          }
        />

        <Text style={styles.sectionTitle}>{data.topServicesTitle}</Text>
        <SimpleTable
          headers={
            <>
              <Text style={[styles.tableHeaderCell, styles.colIdx]}>#</Text>
              <Text style={[styles.tableHeaderCell, styles.colName]}>
                {data.topServicesHeaders.service}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colSm]}>
                {data.topServicesHeaders.count}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colNum]}>
                {data.topServicesHeaders.revenue}
              </Text>
            </>
          }
          rows={
            data.topServices.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{data.emptyNote}</Text>
              </View>
            ) : (
              data.topServices.map((s, i) => (
                <View
                  key={i}
                  style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <Text style={[styles.tableCell, styles.colIdx]}>
                    {String(i + 1)}
                  </Text>
                  <Text style={[styles.tableCellBold, styles.colName]}>
                    {s.name}
                  </Text>
                  <Text style={[styles.tableCell, styles.colSm]}>
                    {String(s.count)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colNum]}>
                    {s.revenue.toLocaleString("ar-SA")} {sym}
                  </Text>
                </View>
              ))
            )
          }
        />

        <Text style={styles.footer}>{data.pageFooter}</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>{data.inventoryTitle}</Text>
        <Text style={styles.meta}>{data.inventorySummary}</Text>

        {data.lowStock.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
              {data.lowStockTitle}
            </Text>
            <SimpleTable
              headers={
                <>
                  <Text style={[styles.tableHeaderCell, styles.colName]}>
                    {data.lowStockHeaders.product}
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.colSm]}>
                    {data.lowStockHeaders.stock}
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.colSm]}>
                    {data.lowStockHeaders.minStock}
                  </Text>
                </>
              }
              rows={data.lowStock.map((p, i) => (
                <View
                  key={i}
                  style={[
                    styles.tableRow,
                    i % 2 === 1 ? styles.tableRowAlt : {},
                  ]}
                >
                  <Text style={[styles.tableCellBold, styles.colName]}>
                    {p.name}
                  </Text>
                  <Text style={[styles.tableCell, styles.colSm]}>
                    {String(p.stock)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colSm]}>
                    {String(p.minStock)}
                  </Text>
                </View>
              ))}
            />
          </>
        ) : null}

        <Text style={styles.sectionTitle}>{data.recentTitle}</Text>
        <SimpleTable
          headers={
            <>
              <Text style={[styles.tableHeaderCell, styles.colName]}>
                {data.recentHeaders.invoice}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colSm]}>
                {data.recentHeaders.date}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colName]}>
                {data.recentHeaders.customer}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colSm]}>
                {data.recentHeaders.status}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colNum]}>
                {data.recentHeaders.amount}
              </Text>
            </>
          }
          rows={
            data.recentInvoices.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{data.emptyNote}</Text>
              </View>
            ) : (
              data.recentInvoices.map((inv, i) => (
                <View
                  key={i}
                  style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <Text style={[styles.tableCell, styles.colName]}>
                    {inv.number}
                  </Text>
                  <Text style={[styles.tableCell, styles.colSm]}>
                    {inv.date}
                  </Text>
                  <Text style={[styles.tableCell, styles.colName]}>
                    {inv.customer}
                  </Text>
                  <Text style={[styles.tableCell, styles.colSm]}>
                    {inv.status}
                  </Text>
                  <Text style={[styles.tableCell, styles.colNum]}>
                    {inv.amount.toLocaleString("ar-SA")} {sym}
                  </Text>
                </View>
              ))
            )
          }
        />

        <Text style={styles.footer}>{data.pageFooter}</Text>
      </Page>
    </Document>
  );
}
