/**
 * Copy helper with a legacy fallback.
 *
 * `navigator.clipboard` is unavailable on http:// origins and older mobile
 * Safari, which is exactly where an evaluator might run this screen — so we
 * degrade to a hidden textarea + execCommand rather than failing silently.
 */
export async function copyText(value) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // fall through to the legacy path
    }
  }

  if (typeof document === "undefined") return false;

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.top = "0";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  field.setSelectionRange(0, value.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  document.body.removeChild(field);
  return copied;
}
