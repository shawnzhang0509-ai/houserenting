import { useState, useRef, useEffect } from "react";
import {
  User,
  MapPin,
  Calendar,
  ArrowRight,
  Check,
  Home,
  Search,
  MessageCircle,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { appendDemandPost } from "@/lib/demandStorage";
import { findMatchesForPost, formatMatchSummary } from "@/lib/matchEngine";
import { cn } from "@/lib/utils";
import {
  NZ_REGION_GROUPS,
  getRegionsInGroup,
} from "@/data/nzRegions";
import {
  NZ_WEEKLY_RENT_BRACKETS,
  getWeeklyRentBracketById,
  formatWeeklyRentBracketLabel,
} from "@/data/nzWeeklyRentBrackets";
import {
  LEASE_LAYOUT_OPTIONS,
  LEASE_TERM_OPTIONS,
  SPECIAL_REQUIREMENT_OPTIONS,
} from "@/data/leaseFields";
import type { DemandPost, PostType } from "@/types/demand";

gsap.registerPlugin(ScrollTrigger);

type FormStatus = "idle" | "submitting" | "success";

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function mergeSeekingBudgetBrackets(
  idA: string,
  idB: string
): { min: number; max: number } | null {
  const ba = getWeeklyRentBracketById(idA);
  const bb = getWeeklyRentBracketById(idB);
  if (!ba || !bb) return null;
  const lowBracket = ba.min <= bb.min ? ba : bb;
  const highBracket = lowBracket === ba ? bb : ba;
  return { min: lowBracket.min, max: highBracket.max };
}

export default function SubmitForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [postType, setPostType] = useState<PostType>("rental");
  const formRef = useRef<HTMLDivElement>(null);

  const [nickname, setNickname] = useState("");
  const [wechat, setWechat] = useState("");
  const [locationGroupId, setLocationGroupId] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [leaseLayout, setLeaseLayout] = useState("");
  const [leaseLayoutsSelected, setLeaseLayoutsSelected] = useState<Set<string>>(
    () => new Set()
  );
  const [leaseTerm, setLeaseTerm] = useState("");
  const [specialSelected, setSpecialSelected] = useState<Set<string>>(
    () => new Set()
  );

  const [rentBracketId, setRentBracketId] = useState("");

  const [budgetBracketLowId, setBudgetBracketLowId] = useState("");
  const [budgetBracketHighId, setBudgetBracketHighId] = useState("");
  const [moveInDate, setMoveInDate] = useState("");

  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [lastMatches, setLastMatches] = useState<DemandPost[]>([]);
  const [lastNewPost, setLastNewPost] = useState<DemandPost | null>(null);

  useEffect(() => {
    if (!formRef.current) return;

    gsap.fromTo(
      formRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: formRef.current,
          start: "top 85%",
          once: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const toggleSpecial = (key: string) => {
    setSpecialSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const orderedSpecials = SPECIAL_REQUIREMENT_OPTIONS.filter((o) =>
    specialSelected.has(o)
  );

  const orderedLeaseLayouts = LEASE_LAYOUT_OPTIONS.filter((o) =>
    leaseLayoutsSelected.has(o)
  );

  const toggleLeaseLayout = (key: string) => {
    setLeaseLayoutsSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const resetFields = () => {
    setNickname("");
    setWechat("");
    setLocationGroupId("");
    setLocation("");
    setDescription("");
    setLeaseLayout("");
    setLeaseLayoutsSelected(new Set());
    setLeaseTerm("");
    setSpecialSelected(new Set());
    setRentBracketId("");
    setBudgetBracketLowId("");
    setBudgetBracketHighId("");
    setMoveInDate("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationGroupId) {
      toast.error("请先选择大区");
      return;
    }
    if (!location.trim()) {
      toast.error("请选择具体区域");
      return;
    }
    if (postType === "rental") {
      if (!leaseLayout) {
        toast.error("请选择租赁房型（单选）");
        return;
      }
    } else if (leaseLayoutsSelected.size === 0) {
      toast.error("请至少选择一种可接受的租赁房型");
      return;
    }
    if (!leaseTerm) {
      toast.error("请选择租赁期限");
      return;
    }

    if (postType === "rental") {
      const br = getWeeklyRentBracketById(rentBracketId);
      if (!br) {
        toast.error("请选择周租金区间（纽币）");
        return;
      }
    } else {
      if (!budgetBracketLowId || !budgetBracketHighId) {
        toast.error("请选择周预算区间（纽币）");
        return;
      }
      const merged = mergeSeekingBudgetBrackets(
        budgetBracketLowId,
        budgetBracketHighId
      );
      if (!merged) {
        toast.error("周预算档位无效");
        return;
      }
    }

    setStatus("submitting");

    const base = {
      id: newId(),
      createdAt: Date.now(),
      nickname: nickname.trim(),
      location: location.trim(),
      wechat: wechat.trim(),
      description: description.trim(),
      leaseTerm,
      specialRequirements: orderedSpecials,
    };

    let newPost: DemandPost;

    if (postType === "rental") {
      const br = getWeeklyRentBracketById(rentBracketId)!;
      newPost = {
        ...base,
        type: "rental",
        leaseLayout,
        weeklyRentMin: br.min,
        weeklyRentMax: br.max,
      };
    } else {
      const merged = mergeSeekingBudgetBrackets(
        budgetBracketLowId,
        budgetBracketHighId
      )!;
      newPost = {
        ...base,
        type: "seeking",
        leaseLayouts: orderedLeaseLayouts,
        budgetWeeklyMin: merged.min,
        budgetWeeklyMax: merged.max,
        moveInDate: moveInDate,
      };
    }

    const allAfter = appendDemandPost(newPost);
    const others = allAfter.filter((p) => p.id !== newPost.id);
    const matches = findMatchesForPost(newPost, others);

    if (matches.length > 0) {
      setLastNewPost(newPost);
      setLastMatches(matches);
      setMatchDialogOpen(true);
      toast.success("已发布到需求广场，并发现本机匹配", {
        description: "你的信息在最上方，带「我发布的」标签。",
      });
    } else {
      toast.success("已发布到需求广场", {
        description: "在你本浏览器的「姐妹们的信息」最上方可见。",
        action: {
          label: "去看看",
          onClick: () =>
            document
              .getElementById("gallery")
              ?.scrollIntoView({ behavior: "smooth" }),
        },
      });
      window.setTimeout(() => {
        document
          .getElementById("gallery")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }

    resetFields();
    setStatus("success");
    window.setTimeout(() => setStatus("idle"), 2200);
  };

  const copyMatchBlock = async () => {
    if (!lastNewPost) return;
    const text = formatMatchSummary(lastNewPost, lastMatches);
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败，请手动选中复制");
    }
  };

  const inputClasses =
    "w-full h-12 px-4 pl-11 rounded-xl border border-gray-200 bg-white text-warm-gray text-base placeholder:text-warm-gray/40 outline-none transition-all duration-200 focus:border-coral focus:shadow-[0_0_0_3px_rgba(255,107,107,0.15)]";

  const selectTriggerClass = cn(
    "w-full h-12 pl-11 pr-10 rounded-xl border border-gray-200 bg-white text-warm-gray text-base outline-none transition-all duration-200",
    "focus:border-coral focus:shadow-[0_0_0_3px_rgba(255,107,107,0.15)]",
    "data-[placeholder]:text-warm-gray/40"
  );

  const selectTriggerPlain = cn(
    selectTriggerClass,
    "pl-4 text-left font-normal"
  );

  const choiceBlock = (active: boolean) =>
    cn(
      "w-full rounded-xl border px-4 py-3.5 text-left text-sm font-medium leading-snug transition-all duration-200",
      active
        ? "border-coral bg-coral/10 text-coral shadow-sm ring-1 ring-coral/20"
        : "border-gray-200 bg-white text-warm-gray hover:border-coral/35 active:scale-[0.99]"
    );

  return (
    <section
      id="submit-form"
      className="relative min-h-[100dvh] bg-white overflow-x-hidden py-10 sm:py-14 lg:flex lg:items-center lg:py-[80px] lg:min-h-[100dvh]"
    >
      <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <DialogContent className="bg-[#FFF8F0] border-coral/15 text-warm-gray sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif-display text-xl text-warm-gray">
              匹配成功
            </DialogTitle>
            <DialogDescription className="text-warm-gray/70 text-left">
              本机判断：区域相同，出租房型在求租方可接受列表内，租期一致，周租金与周预算有重叠，且求租勾选的特殊要求出租方均已勾选。下方可复制双方微信等信息。
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[40vh] overflow-y-auto rounded-xl border border-gray-200 bg-white/80 p-4 text-sm text-warm-gray/90 whitespace-pre-wrap font-mono leading-relaxed">
            {lastNewPost ? formatMatchSummary(lastNewPost, lastMatches) : ""}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="border-coral/30 text-warm-gray"
              onClick={() => setMatchDialogOpen(false)}
            >
              关闭
            </Button>
            <Button
              type="button"
              className="bg-coral hover:bg-coral-dark text-white"
              onClick={copyMatchBlock}
            >
              复制全部信息
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-soft-purple/10 hidden lg:block" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 lg:items-center">
          <div>
            <p className="text-sm font-medium text-coral tracking-widest mb-4">
              发布信息
            </p>
            <h2 className="font-serif-display text-[36px] md:text-[48px] leading-[1.2] text-warm-gray mb-6">
              发布你的
              <br />
              房源或需求
            </h2>
            <p className="text-base text-warm-gray/60 leading-[1.8] mb-8 max-w-md">
              {postType === "rental"
                ? "有房要出租？填写房源信息，我们帮你找到正在找房的女孩子。"
                : "正在找房住？发布你的需求，匹配到有房出租的姐妹。"}
              区域分两级选择；招租房型单选，求租可多选房型。租期、纽币周租与特殊要求为选项；求租勾选的特殊项须出租方也勾选才会匹配。
            </p>

            <div className="hidden lg:block">
              <div
                className="w-10 h-10 border-2 border-soft-purple"
                style={{
                  animation: "cube-rotate 10s linear infinite",
                  transformStyle: "preserve-3d",
                }}
              />
            </div>
          </div>

          <div ref={formRef}>
            <form
              onSubmit={handleSubmit}
              className="max-w-md mx-auto lg:mx-0 lg:ml-auto bg-white rounded-2xl p-5 sm:p-8 md:p-10 shadow-lg border border-gray-100 pb-8"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPostType("rental");
                      setLeaseLayoutsSelected(new Set());
                    }}
                    className={`flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-medium transition-all duration-200 ${
                      postType === "rental"
                        ? "bg-coral text-white shadow-sm"
                        : "bg-cream text-warm-gray/70 hover:bg-light-pink hover:text-coral"
                    }`}
                  >
                    <Home className="w-4 h-4" strokeWidth={1.5} />
                    我有房出租
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPostType("seeking");
                      setLeaseLayout("");
                    }}
                    className={`flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-medium transition-all duration-200 ${
                      postType === "seeking"
                        ? "bg-soft-purple text-white shadow-sm"
                        : "bg-cream text-warm-gray/70 hover:bg-[#F0E8FF] hover:text-soft-purple"
                    }`}
                  >
                    <Search className="w-4 h-4" strokeWidth={1.5} />
                    我正在找房
                  </button>
                </div>

                <div className="relative">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40 z-10 pointer-events-none"
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    placeholder="怎么称呼你"
                    className={inputClasses}
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <MessageCircle
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40 z-10 pointer-events-none"
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    placeholder="微信号（方便对上后联系）"
                    className={inputClasses}
                    required
                    autoComplete="off"
                    value={wechat}
                    onChange={(e) => setWechat(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <MapPin
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40 z-10 pointer-events-none"
                      strokeWidth={1.5}
                    />
                    <Select
                      value={locationGroupId || undefined}
                      onValueChange={(id) => {
                        setLocationGroupId(id);
                        setLocation("");
                      }}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="① 选择大区" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {NZ_REGION_GROUPS.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Select
                    key={locationGroupId || "none"}
                    value={location || undefined}
                    onValueChange={setLocation}
                    disabled={!locationGroupId}
                  >
                    <SelectTrigger
                      className={cn(
                        selectTriggerPlain,
                        !locationGroupId && "opacity-50 pointer-events-none"
                      )}
                    >
                      <SelectValue
                        placeholder={
                          locationGroupId
                            ? "② 选择具体区域"
                            : "请先选择大区"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="max-h-[min(280px,55vh)] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                    >
                      {getRegionsInGroup(locationGroupId).map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-xs text-coral/90 font-medium -mt-2 md:hidden">
                  请继续向下填写：租期、特殊要求、房型与周租金
                </p>

                <div className="rounded-2xl border border-coral/15 bg-cream/50 p-4 space-y-3">
                  <p className="text-sm font-semibold text-warm-gray">
                    租赁期限 <span className="text-coral">*</span>
                  </p>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {LEASE_TERM_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setLeaseTerm(opt)}
                        className={choiceBlock(leaseTerm === opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-coral/15 bg-cream/50 p-4 space-y-3">
                  <p className="text-sm font-semibold text-warm-gray">
                    特殊要求 <span className="text-warm-gray/50 font-normal text-xs">（可多选）</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SPECIAL_REQUIREMENT_OPTIONS.map((opt) => {
                      const on = specialSelected.has(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleSpecial(opt)}
                          className={cn(
                            "rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]",
                            on
                              ? "border-coral bg-coral text-white shadow-sm"
                              : "border-gray-200 bg-white text-warm-gray hover:border-coral/40"
                          )}
                          aria-pressed={on}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-soft-purple/25 bg-[#FAF7FF] p-4 space-y-3">
                  <p className="text-sm font-semibold text-warm-gray">
                    租赁房型 <span className="text-coral">*</span>
                    <span className="block text-xs font-normal text-warm-gray/55 mt-1">
                      {postType === "rental"
                        ? "招租：请选一种实际出租类型"
                        : "求租：可接受多种类型，多选"}
                    </span>
                  </p>
                  {postType === "rental" ? (
                    <div className="flex flex-col gap-2">
                      {LEASE_LAYOUT_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setLeaseLayout(opt)}
                          className={choiceBlock(leaseLayout === opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {LEASE_LAYOUT_OPTIONS.map((opt) => {
                        const on = leaseLayoutsSelected.has(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleLeaseLayout(opt)}
                            className={cn(
                              "rounded-full border px-3.5 py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px] max-w-full text-left leading-snug",
                              on
                                ? "border-soft-purple bg-soft-purple text-white shadow-sm"
                                : "border-gray-200 bg-white text-warm-gray hover:border-soft-purple/45"
                            )}
                            aria-pressed={on}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {postType === "rental" ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-warm-gray/50 pl-1">
                      周租金（纽币，$50 一档）
                    </p>
                    <Select
                      value={rentBracketId || undefined}
                      onValueChange={setRentBracketId}
                    >
                      <SelectTrigger className={selectTriggerPlain}>
                        <SelectValue placeholder="选择周租金区间" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className="max-h-[min(320px,70vh)] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                      >
                        {NZ_WEEKLY_RENT_BRACKETS.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {formatWeeklyRentBracketLabel(b)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-warm-gray/50 pl-1">
                        周预算（纽币）：选较低与较高两档，自动合并为总区间
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Select
                          value={budgetBracketLowId || undefined}
                          onValueChange={setBudgetBracketLowId}
                        >
                          <SelectTrigger className={selectTriggerPlain}>
                            <SelectValue placeholder="周预算（较低档）" />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            className="max-h-[min(280px,60vh)] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                          >
                            {NZ_WEEKLY_RENT_BRACKETS.map((b) => (
                              <SelectItem key={`lo-${b.id}`} value={b.id}>
                                {formatWeeklyRentBracketLabel(b)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={budgetBracketHighId || undefined}
                          onValueChange={setBudgetBracketHighId}
                        >
                          <SelectTrigger className={selectTriggerPlain}>
                            <SelectValue placeholder="周预算（较高档）" />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            className="max-h-[min(280px,60vh)] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                          >
                            {NZ_WEEKLY_RENT_BRACKETS.map((b) => (
                              <SelectItem key={`hi-${b.id}`} value={b.id}>
                                {formatWeeklyRentBracketLabel(b)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40 z-10 pointer-events-none"
                        strokeWidth={1.5}
                      />
                      <input
                        type="date"
                        className={inputClasses}
                        required
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <textarea
                    placeholder={
                      postType === "rental"
                        ? "描述一下房源情况：楼层、朝向、家具、周边配套等"
                        : "描述你的需求：生活习惯、对室友的期望等"
                    }
                    rows={4}
                    className={`${inputClasses} py-3 h-auto resize-none`}
                    style={{ paddingLeft: "1rem" }}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status !== "idle"}
                  className={`w-full h-14 rounded-xl font-medium text-base text-white flex items-center justify-center gap-2 transition-all duration-300 ${
                    status === "success"
                      ? "bg-soft-purple"
                      : postType === "rental"
                        ? "bg-coral hover:bg-coral-dark"
                        : "bg-soft-purple hover:bg-[#B89CE8]"
                  } disabled:opacity-80`}
                >
                  {status === "idle" && (
                    <>
                      {postType === "rental" ? "发布房源" : "发布找房需求"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                  {status === "submitting" && (
                    <span className="animate-pulse">提交中...</span>
                  )}
                  {status === "success" && (
                    <>
                      已提交 <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
