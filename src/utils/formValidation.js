const FIELD_WRAPPER_SELECTOR = [
  ".login-form__field",
  ".hr-form__field",
  ".inv-form__field",
  ".sales-form__field",
  ".finance-form__field",
  ".it-form__field",
].join(", ");

function getFieldWrapper(field) {
  return field.closest(FIELD_WRAPPER_SELECTOR);
}

function clearFieldError(field) {
  const wrapper = getFieldWrapper(field);
  if (wrapper) {
    wrapper.removeAttribute("data-error");
  }

  field.removeAttribute("aria-invalid");
}

function getFieldLabel(field) {
  const wrapper = getFieldWrapper(field);
  const labelText = wrapper?.querySelector("label")?.textContent?.trim();
  return labelText || field.getAttribute("name") || "This field";
}

function isEmptyField(field) {
  if (field.disabled || field.readOnly) {
    return false;
  }

  const type = (field.getAttribute("type") || "").toLowerCase();
  if (
    ["button", "submit", "reset", "checkbox", "radio", "hidden"].includes(type)
  ) {
    return false;
  }

  return String(field.value ?? "").trim() === "";
}

function setFieldError(field, messageOverride) {
  const wrapper = getFieldWrapper(field);
  const fallbackMessage = `${getFieldLabel(field)} is required.`;
  const message = messageOverride || field.validationMessage || fallbackMessage;

  if (wrapper) {
    wrapper.setAttribute("data-error", message);
  }

  field.setAttribute("aria-invalid", "true");
}

export function validateFormWithInlineErrors(formElement) {
  const fields = Array.from(formElement.elements).filter(
    (field) => field instanceof HTMLElement && "willValidate" in field,
  );

  let isValid = true;

  fields.forEach((field) => {
    if (!field.willValidate) {
      return;
    }

    if (isEmptyField(field)) {
      setFieldError(field);
      isValid = false;
      return;
    }

    if (field.checkValidity()) {
      clearFieldError(field);
      return;
    }

    setFieldError(field);
    isValid = false;
  });

  return isValid;
}

export function handleFormFieldValidation(event) {
  const field = event.target;

  if (!(field instanceof HTMLElement) || !("willValidate" in field)) {
    return;
  }

  if (!field.willValidate) {
    return;
  }

  if (field.checkValidity()) {
    clearFieldError(field);
  }
}
