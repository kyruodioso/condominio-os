import { BottomNav } from "@/components/layout/BottomNav";

export default function GymLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-md mx-auto px-5 py-8">
            {children}
            <BottomNav />
        </div>
    );
}
