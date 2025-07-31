import { ZodSchema, ZodError, ZodObject, ZodRawShape } from 'zod';

// Validation result type
export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: ValidationError[];
}

export interface ValidationError {
    field: string;
    message: string;
    code?: string;
}

// Safe validation function
export function validateSafely<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
    try {
        const result = schema.parse(data);
        return {
            success: true,
            data: result,
        };
    } catch (error) {
        if (error instanceof ZodError) {
            const errors: ValidationError[] = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code,
            }));

            return {
                success: false,
                errors,
            };
        }

        return {
            success: false,
            errors: [{ field: 'unknown', message: 'Validation failed' }],
        };
    }
}

// Validation with throw
export function validateWithThrow<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = validateSafely(schema, data);

    if (!result.success) {
        const error = new Error('Validation failed');
        (error as any).validationErrors = result.errors;
        throw error;
    }

    return result.data!;
}

// Partial validation (for updates) - only works with ZodObject
export function validatePartial<T extends ZodRawShape>(
    schema: ZodObject<T>, 
    data: unknown
): ValidationResult<Partial<ZodObject<T>['_output']>> {
    const partialSchema = schema.partial();
    return validateSafely(partialSchema, data);
}

// Generic partial validation fallback
export function validatePartialGeneric<T>(
    schema: ZodSchema<T>, 
    data: unknown
): ValidationResult<T> {
    // For non-object schemas, just validate normally
    return validateSafely(schema, data);
}

// Array validation
export function validateArray<T>(schema: ZodSchema<T>, data: unknown[]): ValidationResult<T[]> {
    const results: T[] = [];
    const errors: ValidationError[] = [];

    data.forEach((item, index) => {
        const result = validateSafely(schema, item);
        if (result.success) {
            results.push(result.data!);
        } else {
            result.errors?.forEach(error => {
                errors.push({
                    ...error,
                    field: `[${index}].${error.field}`,
                });
            });
        }
    });

    if (errors.length > 0) {
        return {
            success: false,
            errors,
        };
    }

    return {
        success: true,
        data: results,
    };
}

// Format validation errors for API response
export function formatValidationErrors(errors: ValidationError[]): string {
    return errors.map(error => `${error.field}: ${error.message}`).join(', ');
}

// Check if error is validation error
export function isValidationError(error: any): error is Error & { validationErrors: ValidationError[] } {
    return error && error.validationErrors && Array.isArray(error.validationErrors);
}