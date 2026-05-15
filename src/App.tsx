import { useLenis } from "@/hooks/useLenis";
import Navbar from "@/sections/Navbar";
import HeroSection from "@/sections/HeroSection";
import DemandGallery from "@/sections/DemandGallery";
import CylinderMarquee from "@/sections/CylinderMarquee";
import MatchPanel from "@/sections/MatchPanel";
import SubmitForm from "@/sections/SubmitForm";

function App() {
  useLenis();

  return (
    <div className="relative">
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
          <p className="text-sm text-warm-gray/50">
            &copy; 2025 姐妹找房. 女生租房招租信息匹配
          </p>
          <p className="text-sm text-warm-gray/50">
            安全 · 私密 · 省心
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;