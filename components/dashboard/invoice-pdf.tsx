"use client";

import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Invoice } from "@/types";

// Register an Arabic-compatible font
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
    padding: 48,
    paddingBottom: 72,
    fontFamily: "IBM Plex Sans Arabic",
    fontSize: 10,
    color: "#1a1a1a",
    direction: "rtl",
  },

  /* ── Header ────────────────────────────────────── */
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  workshopName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 6,
    textAlign: "right",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#555555",
    marginBottom: 2,
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 11,
    color: "#555555",
    marginBottom: 2,
    textAlign: "right",
  },
  date: {
    fontSize: 9,
    color: "#888888",
    textAlign: "right",
  },
  headerLeft: {
    alignItems: "flex-start",
    marginTop: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
    fontSize: 9,
    fontWeight: 700,
  },

  /* ── Divider ───────────────────────────────────── */
  divider: {
    marginVertical: 14,
  },

  /* ── Info section ──────────────────────────────── */
  infoGrid: {
    flexDirection: "row-reverse",
    gap: 24,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
  },
  infoCardIcon: {
    fontSize: 8,
    color: "#888888",
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: 4,
    textAlign: "right",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1a1a1a",
    textAlign: "right",
    marginBottom: 1,
  },
  infoSub: {
    fontSize: 9,
    color: "#777777",
    textAlign: "right",
  },

  /* ── Section title ─────────────────────────────── */
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 6,
    textAlign: "right",
  },

  /* ── Table ──────────────────────────────────────── */
  tableContainer: {
    marginBottom: 20,
  },
  tableHeaderRow: {
    flexDirection: "row-reverse",
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: "#f5f5f5",
  },
  tableHeaderCell: {
    color: "#1a1a1a",
    fontSize: 9,
    fontWeight: 700,
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row-reverse",
    paddingVertical: 7,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  tableRowLast: {},
  tableCell: {
    fontSize: 10,
    color: "#444444",
    textAlign: "right",
  },
  tableCellBold: {
    fontSize: 10,
    color: "#1a1a1a",
    fontWeight: 700,
    textAlign: "right",
  },

  /* column flex */
  colIdx: { width: 20, textAlign: "center" as const },
  colName: { flex: 3 },
  colQty: { flex: 1.2, textAlign: "center" as const },
  colUnit: { flex: 1, textAlign: "center" as const },
  colPrice: { flex: 1.4, textAlign: "left" as const },

  /* ── Totals ─────────────────────────────────────── */
  totalsOuter: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    marginTop: 4,
  },
  totalsBox: {
    width: 220,
  },
  totalsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  totalsLabel: {
    fontSize: 10,
    color: "#777777",
    textAlign: "right",
  },
  totalsValue: {
    fontSize: 10,
    color: "#1a1a1a",
    textAlign: "left",
  },
  discountValue: {
    fontSize: 10,
    color: "#1a1a1a",
    textAlign: "left",
  },
  finalRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginTop: 4,
  },
  finalLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1a1a1a",
    textAlign: "right",
  },
  finalValue: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1a1a1a",
    textAlign: "left",
  },

  /* ── Notes ──────────────────────────────────────── */
  notesSection: {
    marginTop: 20,
    paddingTop: 12,
  },
  notesLabel: {
    fontSize: 9,
    color: "#888888",
    fontWeight: 700,
    marginBottom: 4,
    textAlign: "right",
  },
  notesText: {
    fontSize: 10,
    color: "#444444",
    textAlign: "right",
    lineHeight: 1.7,
  },

  /* ── Footer ─────────────────────────────────────── */
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: "#999999",
  },
});

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  PENDING: { bg: "#fef9c3", color: "#a16207", label: "معلقة" },
  COMPLETED: { bg: "#dcfce7", color: "#15803d", label: "مكتملة" },
  CANCELLED: { bg: "#fee2e2", color: "#b91c1c", label: "ملغاة" },
};

const UNIT_LABELS: Record<string, string> = {
  piece: "قطعة",
  liter: "لتر",
  kilogram: "كجم",
  meter: "متر",
  box: "صندوق",
  set: "طقم",
};

interface InvoicePDFProps {
  invoice: Invoice;
  currency?: string;
  workshopName?: string;
}

export function InvoicePDF({ invoice, currency = "ر.س", workshopName = "" }: InvoicePDFProps) {
  const statusConf = STATUS_COLORS[invoice.status] || STATUS_COLORS.PENDING;
  const createdAt = new Date(invoice.createdAt).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalPrice = Number(invoice.totalPrice);
  const finalPrice = Number(invoice.finalPrice);
  const discount = totalPrice - finalPrice;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRight}>
            {workshopName ? <Text style={styles.workshopName}>{workshopName}</Text> : null}
            <Text style={styles.title}>فاتورة</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text style={styles.date}>{createdAt}</Text>
          </View>
          <View style={styles.headerLeft}>
            <Text
              style={[
                styles.statusBadge,
                { backgroundColor: statusConf.bg, color: statusConf.color },
              ]}
            >
              {statusConf.label}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Customer & Car Info */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardIcon}>العميل</Text>
            <Text style={styles.infoValue}>{invoice.customer.name}</Text>
            <Text style={styles.infoSub}>{invoice.customer.phone}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardIcon}>السيارة</Text>
            <Text style={styles.infoValue}>
              {invoice.car.name}
            </Text>
            <Text style={styles.infoSub}>{invoice.car.number}</Text>
            <Text style={styles.infoSub}>
              {invoice.car.model}  {invoice.car.color}
            </Text>
          </View>
        </View>

        {/* Services Table */}
        {invoice.services.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>الخدمات</Text>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, styles.colIdx]}>#</Text>
                <Text style={[styles.tableHeaderCell, styles.colName]}>الخدمة</Text>
                <Text style={[styles.tableHeaderCell, styles.colPrice]}>السعر</Text>
              </View>
              {invoice.services.map((s, i) => (
                <View
                  key={s.id}
                  style={[
                    styles.tableRow,
                    i % 2 === 1 ? styles.tableRowAlt : {},
                    i === invoice.services.length - 1 ? styles.tableRowLast : {},
                  ]}
                >
                  <Text style={[styles.tableCell, styles.colIdx]}>
                    {String(i + 1)}
                  </Text>
                  <Text style={[styles.tableCellBold, styles.colName]}>
                    {s.service.name}
                  </Text>
                  <Text style={[styles.tableCell, styles.colPrice]}>
                    {String(Number(s.price))}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Products Table */}
        {invoice.products.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>المنتجات</Text>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, styles.colIdx]}>#</Text>
                <Text style={[styles.tableHeaderCell, styles.colName]}>المنتج</Text>
                <Text style={[styles.tableHeaderCell, styles.colQty]}>الكمية</Text>
                <Text style={[styles.tableHeaderCell, styles.colUnit]}>سعر الوحدة</Text>
                <Text style={[styles.tableHeaderCell, styles.colPrice]}>الإجمالي</Text>
              </View>
              {invoice.products.map((p, i) => (
                <View
                  key={p.id}
                  style={[
                    styles.tableRow,
                    i % 2 === 1 ? styles.tableRowAlt : {},
                    i === invoice.products.length - 1 ? styles.tableRowLast : {},
                  ]}
                >
                  <Text style={[styles.tableCell, styles.colIdx]}>
                    {String(i + 1)}
                  </Text>
                  <Text style={[styles.tableCellBold, styles.colName]}>
                    {p.product.name}
                  </Text>
                  <Text style={[styles.tableCell, styles.colQty]}>
                    {String(Number(p.quantity))}
                  </Text>
                  <Text style={[styles.tableCell, styles.colUnit]}>
                    {String(Number(p.unitPrice))}
                  </Text>
                  <Text style={[styles.tableCell, styles.colPrice]}>
                    {String(Number(p.total))}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Totals */}
        <View style={styles.totalsOuter}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>الإجمالي</Text>
              <Text style={styles.totalsValue}>
                {String(totalPrice)}
              </Text>
            </View>
            {discount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>الخصم</Text>
                <Text style={styles.discountValue}>
                  {String(-discount)}
                </Text>
              </View>
            )}
            <View style={styles.finalRow}>
              <Text style={styles.finalLabel}>المبلغ النهائي</Text>
              <Text style={styles.finalValue}>
                {String(finalPrice)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>ملاحظات</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{invoice.invoiceNumber}</Text>
          <Text style={styles.footerText}>{createdAt}</Text>
        </View>
      </Page>
    </Document>
  );
}
