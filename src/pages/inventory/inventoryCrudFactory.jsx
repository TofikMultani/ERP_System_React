import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import {
  handleFormFieldValidation,
  validateFormWithInlineErrors,
} from "../../utils/formValidation.js";

function paginate(rows, page, pageSize) {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

export function createInventoryListPage(config) {
  return function InventoryListPage() {
    const navigate = useNavigate();
    const excelInputRef = useRef(null);
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [page, setPage] = useState(1);

    useEffect(() => {
      loadRows();
    }, []);

    async function loadRows() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await config.fetchRows();
        setRows(Array.isArray(data) ? data : []);
      } catch (error) {
        setErrorMessage(error.message || `Unable to load ${config.labelPlural} from database.`);
      } finally {
        setIsLoading(false);
      }
    }

    const filteredRows = useMemo(() => {
      const searchText = search.toLowerCase();
      return rows.filter((row) => {
        if (statusFilter !== "All") {
          const rowStatus = String(row.status || "").toLowerCase();
          if (rowStatus !== statusFilter.toLowerCase()) {
            return false;
          }
        }

        if (!searchText) {
          return true;
        }

        const searchBlob = config.searchFields
          .map((field) => String(row[field] ?? ""))
          .join(" ")
          .toLowerCase();

        return searchBlob.includes(searchText);
      });
    }, [rows, search, statusFilter]);

    const pageSize = config.pageSize || 8;
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pagedRows = paginate(filteredRows, currentPage, pageSize);

    const summaryCards = config.buildSummary ? config.buildSummary(rows) : [];

    async function handleDelete(row) {
      const keyValue = row[config.codeField];
      const shouldDelete = window.confirm(`Delete ${config.label} ${keyValue}?`);
      if (!shouldDelete) {
        return;
      }

      try {
        await config.deleteRow(keyValue);
        await loadRows();
      } catch (error) {
        window.alert(error.message || `Unable to delete ${config.label}.`);
      }
    }

    function handleEdit(row) {
      navigate(config.editRoute(row[config.codeField]));
    }

    async function handleImport(event) {
      if (!config.importParser || !config.importRows) {
        return;
      }

      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true });
        const parsedRows = rawRows.map(config.importParser).filter(Boolean);

        if (!parsedRows.length) {
          window.alert("No valid rows found in the selected Excel file.");
          return;
        }

        await config.importRows(parsedRows);
        await loadRows();
        window.alert(`${parsedRows.length} record(s) imported successfully.`);
      } catch (error) {
        window.alert(error.message || `Unable to import ${config.labelPlural}.`);
      } finally {
        event.target.value = "";
      }
    }

    return (
      <div className="inv-page">
        <div className="inv-page__header">
          <div>
            <h2>{config.title}</h2>
            <p>{config.description}</p>
          </div>
          <div className="hr-actions-row">
            {config.importRows ? (
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hr-file-input"
                onChange={handleImport}
              />
            ) : null}
            {config.importRows ? (
              <button
                type="button"
                className="inv-btn inv-btn--secondary"
                onClick={() => excelInputRef.current?.click()}
              >
                Import Excel
              </button>
            ) : null}
            <button type="button" className="inv-btn" onClick={() => navigate(config.newRoute)}>
              {config.addLabel}
            </button>
          </div>
        </div>

        <div className="inv-cards inv-cards--compact">
          {summaryCards.map((card) => (
            <Card key={card.title} {...card} />
          ))}
        </div>

        <div className="inv-panel">
          <div className="inv-panel__toolbar">
            <h3 className="inv-panel__title">
              {config.listTitle} ({filteredRows.length})
            </h3>
            <div className="inv-actions-row">
              {config.statusFilters?.length ? (
                <div className="inv-filter-group">
                  {config.statusFilters.map((filterValue) => (
                    <button
                      key={filterValue}
                      type="button"
                      className={`inv-filter-btn ${
                        statusFilter === filterValue ? "inv-filter-btn--active" : ""
                      }`}
                      onClick={() => {
                        setStatusFilter(filterValue);
                        setPage(1);
                      }}
                    >
                      {filterValue}
                    </button>
                  ))}
                </div>
              ) : null}
              <input
                className="inv-search"
                placeholder={config.searchPlaceholder}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {errorMessage && <p className="hr-inline-error">{errorMessage}</p>}

          <Table
            columns={config.columns}
            rows={isLoading ? [] : pagedRows}
            onEdit={handleEdit}
            onDelete={handleDelete}
            renderActions={
              config.renderActions
                ? (row) => config.renderActions(row, loadRows)
                : config.extraActionLabel && config.extraAction
                  ? (row) => (
                      <button
                        type="button"
                        className="erp-table__action-btn erp-table__action-btn--view"
                        onClick={async () => {
                          try {
                            await config.extraAction(row, loadRows);
                          } catch (error) {
                            window.alert(error.message || `Unable to complete ${config.extraActionLabel}.`);
                          }
                        }}
                      >
                        {config.extraActionLabel}
                      </button>
                    )
                  : undefined
            }
          />

          {totalPages > 1 ? (
            <div className="inv-pagination">
              <button
                type="button"
                className="inv-btn inv-btn--secondary"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="inv-btn inv-btn--secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  };
}

function toFieldValue(field, value) {
  if (field.type === "number") {
    return String(value ?? "");
  }

  if (field.type === "textarea") {
    return String(value ?? "");
  }

  return String(value ?? "");
}

export function createInventoryFormPage(config) {
  return function InventoryFormPage() {
    const navigate = useNavigate();
    const params = useParams();
    const codeValue = params[config.routeParam];
    const isEditMode = Boolean(codeValue);
    const [form, setForm] = useState(config.emptyForm);
    const [context, setContext] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
      let cancelled = false;

      async function loadForm() {
        setIsLoading(true);
        setErrorMessage("");

        try {
          const contextData = config.loadContext ? await config.loadContext() : {};
          if (!cancelled) {
            setContext(contextData || {});
          }

          if (isEditMode) {
            const rows = await config.fetchRows();
            const matchedRow = (Array.isArray(rows) ? rows : []).find(
              (row) => String(row[config.codeField]).toLowerCase() === String(codeValue).toLowerCase(),
            );

            if (!matchedRow) {
              if (!cancelled) {
                setErrorMessage(`${config.title} record not found.`);
                setForm(config.emptyForm);
              }
              return;
            }

            if (!cancelled) {
              setForm(config.mapRowToForm(matchedRow));
            }
            return;
          }

          const nextCode = await config.fetchNextCode();
          if (!cancelled) {
            setForm({ ...config.emptyForm, [config.codeField]: nextCode });
          }
        } catch (error) {
          if (!cancelled) {
            setErrorMessage(error.message || `Unable to load ${config.label} form.`);
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      }

      loadForm();

      return () => {
        cancelled = true;
      };
    }, [codeValue, isEditMode]);

    function handleChange(event) {
      const { name, value } = event.target;
      setForm((previous) => ({ ...previous, [name]: value }));
    }

    async function handleSubmit(event) {
      event.preventDefault();

      if (!validateFormWithInlineErrors(event.currentTarget)) {
        return;
      }

      setIsSaving(true);
      const payload = config.mapFormToApi(form);

      try {
        if (isEditMode) {
          await config.updateItem(codeValue, payload);
        } else {
          await config.createItem(payload);
        }

        navigate(config.listRoute);
      } catch (error) {
        window.alert(error.message || `Unable to save ${config.label}.`);
      } finally {
        setIsSaving(false);
      }
    }

    if (isEditMode && !isLoading && errorMessage) {
      return (
        <div className="inv-page">
          <div className="inv-page__header">
            <div>
              <h2>Edit {config.title}</h2>
              <p>{errorMessage}</p>
            </div>
            <button type="button" className="inv-btn inv-btn--secondary" onClick={() => navigate(config.listRoute)}>
              Back
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="inv-page">
        <div className="inv-page__header">
          <div>
            <h2>{isEditMode ? `Edit ${config.title}` : config.formTitle}</h2>
            <p>{config.formDescription}</p>
          </div>
          <button type="button" className="inv-btn inv-btn--secondary" onClick={() => navigate(config.listRoute)}>
            Back to List
          </button>
        </div>

        {!isLoading ? (
          <form className="inv-form inv-panel" onSubmit={handleSubmit} noValidate onChange={handleFormFieldValidation}>
            <h3 className="inv-panel__title">
              {isEditMode ? `Update ${config.title}` : `New ${config.title}`}
            </h3>
            <div className="inv-form__grid">
              {config.fields.map((field) => {
                const value = form[field.name];
                const fieldValue = toFieldValue(field, value);
                const options = field.options || (field.contextKey ? context[field.contextKey] || [] : []);

                return (
                  <div key={field.name} className={`inv-form__field ${field.fullWidth ? "inv-form__field--full" : ""}`}>
                    <label>{field.label}</label>
                    {field.type === "select" ? (
                      <select name={field.name} value={fieldValue} onChange={handleChange} required={field.required}>
                        <option value="">Select...</option>
                        {options.map((option) => (
                          <option key={option.value ?? option} value={option.value ?? option}>
                            {option.label ?? option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={fieldValue}
                        onChange={handleChange}
                        rows={field.rows || 4}
                        required={field.required}
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={fieldValue}
                        onChange={handleChange}
                        required={field.required}
                        placeholder={field.placeholder}
                        min={field.min}
                        step={field.step}
                        readOnly={field.readOnly}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <button type="submit" className="inv-btn inv-btn--submit" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditMode ? `Update ${config.title}` : `Save ${config.title}`}
            </button>
          </form>
        ) : null}
      </div>
    );
  };
}
