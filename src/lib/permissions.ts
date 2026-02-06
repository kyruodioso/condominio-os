export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    CONSORCIO_ADMIN = 'CONSORCIO_ADMIN',
    ADMIN = 'ADMIN', // Staff/Encargado
    OWNER = 'OWNER',
    TENANT = 'TENANT',
}

export enum PlanType {
    FREE = 'FREE',
    PRO = 'PRO',
}

export const PERMISSIONS = {
    MANAGE_ANNOUNCEMENTS: 'MANAGE_ANNOUNCEMENTS',
    MANAGE_MAINTENANCE: 'MANAGE_MAINTENANCE',
    MANAGE_PACKAGES: 'MANAGE_PACKAGES',
    MANAGE_EXPENSES: 'MANAGE_EXPENSES',
    MANAGE_PROVIDERS: 'MANAGE_PROVIDERS',
    VIEW_FINANCE: 'VIEW_FINANCE',
};

type Permission = keyof typeof PERMISSIONS;

export function can(user: { role: string }, permission: Permission, planType: string = PlanType.FREE): boolean {
    const role = user.role as Role;

    // ERROR HANDLING: If planType is undefined, default to FREE strictly
    const plan = (planType || PlanType.FREE) as PlanType;

    if (role === Role.SUPER_ADMIN) return true;

    switch (permission) {
        case PERMISSIONS.MANAGE_ANNOUNCEMENTS:
            // FREE: ADMIN can create announcements
            // PRO: Only CONSORCIO_ADMIN can create announcements
            if (plan === PlanType.FREE) return role === Role.ADMIN || role === Role.CONSORCIO_ADMIN;
            if (plan === PlanType.PRO) return role === Role.CONSORCIO_ADMIN;
            return false;

        case PERMISSIONS.MANAGE_MAINTENANCE:
        case PERMISSIONS.MANAGE_PACKAGES:
            // Both can manage operational tasks
            return role === Role.ADMIN || role === Role.CONSORCIO_ADMIN;

        case PERMISSIONS.MANAGE_EXPENSES:
        case PERMISSIONS.VIEW_FINANCE:
        case PERMISSIONS.MANAGE_PROVIDERS:
            // Only available in PRO and only for CONSORCIO_ADMIN
            if (plan !== PlanType.PRO) return false;
            return role === Role.CONSORCIO_ADMIN;

        default:
            return false;
    }
}
