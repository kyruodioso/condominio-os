export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    CONSORCIO_ADMIN = 'CONSORCIO_ADMIN',
    STAFF = 'STAFF', // Renamed from ADMIN
    OWNER = 'OWNER',
    TENANT = 'TENANT',
}

export enum PlanType {
    FREE = 'FREE',
    PRO = 'PRO',
}

export const PERMISSIONS = {
    MANAGE_ANNOUNCEMENTS: 'MANAGE_ANNOUNCEMENTS', // Create/Edit/Delete
    MANAGE_MAINTENANCE: 'MANAGE_MAINTENANCE',
    MANAGE_PACKAGES: 'MANAGE_PACKAGES',
    MANAGE_EXPENSES: 'MANAGE_EXPENSES',
    MANAGE_PROVIDERS: 'MANAGE_PROVIDERS',
    VIEW_FINANCE: 'VIEW_FINANCE',
} as const;

type Permission = keyof typeof PERMISSIONS;

export function can(user: { role: string }, permission: Permission, planType: string = PlanType.FREE): boolean {
    // Normalize logic
    let roleStr = String(user.role || '').toUpperCase();
    if (roleStr === 'ADMIN') roleStr = 'STAFF'; // Backwards compatibility during migration

    const role = roleStr as Role;
    const plan = String(planType || PlanType.FREE).toUpperCase() as PlanType;

    if (role === Role.SUPER_ADMIN) return true;

    const isPro = plan === PlanType.PRO;

    switch (permission) {
        case PERMISSIONS.MANAGE_ANNOUNCEMENTS:
            // FREE Plan: STAFF handles everything (Operational Mode)
            if (!isPro) return role === Role.STAFF || role === Role.CONSORCIO_ADMIN;

            // PRO Plan: Only CONSORCIO_ADMIN (Strategic Mode). 
            // STAFF is restricted to operative tasks, can only READ announcements (handled by UI logic)
            return role === Role.CONSORCIO_ADMIN;

        case PERMISSIONS.MANAGE_MAINTENANCE:
        case PERMISSIONS.MANAGE_PACKAGES:
            // Operational tasks: Available to both STAFF and CONSORCIO_ADMIN in any plan
            return role === Role.STAFF || role === Role.CONSORCIO_ADMIN;

        case PERMISSIONS.MANAGE_EXPENSES:
        case PERMISSIONS.VIEW_FINANCE:
        case PERMISSIONS.MANAGE_PROVIDERS:
            // High-level Management: Strictly PRO and CONSORCIO_ADMIN
            if (!isPro) return false;
            return role === Role.CONSORCIO_ADMIN;

        default:
            return false;
    }
}
