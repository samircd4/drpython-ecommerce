/**
 * Extracts a user-friendly error message from a Django REST Framework error response.
 * @param {Object} error - The error object from axios.
 * @param {string} defaultMsg - The fallback message if no specific error is found.
 * @returns {string} - The extracted error message.
 */
export const getErrorMessage = (error, defaultMsg = "An error occurred. Please try again.") => {
    if (!error.response || !error.response.data) {
        return error.message || defaultMsg;
    }

    const data = error.response.data;

    // 1. Handle "detail" (common in DRF for single global errors)
    if (data.detail) {
        return data.detail;
    }

    // 2. Handle "error" or "message" (custom but common)
    if (data.error) return data.error;
    if (data.message) return data.message;

    // 3. Handle "non_field_errors" (common in DRF for validation errors not tied to a field)
    if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
        return data.non_field_errors[0];
    }

    // 4. Handle field-specific validation errors (e.g., {"email": ["message"]})
    // We pick the first error from the first field we find.
    const fields = Object.keys(data);
    if (fields.length > 0) {
        const firstField = fields[0];
        const fieldError = data[firstField];
        
        if (Array.isArray(fieldError) && fieldError.length > 0) {
            // Capitalize field name for better readability if desired, 
            // or just return the error message.
            return fieldError[0];
        } else if (typeof fieldError === 'string') {
            return fieldError;
        }
    }

    return defaultMsg;
};
