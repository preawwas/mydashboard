import ForYouPage from '@/components/layout/ForYouPage';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ForPreawPage() {
    return (
        <DashboardLayout>
            <div className="w-full h-full flex flex-col justify-center animate-in fade-in duration-500">
                <ForYouPage />
            </div>
        </DashboardLayout>
    );
}
