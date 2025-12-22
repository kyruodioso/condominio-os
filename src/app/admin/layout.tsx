import AdminNotificationSystem from '@/components/admin/AdminNotificationSystem';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <AdminNotificationSystem />
        </>
    );
}
