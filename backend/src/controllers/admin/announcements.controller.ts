import { Context } from 'hono';
import { announcementService } from '../../services/announcement.service';
import { ok, fail } from '../../utils/response';
import {
    createAnnouncementSchema,
    updateAnnouncementSchema,
    adminAnnouncementFiltersSchema,
    uuidParamSchema,
    ANNOUNCEMENT_ERROR_CODES,
} from '../../types';

export async function listAdminAnnouncements(c: Context) {
    try {
        // Parse query parameters
        const queryParams = c.req.query();
        const parsed = adminAnnouncementFiltersSchema.safeParse(queryParams);

        if (!parsed.success) {
            const resp = fail('Invalid query parameters', 400, parsed.error);
            return c.json(resp.body, resp.status as any);
        }

        const result = await announcementService.getAdminAnnouncements(parsed.data);

        const resp = ok('Success', result);
        return c.json(resp.body, resp.status as any);
    } catch (error) {
        const resp = fail('Failed to fetch announcements', 500);
        return c.json(resp.body, resp.status as any);
    }
}

export async function createAnnouncement(c: Context) {
    try {
        const body = await c.req.json();
        const parsed = createAnnouncementSchema.safeParse(body);

        if (!parsed.success) {
            const resp = fail('Invalid input', 400, parsed.error);
            return c.json(resp.body, resp.status as any);
        }

        const user = c.get('user');
        const announcement = await announcementService.createAnnouncement(parsed.data, user.sub);

        const resp = ok('Announcement created successfully', announcement);
        return c.json(resp.body, resp.status as any);
    } catch (error) {
        const errorMessage = (error as Error).message;

        if (errorMessage === ANNOUNCEMENT_ERROR_CODES.INVALID_PUBLISH_DATE) {
            const resp = fail('Publish date must be in the future', 400);
            return c.json(resp.body, resp.status as any);
        }

        if (errorMessage === ANNOUNCEMENT_ERROR_CODES.INVALID_EXPIRY_DATE) {
            const resp = fail('Expiry date must be after publish date', 400);
            return c.json(resp.body, resp.status as any);
        }

        const resp = fail('Failed to create announcement', 500);
        return c.json(resp.body, resp.status as any);
    }
}

export async function updateAnnouncement(c: Context) {
    try {
        // Parse and validate ID parameter
        const params = { id: c.req.param('id') };
        const parsedParams = uuidParamSchema.safeParse(params);

        if (!parsedParams.success) {
            const resp = fail('Invalid announcement ID', 400, parsedParams.error);
            return c.json(resp.body, resp.status as any);
        }

        const body = await c.req.json();
        const parsed = updateAnnouncementSchema.safeParse(body);

        if (!parsed.success) {
            const resp = fail('Invalid input', 400, parsed.error);
            return c.json(resp.body, resp.status as any);
        }

        const announcement = await announcementService.updateAnnouncement(parsedParams.data.id, parsed.data);

        const resp = ok('Announcement updated successfully', announcement);
        return c.json(resp.body, resp.status as any);
    } catch (error) {
        const errorMessage = (error as Error).message;

        if (errorMessage === ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_NOT_FOUND) {
            const resp = fail('Announcement not found', 404);
            return c.json(resp.body, resp.status as any);
        }

        if (errorMessage === ANNOUNCEMENT_ERROR_CODES.INVALID_PUBLISH_DATE) {
            const resp = fail('Publish date must be in the future', 400);
            return c.json(resp.body, resp.status as any);
        }

        if (errorMessage === ANNOUNCEMENT_ERROR_CODES.INVALID_EXPIRY_DATE) {
            const resp = fail('Expiry date must be after publish date', 400);
            return c.json(resp.body, resp.status as any);
        }

        const resp = fail('Failed to update announcement', 500);
        return c.json(resp.body, resp.status as any);
    }
}

export async function deleteAnnouncement(c: Context) {
    try {
        // Parse and validate ID parameter
        const params = { id: c.req.param('id') };
        const parsed = uuidParamSchema.safeParse(params);

        if (!parsed.success) {
            const resp = fail('Invalid announcement ID', 400, parsed.error);
            return c.json(resp.body, resp.status as any);
        }

        await announcementService.deleteAnnouncement(parsed.data.id);

        const resp = ok('Announcement deleted successfully', { success: true });
        return c.json(resp.body, resp.status as any);
    } catch (error) {
        const errorMessage = (error as Error).message;

        if (errorMessage === ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_NOT_FOUND) {
            const resp = fail('Announcement not found', 404);
            return c.json(resp.body, resp.status as any);
        }

        if (errorMessage === ANNOUNCEMENT_ERROR_CODES.CANNOT_DELETE_PUBLISHED) {
            const resp = fail('Cannot delete published announcement. Archive it first.', 400);
            return c.json(resp.body, resp.status as any);
        }

        const resp = fail('Failed to delete announcement', 500);
        return c.json(resp.body, resp.status as any);
    }
}

export async function publishAnnouncement(c: Context) {
    try {
        // Parse and validate ID parameter
        const params = { id: c.req.param('id') };
        const parsed = uuidParamSchema.safeParse(params);

        if (!parsed.success) {
            const resp = fail('Invalid announcement ID', 400, parsed.error);
            return c.json(resp.body, resp.status as any);
        }

        await announcementService.publishAnnouncement(parsed.data.id);

        const resp = ok('Announcement published successfully', { success: true });
        return c.json(resp.body, resp.status as any);
    } catch (error) {
        const errorMessage = (error as Error).message;

        if (errorMessage === ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_NOT_FOUND) {
            const resp = fail('Announcement not found', 404);
            return c.json(resp.body, resp.status as any);
        }

        if (errorMessage === ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_EXPIRED) {
            const resp = fail('Cannot publish expired announcement', 400);
            return c.json(resp.body, resp.status as any);
        }

        if (errorMessage.includes('Cannot publish announcement with status:')) {
            const resp = fail(errorMessage, 400);
            return c.json(resp.body, resp.status as any);
        }

        const resp = fail('Failed to publish announcement', 500);
        return c.json(resp.body, resp.status as any);
    }
}

export async function archiveAnnouncement(c: Context) {
    try {
        // Parse and validate ID parameter
        const params = { id: c.req.param('id') };
        const parsed = uuidParamSchema.safeParse(params);

        if (!parsed.success) {
            const resp = fail('Invalid announcement ID', 400, parsed.error);
            return c.json(resp.body, resp.status as any);
        }

        await announcementService.archiveAnnouncement(parsed.data.id);

        const resp = ok('Announcement archived successfully', { success: true });
        return c.json(resp.body, resp.status as any);
    } catch (error) {
        const errorMessage = (error as Error).message;

        if (errorMessage === ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_NOT_FOUND) {
            const resp = fail('Announcement not found', 404);
            return c.json(resp.body, resp.status as any);
        }

        if (errorMessage.includes('Cannot archive announcement with status:')) {
            const resp = fail(errorMessage, 400);
            return c.json(resp.body, resp.status as any);
        }

        const resp = fail('Failed to archive announcement', 500);
        return c.json(resp.body, resp.status as any);
    }
}

export async function getAnnouncementAnalytics(c: Context) {
    try {
        // Parse and validate ID parameter
        const params = { id: c.req.param('id') };
        const parsed = uuidParamSchema.safeParse(params);

        if (!parsed.success) {
            const resp = fail('Invalid announcement ID', 400, parsed.error);
            return c.json(resp.body, resp.status as any);
        }

        const analytics = await announcementService.getAnnouncementAnalytics(parsed.data.id);

        const resp = ok('Success', analytics);
        return c.json(resp.body, resp.status as any);
    } catch (error) {
        const errorMessage = (error as Error).message;

        if (errorMessage === ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_NOT_FOUND) {
            const resp = fail('Announcement not found', 404);
            return c.json(resp.body, resp.status as any);
        }

        const resp = fail('Failed to get announcement analytics', 500);
        return c.json(resp.body, resp.status as any);
    }
}