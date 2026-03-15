function Table({ columns, rows, onEdit, onDelete }) {
  const normalizedColumns = columns.map((column, index) => {
    if (typeof column === "string") {
      return {
        header: column,
        accessor: index,
      };
    }

    return column;
  });

  const getCellValue = (row, accessor) => {
    if (Array.isArray(row)) {
      return row[accessor];
    }

    return row[accessor];
  };

  const hasActions =
    typeof onEdit === "function" || typeof onDelete === "function";

  return (
    <div className="erp-table-wrapper">
      <table className="erp-table">
        <thead>
          <tr>
            {normalizedColumns.map((column, index) => (
              <th key={column.accessor ?? index}>{column.header}</th>
            ))}
            {hasActions && (
              <th className="erp-table__actions-header">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, rowIndex) => (
              <tr key={row?.id ?? rowIndex}>
                {normalizedColumns.map((column, columnIndex) => (
                  <td key={column.accessor ?? columnIndex}>
                    {typeof column.render === "function"
                      ? column.render(getCellValue(row, column.accessor), row)
                      : getCellValue(row, column.accessor)}
                  </td>
                ))}
                {hasActions && (
                  <td className="erp-table__actions-cell">
                    <div className="erp-table__actions">
                      {typeof onEdit === "function" && (
                        <button
                          type="button"
                          className="erp-table__action-btn erp-table__action-btn--edit"
                          onClick={() => onEdit(row, rowIndex)}
                        >
                          Edit
                        </button>
                      )}
                      {typeof onDelete === "function" && (
                        <button
                          type="button"
                          className="erp-table__action-btn erp-table__action-btn--delete"
                          onClick={() => onDelete(row, rowIndex)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={normalizedColumns.length + (hasActions ? 1 : 0)}
                className="erp-table__empty"
              >
                No records available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
