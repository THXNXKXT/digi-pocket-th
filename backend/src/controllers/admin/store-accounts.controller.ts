import { Context } from 'hono';
import { db } from '../../db';
import { storeBankAccounts } from '../../db/schemas/deposit';
import { eq, and, ilike, desc, count } from 'drizzle-orm';
import { 
  createStoreAccountSchema,
  updateStoreAccountSchema,
  storeAccountFilterSchema
} from '../../types/deposit.schemas';
import { 
  CreateStoreAccountInput,
  UpdateStoreAccountInput,
  PaginatedResponse,
  StoreBankAccount
} from '../../types/deposit.types';
import { ok, fail } from '../../utils/response';
import { validateInput } from '../../utils/validation';
import { asyncHandler } from '../../middleware/errorHandler';
import { activityService } from '../../services/activity.service';

/**
 * Get all store bank accounts with filtering and pagination
 */
export const listStoreAccounts = asyncHandler(async (c: Context) => {
  const query = c.req.query();
  const validatedQuery = validateInput(storeAccountFilterSchema, query);

  const { is_active, bank_name, page, limit } = validatedQuery;
  const offset = (page - 1) * limit;

  // Build where conditions
  const whereConditions = [];
  
  if (is_active !== undefined) {
    whereConditions.push(eq(storeBankAccounts.isActive, is_active));
  }
  
  if (bank_name) {
    whereConditions.push(ilike(storeBankAccounts.bankName, `%${bank_name}%`));
  }

  const whereClause = whereConditions.length > 0 
    ? and(...whereConditions) 
    : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(storeBankAccounts)
    .where(whereClause);

  const total = totalResult.count;

  // Get accounts
  const accounts = await db
    .select()
    .from(storeBankAccounts)
    .where(whereClause)
    .orderBy(desc(storeBankAccounts.createdAt))
    .limit(limit)
    .offset(offset);

  const response: PaginatedResponse<StoreBankAccount> = {
    data: accounts,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit)
    }
  };

  const { body: responseBody, status: responseStatus } = ok('Store accounts retrieved successfully', response);
  return c.json(responseBody, responseStatus as any);
});

/**
 * Get a single store bank account by ID
 */
export const getStoreAccount = asyncHandler(async (c: Context) => {
  const accountId = c.req.param('id');

  const [account] = await db
    .select()
    .from(storeBankAccounts)
    .where(eq(storeBankAccounts.id, accountId))
    .limit(1);

  if (!account) {
    const { body: errorBody, status: errorStatus } = fail('Store account not found', 404);
    return c.json(errorBody, errorStatus as any);
  }

  const { body: responseBody, status: responseStatus } = ok('Store account retrieved successfully', account);
  return c.json(responseBody, responseStatus as any);
});

/**
 * Create a new store bank account
 */
export const createStoreAccount = asyncHandler(async (c: Context) => {
  const admin = c.get('user');
  const requestBody = await c.req.json();
  
  const validatedData = validateInput(createStoreAccountSchema, requestBody);

  // Check if account number already exists
  const [existingAccount] = await db
    .select()
    .from(storeBankAccounts)
    .where(eq(storeBankAccounts.accountNumber, validatedData.account_number))
    .limit(1);

  if (existingAccount) {
    const { body: errorBody, status } = fail('Account number already exists', 400, {
      field: 'account_number',
      value: validatedData.account_number
    });
    return c.json(errorBody, status as any);
  }

  // Create new account
  const [newAccount] = await db
    .insert(storeBankAccounts)
    .values({
      accountNumber: validatedData.account_number,
      accountName: validatedData.account_name,
      bankName: validatedData.bank_name,
      promptpayNumber: validatedData.promptpay_number,
      isActive: validatedData.is_active,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();

  // Log admin action
  await activityService.logAdminAction(
    admin.sub,
    'system',
    `create_store_account_${newAccount.id}`,
    c
  );

  const { body: responseBody, status } = ok('Store account created successfully', newAccount);
  return c.json(responseBody, status as any);
});

/**
 * Update a store bank account
 */
export const updateStoreAccount = asyncHandler(async (c: Context) => {
  const admin = c.get('user');
  const accountId = c.req.param('id');
  const requestBody = await c.req.json();
  
  const validatedData = validateInput(updateStoreAccountSchema, requestBody);

  // Check if account exists
  const [existingAccount] = await db
    .select()
    .from(storeBankAccounts)
    .where(eq(storeBankAccounts.id, accountId))
    .limit(1);

  if (!existingAccount) {
    const { body: errorBody, status } = fail('Store account not found', 404);
    return c.json(errorBody, status as any);
  }

  // Check if new account number conflicts (if being updated)
  if (validatedData.account_number && validatedData.account_number !== existingAccount.accountNumber) {
    const [conflictingAccount] = await db
      .select()
      .from(storeBankAccounts)
      .where(eq(storeBankAccounts.accountNumber, validatedData.account_number))
      .limit(1);

    if (conflictingAccount) {
      const { body: errorBody, status } = fail('Account number already exists', 400, {
        field: 'account_number',
        value: validatedData.account_number
      });
      return c.json(errorBody, status as any);
    }
  }

  // Update account
  const updateData: Partial<typeof storeBankAccounts.$inferInsert> = {
    updatedAt: new Date()
  };

  if (validatedData.account_number !== undefined) {
    updateData.accountNumber = validatedData.account_number;
  }
  if (validatedData.account_name !== undefined) {
    updateData.accountName = validatedData.account_name;
  }
  if (validatedData.bank_name !== undefined) {
    updateData.bankName = validatedData.bank_name;
  }
  if (validatedData.promptpay_number !== undefined) {
    updateData.promptpayNumber = validatedData.promptpay_number;
  }
  if (validatedData.is_active !== undefined) {
    updateData.isActive = validatedData.is_active;
  }

  const [updatedAccount] = await db
    .update(storeBankAccounts)
    .set(updateData)
    .where(eq(storeBankAccounts.id, accountId))
    .returning();

  // Log admin action
  await activityService.logAdminAction(
    admin.sub,
    'system',
    `update_store_account_${accountId}`,
    c
  );

  const { body: responseBody, status } = ok('Store account updated successfully', updatedAccount);
  return c.json(responseBody, status as any);
});

/**
 * Toggle store account active status
 */
export const toggleStoreAccountStatus = asyncHandler(async (c: Context) => {
  const admin = c.get('user');
  const accountId = c.req.param('id');

  // Check if account exists
  const [existingAccount] = await db
    .select()
    .from(storeBankAccounts)
    .where(eq(storeBankAccounts.id, accountId))
    .limit(1);

  if (!existingAccount) {
    const { body: errorBody, status } = fail('Store account not found', 404);
    return c.json(errorBody, status as any);
  }

  // Toggle status
  const newStatus = !existingAccount.isActive;
  
  const [updatedAccount] = await db
    .update(storeBankAccounts)
    .set({ 
      isActive: newStatus,
      updatedAt: new Date()
    })
    .where(eq(storeBankAccounts.id, accountId))
    .returning();

  // Log admin action
  await activityService.logAdminAction(
    admin.sub,
    'system',
    `${newStatus ? 'activate' : 'deactivate'}_store_account_${accountId}`,
    c
  );

  const { body: responseBody, status: responseStatus } = ok(
    `Store account ${newStatus ? 'activated' : 'deactivated'} successfully`,
    updatedAccount
  );
  return c.json(responseBody, responseStatus as any);
});

/**
 * Delete a store bank account
 */
export const deleteStoreAccount = asyncHandler(async (c: Context) => {
  const admin = c.get('user');
  const accountId = c.req.param('id');

  // Check if account exists
  const [existingAccount] = await db
    .select()
    .from(storeBankAccounts)
    .where(eq(storeBankAccounts.id, accountId))
    .limit(1);

  if (!existingAccount) {
    const { body: errorBody, status } = fail('Store account not found', 404);
    return c.json(errorBody, status as any);
  }

  // TODO: Check if account has pending deposits before deletion
  // This would require checking depositRequests table

  // Delete account
  await db
    .delete(storeBankAccounts)
    .where(eq(storeBankAccounts.id, accountId));

  // Log admin action
  await activityService.logAdminAction(
    admin.sub,
    'system',
    `delete_store_account_${accountId}`,
    c
  );

  const { body: responseBody, status: responseStatus } = ok('Store account deleted successfully', {
    deleted_id: accountId
  });
  return c.json(responseBody, responseStatus as any);
});
