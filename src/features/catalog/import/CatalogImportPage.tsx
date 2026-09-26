import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCatalogProducts } from "../products/catalogProductsSlice";
import { fetchCatalogCategories } from "../categories/catalogCategoriesSlice";
import { catalogProductsApi } from "@/api/catalogProducts";
import { Button, Card, Badge, Dialog, Input, Select, useSnackbar } from "@/components/ui";
import { cn, formatPrice } from "@/utils";
import {
  parseImportCsv,
  parseNumber,
  getRowStatus,
  findDuplicateSkus,
  inStockFromRaw,
  chunk,
  decodeCsvBuffer,
} from "@/utils/csvImport";
import type { RawImportRow, RowStatus } from "@/utils/csvImport";
import type { CatalogProduct } from "@/types";
import {
  ArrowUpTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

type Phase = "upload" | "review" | "importing" | "done";
type Filter = "all" | RowStatus;

interface ImportSummary {
  created: number;
  updated: number;
  unchanged: number;
  errors: { rowNum: number; sku: string; message: string }[];
}

const BATCH_SIZE = 100;
const PER_PAGE = 50;

export function CatalogImportPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const products = useAppSelector((state) => state.catalogProducts.products);
  const productsLoading = useAppSelector((state) => state.catalogProducts.loading);
  const categories = useAppSelector((state) => state.catalogCategories.categories);

  const [phase, setPhase] = useState<Phase>("upload");
  const [rows, setRows] = useState<RawImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [foundHeaders, setFoundHeaders] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [newCategoryId, setNewCategoryId] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    dispatch(fetchCatalogProducts());
    dispatch(fetchCatalogCategories());
  }, [dispatch]);

  const existingBySku = useMemo(() => {
    const map = new Map<string, CatalogProduct>();
    for (const p of products) {
      if (p.sku) map.set(p.sku, p);
    }
    return map;
  }, [products]);

  const statuses = useMemo(() => {
    const map = new Map<number, RowStatus>();
    for (const r of rows) {
      const price = parseNumber(r.priceRaw);
      map.set(r.rowNum, getRowStatus(r, price, existingBySku.get(r.sku)?.price));
    }
    return map;
  }, [rows, existingBySku]);

  const counts = useMemo(() => {
    const c = { all: rows.length, new: 0, priceUpdate: 0, unchanged: 0, invalid: 0 };
    for (const st of statuses.values()) c[st] += 1;
    return c;
  }, [rows, statuses]);

  const duplicates = useMemo(() => findDuplicateSkus(rows), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && statuses.get(r.rowNum) !== filter) return false;
      if (q && !r.sku.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [rows, statuses, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const selectionStats = useMemo(() => {
    const stats = { created: 0, update: 0, unchanged: 0 };
    for (const r of rows) {
      if (!selected.has(r.rowNum)) continue;
      const st = statuses.get(r.rowNum);
      if (st === "new") stats.created += 1;
      else if (st === "priceUpdate") stats.update += 1;
      else if (st === "unchanged") stats.unchanged += 1;
    }
    return stats;
  }, [rows, selected, statuses]);

  const selectedValidCount =
    selectionStats.created + selectionStats.update + selectionStats.unchanged;
  const needsCategory = selectionStats.created > 0;
  const canImport = selectedValidCount > 0 && (!needsCategory || !!newCategoryId);

  const statusVariant = (st: RowStatus) =>
    st === "new"
      ? "info"
      : st === "priceUpdate"
        ? "warning"
        : st === "unchanged"
          ? "default"
          : "danger";

  const resetToUpload = () => {
    setPhase("upload");
    setRows([]);
    setFileName("");
    setMissing([]);
    setFoundHeaders([]);
    setSelected(new Set());
    setSearch("");
    setFilter("all");
    setPage(1);
    setNewCategoryId("");
    setSummary(null);
    setProcessed(0);
    setTotal(0);
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      showSnackbar(t("catalog.importInvalidType"), "error");
      return;
    }
    const buf = await file.arrayBuffer();
    const text = decodeCsvBuffer(buf);
    const parsed = parseImportCsv(text);
    if (parsed.missing.length > 0) {
      setRows([]);
      setFileName(file.name);
      setMissing(parsed.missing);
      setFoundHeaders(parsed.headers);
      return;
    }
    if (parsed.rows.length === 0) {
      showSnackbar(t("catalog.importEmpty"), "error");
      return;
    }
    setMissing([]);
    setFoundHeaders([]);
    setFileName(file.name);
    setRows(parsed.rows);
    setSelected(
      new Set(
        parsed.rows
          .filter((r) => r.sku && parseNumber(r.priceRaw) !== null)
          .map((r) => r.rowNum),
      ),
    );
    setSearch("");
    setFilter("all");
    setPage(1);
    setNewCategoryId("");
    setPhase("review");
  };

  const updateRow = (rowNum: number, patch: Partial<RawImportRow>) => {
    setRows((prev) => prev.map((r) => (r.rowNum === rowNum ? { ...r, ...patch } : r)));
  };

  const toggleRow = (row: RawImportRow) => {
    if (statuses.get(row.rowNum) === "invalid") return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(row.rowNum)) next.delete(row.rowNum);
      else next.add(row.rowNum);
      return next;
    });
  };

  const togglePageRows = () => {
    const validOnPage = paginated.filter((r) => statuses.get(r.rowNum) !== "invalid");
    const allSelected =
      validOnPage.length > 0 && validOnPage.every((r) => selected.has(r.rowNum));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const r of validOnPage) {
        if (allSelected) next.delete(r.rowNum);
        else next.add(r.rowNum);
      }
      return next;
    });
  };

  const buildPayloadRows = () => {
    const categoryName = categories.find((c) => c.id === newCategoryId)?.name ?? "";
    return rows
      .filter(
        (r) => selected.has(r.rowNum) && statuses.get(r.rowNum) !== "invalid",
      )
      .map((r) => {
        const existing = existingBySku.get(r.sku);
        return {
          rowNum: r.rowNum,
          item: {
            sku: r.sku,
            name: r.name,
            price: parseNumber(r.priceRaw) as number,
            categoryName: existing
              ? existing.category?.name || "Sin categoría"
              : categoryName,
            inStock: inStockFromRaw(r.stockRaw),
          },
        };
      });
  };

  const runImport = async () => {
    const payloadRows = buildPayloadRows();
    const items = payloadRows.map((p) => p.item);
    const batches = chunk(items, BATCH_SIZE);
    setConfirmOpen(false);
    setSummary(null);
    setProcessed(0);
    setTotal(items.length);
    setPhase("importing");

    const acc: ImportSummary = { created: 0, updated: 0, unchanged: 0, errors: [] };
    let offset = 0;
    try {
      for (const batch of batches) {
        const { data } = await catalogProductsApi.batchUpsert(batch);
        const r = data.data;
        acc.created += r.created;
        acc.updated += r.updated;
        acc.unchanged += r.unchanged;
        for (const e of r.errors) {
          acc.errors.push({
            rowNum: payloadRows[offset + e.index]?.rowNum ?? 0,
            sku: e.sku,
            message: e.message,
          });
        }
        offset += batch.length;
        setProcessed(offset);
      }
      setSummary(acc);
      dispatch(fetchCatalogProducts());
      setPhase("done");
    } catch (err: any) {
      showSnackbar(
        err.response?.data?.message || t("catalog.importUploadError"),
        "error",
      );
      setPhase("review");
    }
  };

  const renderUpload = () => (
    <Card>
      <div className="max-w-2xl mx-auto py-6 text-center space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("catalog.importTitle")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("catalog.importSubtitle")}
          </p>
        </div>

        <label
          className={cn(
            "block border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors",
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
        >
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <ArrowUpTrayIcon className="h-10 w-10 text-blue-500 mx-auto" />
          <p className="mt-3 text-sm font-medium text-gray-700">
            {t("catalog.importDrop")}
          </p>
          <p className="mt-1 text-xs text-gray-500">{t("catalog.importCsvOnly")}</p>
        </label>

        <div className="text-left bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-1">
          <p className="font-medium text-gray-700">
            {t("catalog.importRequiredColumns")}
          </p>
          <p>{t("catalog.importColumnHintSku")}</p>
          <p>{t("catalog.importColumnHintName")}</p>
          <p>{t("catalog.importColumnHintPrice")}</p>
          <p>{t("catalog.importColumnHintIgnored")}</p>
        </div>

        {missing.length > 0 && (
          <div className="text-left bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 space-y-1">
            <p>
              {t("catalog.importMissingColumns", { list: missing.join(", ") })}
            </p>
            <p className="text-xs text-red-600">
              {t("catalog.importFoundColumns", {
                found:
                  foundHeaders.length > 0 ? foundHeaders.join(", ") : "—",
              })}
            </p>
          </div>
        )}
      </div>
    </Card>
  );

  const renderReview = () => {
    const validOnPage = paginated.filter((r) => statuses.get(r.rowNum) !== "invalid");
    const pageAllSelected =
      validOnPage.length > 0 && validOnPage.every((r) => selected.has(r.rowNum));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("catalog.importReviewTitle")}
            </h2>
            <p className="text-sm text-gray-500">
              {fileName} · {t("catalog.importRowCount", { count: rows.length })}
              {duplicates.size > 0 &&
                ` · ${t("catalog.importDuplicates", { count: duplicates.size })}`}
              {productsLoading && ` · ${t("catalog.importLoadingProducts")}`}
            </p>
          </div>
          <Button variant="ghost" onClick={resetToUpload}>
            <ArrowLeftIcon className="h-4 w-4" />
            {t("catalog.importBack")}
          </Button>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {(
                ["all", "new", "priceUpdate", "unchanged", "invalid"] as Filter[]
              ).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setFilter(f);
                    setPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                  )}
                >
                  {t(`catalog.importFilter_${f}`)} ({counts[f]})
                </button>
              ))}
              <div className="relative ml-auto w-64">
                <Input
                  placeholder={t("catalog.importSearch")}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-3 w-full"
                />
              </div>
            </div>

            {needsCategory && (
              <div className="flex items-end gap-3 flex-wrap">
                <div className="w-72">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("catalog.importNewCategory")} *
                  </label>
                  <Select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                    placeholder={t("catalog.selectCategory")}
                  />
                </div>
                <p className="text-xs text-gray-500 pb-2">
                  {t("catalog.importNewCategoryHint", { count: selectionStats.created })}
                </p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                    <th className="py-2 pr-3 w-10">
                      <input
                        type="checkbox"
                        checked={pageAllSelected}
                        disabled={validOnPage.length === 0}
                        onChange={togglePageRows}
                        className="rounded border-gray-300 text-blue-600"
                      />
                    </th>
                    <th className="py-2 pr-3 font-medium">{t("catalog.importColSku")}</th>
                    <th className="py-2 pr-3 font-medium">
                      {t("catalog.importColProduct")}
                    </th>
                    <th className="py-2 pr-3 font-medium w-48">
                      {t("catalog.importColNewPrice")}
                    </th>
                    <th className="py-2 font-medium w-40">
                      {t("catalog.importColStatus")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row) => {
                    const st = statuses.get(row.rowNum) ?? "invalid";
                    const existing = existingBySku.get(row.sku);
                    const isInvalid = st === "invalid";
                    return (
                      <tr
                        key={row.rowNum}
                        className={cn(
                          "border-b border-gray-100",
                          isInvalid && "bg-red-50",
                        )}
                      >
                        <td className="py-2 pr-3">
                          <input
                            type="checkbox"
                            checked={selected.has(row.rowNum) && !isInvalid}
                            disabled={isInvalid}
                            onChange={() => toggleRow(row)}
                            className="rounded border-gray-300 text-blue-600 disabled:opacity-40"
                          />
                        </td>
                        <td className="py-2 pr-3 font-mono text-xs text-gray-700">
                          {row.sku || "—"}
                        </td>
                        <td className="py-2 pr-3">
                          <Input
                            value={row.name}
                            onChange={(e) => updateRow(row.rowNum, { name: e.target.value })}
                            className="w-full"
                          />
                          {isInvalid && (
                            <span className="text-xs text-red-600">
                              {t("catalog.importStatus_invalid")}
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          <Input
                            value={row.priceRaw}
                            onChange={(e) =>
                              updateRow(row.rowNum, { priceRaw: e.target.value })
                            }
                            className="w-full"
                          />
                          {existing && st === "priceUpdate" && (
                            <span className="text-xs text-gray-400">
                              {t("catalog.importCurrentPrice", {
                                price: formatPrice(existing.price),
                              })}
                            </span>
                          )}
                        </td>
                        <td className="py-2">
                          <Badge variant={statusVariant(st)}>
                            {t(`catalog.importStatus_${st}`)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        {t("catalog.importNoRows")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {t("catalog.importPageInfo", { page, total: totalPages })}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-200 pt-4 flex-wrap gap-3">
              <p className="text-sm text-gray-600">
                {t("catalog.importSelectedSummary", {
                  selected: selectedValidCount,
                  created: selectionStats.created,
                  updated: selectionStats.update,
                })}
                {needsCategory && !newCategoryId && (
                  <span className="text-red-600 ml-2">
                    {t("catalog.importNewCategoryRequired")}
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={resetToUpload}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={() => setConfirmOpen(true)} disabled={!canImport}>
                  {t("catalog.importAction", { count: selectedValidCount })}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderImporting = () => {
    const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
    return (
      <Card>
        <div className="py-12 max-w-md mx-auto text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("catalog.importInProgress")}
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">
            {t("catalog.importProgress", { done: processed, total })}
          </p>
        </div>
      </Card>
    );
  };

  const renderDone = () => (
    <div className="space-y-4">
      <Card>
        <div className="py-8 max-w-2xl mx-auto text-center space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("catalog.importDoneTitle")}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{fileName}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-700">
                {summary?.created ?? 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {t("catalog.importStatCreated")}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-yellow-700">
                {summary?.updated ?? 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {t("catalog.importStatUpdated")}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-gray-700">
                {summary?.unchanged ?? 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {t("catalog.importStatUnchanged")}
              </p>
            </div>
          </div>

          {summary && summary.errors.length > 0 && (
            <div className="text-left bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-700 mb-2">
                {t("catalog.importErrorsCount", { count: summary.errors.length })}
              </p>
              <ul className="space-y-1 text-xs text-red-600 max-h-48 overflow-y-auto">
                {summary.errors.slice(0, 100).map((e, i) => (
                  <li key={i}>
                    {t("catalog.importErrorRow", {
                      row: e.rowNum,
                      sku: e.sku || "—",
                      message: e.message,
                    })}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={resetToUpload}>
              {t("catalog.importAnother")}
            </Button>
            <Button onClick={() => navigate("/catalog/products")}>
              {t("catalog.importGoProducts")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("catalog.importCSV")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("catalog.importPageSubtitle")}
        </p>
      </div>

      {phase === "upload" && renderUpload()}
      {phase === "review" && renderReview()}
      {phase === "importing" && renderImporting()}
      {phase === "done" && renderDone()}

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("catalog.importConfirmTitle")}
        size="sm"
      >
        <p className="text-sm text-gray-600">
          {t("catalog.importConfirmBody", {
            created: selectionStats.created,
            updated: selectionStats.update,
          })}
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={runImport}>{t("catalog.importConfirmAction")}</Button>
        </div>
      </Dialog>
    </div>
  );
}
