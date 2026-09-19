import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCatalogProducts,
  addCatalogProduct,
  updateCatalogProduct,
  deleteCatalogProduct,
} from "./catalogProductsSlice";
import { fetchCatalogCategories } from "../categories/catalogCategoriesSlice";
import { DataGrid, Button, Card, Dialog, Input, Select, ImageUploader } from "@/components/ui";
import type { CatalogProduct } from "@/types";
import { formatDate, formatPrice } from "@/utils";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useSnackbar } from "@/components/ui";

export function CatalogProductsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useSnackbar();
  const products = useAppSelector((state) => state.catalogProducts.products);
  const categories = useAppSelector(
    (state) => state.catalogCategories.categories,
  );
  const loading = useAppSelector((state) => state.catalogProducts.loading);

  useEffect(() => {
    dispatch(fetchCatalogProducts());
    dispatch(fetchCatalogCategories());
  }, [dispatch]);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CatalogProduct | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [inStock, setInStock] = useState(true);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || p.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const resetForm = () => {
    setEditing(null);
    setName("");
    setPrice("");
    setCategoryId("");
    setImageUrl("");
    setDescription("");
    setInStock(true);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (p: CatalogProduct) => {
    setEditing(p);
    setName(p.name);
    setPrice(String(p.price));
    setCategoryId(p.categoryId);
    setImageUrl(p.imageUrl || "");
    setDescription(p.description || "");
    setInStock(p.inStock);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !price || !categoryId) {
      showSnackbar(t("catalog.requiredFields"), "error");
      return;
    }
    try {
      const payload = {
        name: name.trim(),
        price: parseFloat(price),
        categoryId,
        imageUrl: imageUrl.trim() || undefined,
        description: description.trim() || undefined,
        inStock,
      };
      if (editing) {
        await dispatch(
          updateCatalogProduct({ ...editing, ...payload }),
        ).unwrap();
        showSnackbar(t("catalog.updatedSuccess"), "success");
      } else {
        await dispatch(addCatalogProduct(payload as any)).unwrap();
        showSnackbar(t("catalog.createdSuccess"), "success");
      }
      setShowForm(false);
      resetForm();
    } catch {
      showSnackbar(t("catalog.saveError"), "error");
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteCatalogProduct(deleteId)).unwrap();
        setDeleteId(null);
        showSnackbar(t("catalog.deletedSuccess"), "success");
      } catch {
        showSnackbar(t("catalog.deleteError"), "error");
      }
    }
  };

  const columns = [
    {
      key: "name",
      header: t("catalog.productName"),
      sortable: true,
      render: (p: CatalogProduct) => (
        <span className="font-medium text-gray-900">{p.name}</span>
      ),
    },
    {
      key: "price",
      header: t("catalog.price"),
      render: (p: CatalogProduct) => formatPrice(p.price),
    },
    {
      key: "category",
      header: t("catalog.category"),
      render: (p: CatalogProduct) => p.category?.name || "—",
    },
    {
      key: "inStock",
      header: t("catalog.stock"),
      render: (p: CatalogProduct) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {p.inStock ? t("catalog.inStock") : t("catalog.outOfStock")}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: t("catalog.created"),
      render: (p: CatalogProduct) => formatDate(p.createdAt),
    },
    {
      key: "actions",
      header: t("catalog.actions"),
      render: (p: CatalogProduct) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openEdit(p)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteId(p.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("catalog.products")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("catalog.productCount", { count: products.length })}
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-4 w-4" />
          {t("catalog.newProduct")}
        </Button>
      </div>

      <Card>
        <div className="flex mb-4">
          <Select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: t("catalog.allCategories") },
              ...categoryOptions,
            ]}
            className="w-42 shrink-0"
          />
          <div className="relative ml-0 w-[12000px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("catalog.searchProducts")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 w-full"
            />
          </div>
        </div>
        <DataGrid
          columns={columns}
          data={paginated}
          keyExtractor={(p) => p.id}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          emptyMessage={t("catalog.empty")}
        />
      </Card>

      <Dialog
        open={showForm}
        onClose={() => {
          setShowForm(false);
          resetForm();
        }}
        title={editing ? t("catalog.editProduct") : t("catalog.newProduct")}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("catalog.productName")} *
            </label>
            <Input
              placeholder={t("catalog.productNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("catalog.price")} *
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("catalog.category")} *
              </label>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categoryOptions}
                placeholder={t("catalog.selectCategory")}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("catalog.image")}
            </label>
            <ImageUploader value={imageUrl} onChange={(url) => setImageUrl(url || "")} folder="pharmacycrm/products" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("catalog.description")}
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="inStock"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="rounded border-gray-300 text-blue-600"
            />
            <label
              htmlFor="inStock"
              className="text-sm font-medium text-gray-700"
            >
              {t("catalog.inStock")}
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave}>
            {editing ? t("common.save") : t("catalog.create")}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title={t("catalog.deleteProduct")}
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          {t("catalog.deleteConfirm")}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t("common.delete")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
