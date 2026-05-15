import RGBSplitRings from "@/components/RGBSplitRings";

const progressItems = [
  { label: "位置匹配度", value: 92 },
  { label: "预算匹配度", value: 85 },
  { label: "时间匹配度", value: 78 },
];

export default function MatchPanel() {
  return (
    <section className="bg-cream min-h-[60vh] flex items-center justify-center py-[80px] md:py-[120px]">
      <div className="max-w-2xl mx-auto px-6 lg:px-12 w-full">
        {/* Frosted glass panel */}
        <div className="backdrop-blur-md bg-white/60 rounded-3xl shadow-xl p-8 md:p-12 text-center">
          <h3 className="text-2xl text-warm-gray mb-8">
            正在帮你找合适的姐妹...
          </h3>

          {/* RGB Split Rings */}
          <div className="flex justify-center mb-10">
            <RGBSplitRings />
          </div>

          {/* Progress indicators */}
          <div className="space-y-6 max-w-sm mx-auto">
            {progressItems.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-warm-gray/70">{item.label}</span>
                  <span className="text-sm font-medium text-coral">{item.value}%</span>
                </div>
                <div className="h-1 bg-light-pink rounded-full overflow-hidden">
                  <div
                    className="h-full bg-coral rounded-full transition-all duration-1000"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}