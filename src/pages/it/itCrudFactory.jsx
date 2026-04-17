import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/Card.jsx';
import Table from '../../components/Table.jsx';

function normalizeOption(option) {
  if (typeof option === 'string') {
    return { value: option, label: option };
  }

  if (option && typeof option === 'object') {
    return {
      value: String(option.value ?? ''),
      label: String(option.label ?? option.value ?? ''),
    };
  }

  return { value: '', label: '' };
}

function validateField(field, value) {
  const text = String(value ?? '').trim();

  if (field.readOnly) {
    return '';
  }

  if (field.required && field.type !== 'checkbox' && !text) {
    return `${field.label} is required.`;
  }

  if (field.type === 'number' && text) {
    const parsed = Number(text);
    if (!Number.isFinite(parsed)) {
      return `${field.label} must be a valid number.`;
    }

    if (typeof field.min === 'number' && parsed < field.min) {
      return `${field.label} must be at least ${field.min}.`;
    }

    if (typeof field.max === 'number' && parsed > field.max) {
      return `${field.label} must be at most ${field.max}.`;
    }
  }

  return '';
}

function validateFormValues(formValues, fields) {
  const errors = {};

  fields.forEach((field) => {
    const message = validateField(field, formValues[field.name]);
    if (message) {
      errors[field.name] = message;
    }
  });

  return errors;
}

function paginate(rows, page, pageSize) {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

function normalizeTableColumns(columns = []) {
  return columns.map((column, index) => {
    if (typeof column === 'string') {
      return {
        header: column,
        accessor: index,
      };
    }

    const accessor = column.accessor ?? column.key;
    const header = column.header ?? column.label ?? String(accessor ?? '');

    if (typeof column.format === 'function') {
      return {
        header,
        accessor,
        render: (value) => {
          try {
            return column.format(value);
          } catch (error) {
            console.error(`Format error for column ${accessor}:`, error);
            return String(value ?? '');
          }
        },
      };
    }

    return {
      header,
      accessor,
      render: column.render,
    };
  });
}

function toFieldValue(field, value) {
  if (field.type === 'number' || field.type === 'textarea') {
    return String(value ?? '');
  }

  return String(value ?? '');
}

export function createItListPage(config) {
  return function ItListPage() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);

    useEffect(() => {
      loadRows();
    }, []);

    async function loadRows() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await config.fetchRows();
        setRows(Array.isArray(data) ? data : []);
      } catch (error) {
        setErrorMessage(error.message || `Unable to load ${config.labelPlural}.`);
      } finally {
        setIsLoading(false);
      }
    }

    const filteredRows = useMemo(() => {
      const searchText = search.toLowerCase();
      return rows.filter((row) => {
        if (statusFilter !== 'All') {
          const rowStatus = String(row.status || '').toLowerCase();
          if (rowStatus !== statusFilter.toLowerCase()) {
            return false;
          }
        }

        if (!searchText) {
          return true;
        }

        const searchBlob = config.searchFields
          .map((field) => String(row[field] ?? ''))
          .join(' ')
          .toLowerCase();

        return searchBlob.includes(searchText);
      });
    }, [rows, search, statusFilter]);

    const pageSize = config.pageSize || 10;
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pagedRows = paginate(filteredRows, currentPage, pageSize);
    const normalizedColumns = normalizeTableColumns(config.columns);
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

    return (
      <div className="it-page it-crud-page">
        <div className="it-page__header it-page__header--with-actions">
          <div>
            <h2>{config.pageTitle}</h2>
            <p>Manage {config.labelPlural.toLowerCase()} with live database records.</p>
          </div>
          <div className="it-actions">
            <button type="button" className="it-btn" onClick={() => navigate(config.newRoute)}>
              {config.addLabel}
            </button>
          </div>
        </div>

        <div className="it-cards it-cards--compact">
          {summaryCards.map((card) => (
            <Card key={card.title} {...card} />
          ))}
        </div>

        <div className="it-panel">
          <div className="it-panel__toolbar">
            <h3 className="it-panel__title">
              {config.listTitle} ({filteredRows.length})
            </h3>
            <div className="it-actions-row">
              {config.statusFilters?.length ? (
                <div className="it-filter-group">
                  {config.statusFilters.map((filterValue) => (
                    <button
                      key={filterValue}
                      type="button"
                      className={`it-filter-btn ${
                        statusFilter === filterValue ? 'it-filter-btn--active' : ''
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
                className="it-search"
                placeholder={config.searchPlaceholder}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {errorMessage && <p className="it-inline-error">{errorMessage}</p>}

          <Table
            columns={normalizedColumns}
            rows={isLoading ? [] : pagedRows}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {totalPages > 1 ? (
            <div className="it-pagination">
              <button
                type="button"
                className="it-btn it-btn--secondary"
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
                className="it-btn it-btn--secondary"
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

export function createItFormPage(config) {
  return function ItFormPage() {
    const navigate = useNavigate();
    const params = useParams();
    const codeValue = params[config.routeParam];
    const isEditMode = Boolean(codeValue);
    const [form, setForm] = useState(config.emptyForm);
    const [context, setContext] = useState({});
    const [globalErrors, setGlobalErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      let isMounted = true;

      const loadFormData = async () => {
        try {
          if (isEditMode && codeValue) {
            const row = await config.fetchRow(codeValue);
            if (isMounted) {
              setForm(config.rowToForm(row));
            }
          } else {
            const nextCode = await config.fetchNextCode();
            if (isMounted) {
              setForm((prevForm) => ({
                ...prevForm,
                [config.codeField]: nextCode,
              }));
            }
          }
        } catch (error) {
          if (isEditMode) {
            window.alert(error.message || `Unable to load ${config.label}.`);
            navigate(config.listRoute);
          } else {
            console.error('Error fetching next code:', error);
          }
        }
      };

      loadFormData();

      return () => {
        isMounted = false;
      };
    }, [codeValue, isEditMode, navigate]);

    useEffect(() => {
      let isMounted = true;

      const loadContext = async () => {
        try {
          if (config.loadContext) {
            const ctx = await config.loadContext();
            if (isMounted) {
              setContext(ctx);
            }
          }
        } catch (error) {
          console.error('Error loading context:', error);
        }
      };

      loadContext();

      return () => {
        isMounted = false;
      };
    }, []);

    async function handleSubmit(event) {
      event.preventDefault();

      const errors = validateFormValues(form, config.fields);
      if (Object.keys(errors).length) {
        setGlobalErrors(errors);
        return;
      }

      setIsSubmitting(true);

      try {
        const data = config.formToRow(form);

        if (isEditMode) {
          await config.updateRow(codeValue, data);
        } else {
          await config.createRow(data);
        }

        navigate(config.listRoute);
      } catch (error) {
        window.alert(error.message || `Unable to save ${config.label}.`);
      } finally {
        setIsSubmitting(false);
      }
    }

    function handleFieldChange(fieldName, value) {
      setForm((prevForm) => ({
        ...prevForm,
        [fieldName]: value,
      }));

      const field = config.fields.find((item) => item.name === fieldName);
      const error = field ? validateField(field, value) : '';
      if (error) {
        setGlobalErrors((prevErrors) => ({
          ...prevErrors,
          [fieldName]: error,
        }));
      } else {
        setGlobalErrors((prevErrors) => {
          const updated = { ...prevErrors };
          delete updated[fieldName];
          return updated;
        });
      }
    }

    return (
      <div className="it-page it-crud-page">
        <div className="it-page__header it-page__header--with-actions">
          <button
            type="button"
            className="it-btn it-btn--back"
            onClick={() => navigate(config.listRoute)}
          >
            ← Back to {config.labelPlural}
          </button>
          <div>
            <h2>{isEditMode ? `Edit ${config.label}` : `New ${config.label}`}</h2>
            <p>Fill in the required fields and save.</p>
          </div>
        </div>

        <form className="it-form" onSubmit={handleSubmit}>
          <div className="it-form__fields">
            {config.fields.map((field) => {
              const value = toFieldValue(field, form[field.name]);
              const error = globalErrors[field.name];
              const fieldClassName = [
                'it-form__field',
                field.fullWidth || field.type === 'textarea' ? 'it-form__field--full' : '',
              ]
                .join(' ')
                .trim();

              return (
                <div key={field.name} className={fieldClassName}>
                  <label htmlFor={field.name} className="it-form__label">
                    {field.label}
                  </label>

                  {field.type === 'select' ? (
                    <select
                      id={field.name}
                      name={field.name}
                      className={`it-form__input ${error ? 'it-form__input--error' : ''}`}
                      value={value}
                      onChange={(event) => handleFieldChange(field.name, event.target.value)}
                      disabled={isSubmitting}
                      required={field.required}
                    >
                      <option value="">Select {field.label}</option>
                      {Array.isArray(field.options)
                        ? field.options.map((option) => {
                            const normalized = normalizeOption(option);
                            return (
                              <option key={normalized.value} value={normalized.value}>
                                {normalized.label}
                              </option>
                            );
                          })
                        : []}
                      {context[field.optionsFrom]
                        ? context[field.optionsFrom].map((item) => {
                            const normalized = normalizeOption(item);
                            return (
                              <option key={normalized.value} value={normalized.value}>
                                {normalized.label}
                              </option>
                            );
                          })
                        : []}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      className={`it-form__input it-form__textarea ${
                        error ? 'it-form__input--error' : ''
                      }`}
                      value={value}
                      onChange={(event) => handleFieldChange(field.name, event.target.value)}
                      disabled={isSubmitting}
                      required={field.required}
                      rows={field.rows || 4}
                      placeholder={field.placeholder}
                      readOnly={field.readOnly}
                    />
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type || 'text'}
                      className={`it-form__input ${error ? 'it-form__input--error' : ''}`}
                      value={value}
                      onChange={(event) => handleFieldChange(field.name, event.target.value)}
                      disabled={isSubmitting}
                      required={field.required}
                      placeholder={field.placeholder}
                      readOnly={field.readOnly}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                    />
                  )}

                  {error && <p className="it-form__error">{error}</p>}
                </div>
              );
            })}
          </div>

          <div className="it-form__actions">
            <button
              type="button"
              className="it-btn it-btn--secondary"
              onClick={() => navigate(config.listRoute)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="it-btn"
              disabled={isSubmitting || Object.keys(globalErrors).length > 0}
            >
              {isSubmitting
                ? 'Saving...'
                : isEditMode
                  ? `Save ${config.label}`
                  : `Create ${config.label}`}
            </button>
          </div>
        </form>
      </div>
    );
  };
}
