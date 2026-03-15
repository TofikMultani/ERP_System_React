export function deleteRowById(setRows, row, entityName) {
  const rowId = row?.id;
  if (rowId === undefined || rowId === null) {
    return;
  }

  const label = entityName || "record";
  const confirmed = window.confirm(`Delete this ${label}?`);
  if (!confirmed) {
    return;
  }

  setRows((previousRows) =>
    previousRows.filter((item) => String(item.id) !== String(rowId)),
  );
}

export function editRowAsJson(setRows, row, entityName) {
  const rowId = row?.id;
  if (rowId === undefined || rowId === null) {
    return;
  }

  const draft = { ...row };
  delete draft.id;

  const label = entityName || "record";
  const input = window.prompt(
    `Edit ${label} as JSON:`,
    JSON.stringify(draft, null, 2),
  );

  if (input === null) {
    return;
  }

  try {
    const parsed = JSON.parse(input);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      throw new Error("invalid-json-object");
    }

    setRows((previousRows) =>
      previousRows.map((item) =>
        String(item.id) === String(rowId)
          ? { ...item, ...parsed, id: item.id }
          : item,
      ),
    );
  } catch {
    window.alert("Invalid JSON. Please provide a valid JSON object.");
  }
}
