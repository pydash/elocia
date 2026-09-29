/**
 * Safely extracts a clean, human-readable error message from backend responses,
 * handling FastAPI Pydantic validation errors (which return an array of objects)
 * as well as standard strings or exceptions.
 */
export function extractApiErrorMessage(
  errorData: any,
  fallback: string = "An unexpected error occurred"
): string {
  if (!errorData) {
    return fallback;
  }

  // Handle direct string message
  if (typeof errorData === "string") {
    return errorData;
  }

  // Handle if an Error instance was passed
  if (errorData instanceof Error) {
    return errorData.message || fallback;
  }

  const detail = errorData.detail ?? errorData.message;

  // Case 1: detail is a plain string
  if (typeof detail === "string") {
    return detail;
  }

  // Case 2: detail is a FastAPI/Pydantic validation error array
  // Example: [{ loc: ["body", "password"], msg: "String should have at least 6 characters", type: "string_too_short" }]
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item: any) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const field = Array.isArray(item.loc)
            ? item.loc.filter((part: any) => part !== "body").join(" ")
            : "";
          const msg = item.msg || "Invalid value";
          return field ? `${field}: ${msg}` : msg;
        }
        return String(item);
      })
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(". ");
    }
  }

  // Case 3: detail is an object
  if (typeof detail === "object" && detail !== null) {
    return JSON.stringify(detail);
  }

  return fallback;
}
