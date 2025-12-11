import DashboardHeader from "./Header";
import MobileNav from "./components/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sea-blue">
      {/* Top Header - Kept for Desktop Nav & Mobile Branding */}
      <DashboardHeader />
      
      {/* Main Content - Added padding bottom for mobile nav */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-24 md:pb-10">
        {children}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
