import { Toaster, toast } from "sonner";
import { useAdminMode } from "@/hooks/useAdminMode";
import { useLenis } from "@/hooks/useLenis";
import Navbar from "@/sections/Navbar";
import HeroSection from "@/sections/HeroSection";
import DemandGallery from "@/sections/DemandGallery";
import CylinderMarquee from "@/sections/CylinderMarquee";
import MatchPanel from "@/sections/MatchPanel";
import SubmitForm from "@/sections/SubmitForm";

function App() {
  useLenis();
  const { registerAdminKnock } = useAdminMode();

  const handleFooterKnock = () => {
    if (registerAdminKnock()) {
      toast.success("已开启管理员模式", {
        description: "需求广场上可删除全部卡片（含示例与本机发布）",
      });
    }
  };

  return (
    <div className="relative">
      <Toaster position="top-center" richColors closeButton />
      <Navbar />
      <main>
        <HeroSection />
        <DemandGallery />
        <CylinderMarquee />
        <MatchPanel />
        <SubmitForm />
      </main>

      {/* Footer */}
      <footer className="bg-cream py-8 border-t border-coral/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleFooterKnock}
            className="text-sm text-warm-gray/50 hover:text-warm-gray/70 transition-colors"
          >
            &copy; 2025 姐妹找房. 女生租房招租信息匹配
          </button>
          <p className="text-sm text-warm-gray/50">
            安全 · 私密 · 省心
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;