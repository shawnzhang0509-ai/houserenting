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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { appendDemandPost } from "@/lib/demandStorage";
import { findMatchesForPost, formatMatchSummary } from "@/lib/matchEngine";
import { cn } from "@/lib/utils";
import { NZ_REGION_OPTIONS } from "@/data/nzRegions";
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
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [leaseLayout, setLeaseLayout] = useState("");
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

  const resetFields = () => {
    setNickname("");
    setWechat("");
    setLocation("");
    setDescription("");
    setLeaseLayout("");
    setLeaseTerm("");
    setSpecialSelected(new Set());
    setRentBracketId("");
    setBudgetBracketLowId("");
    setBudgetBracketHighId("");
    setMoveInDate("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim()) {
      toast.error("请选择房屋区域");
      return;
    }
    if (!leaseLayout) {
      toast.error("请选择租赁房型");
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
      leaseLayout,
      leaseTerm,
      specialRequirements: orderedSpecials,
    };

    let newPost: DemandPost;

    if (postType === "rental") {
      const br = getWeeklyRentBracketById(rentBracketId)!;
      newPost = {
        ...base,
        type: "rental",
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
      toast.success("本机判断：有匹配");
    } else {
      toast.success("已记在本浏览器里", {
        description: "仅本页面、本设备内会与之后提交的记录做匹配。",
      });
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

  return (
    <section
      id="submit-form"
      className="relative min-h-[100dvh] bg-white flex items-center overflow-hidden"
    >
      <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <DialogContent className="bg-[#FFF8F0] border-coral/15 text-warm-gray sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif-display text-xl text-warm-gray">
              匹配成功
            </DialogTitle>
            <DialogDescription className="text-warm-gray/70 text-left">
              本机判断：区域相同，租赁房型与期限一致，周租金与周预算区间有重叠，且求租方勾选的特殊要求出租方均已勾选。下方可复制双方微信等信息。
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-[80px] md:py-[120px] w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
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
              区域、房型、期限与纽币周租金均为选项；特殊要求可多选。求租方勾选的特殊项须出租方也勾选才会匹配。
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
              className="max-w-md mx-auto lg:mx-0 lg:ml-auto bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-gray-100"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPostType("rental")}
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
                    onClick={() => setPostType("seeking")}
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

                <div className="relative">
                  <MapPin
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40 z-10 pointer-events-none"
                    strokeWidth={1.5}
                  />
                  <Select
                    value={location || undefined}
                    onValueChange={setLocation}
                  >
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="选择房屋区域" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="max-h-[min(320px,70vh)] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                    >
                      {NZ_REGION_OPTIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-warm-gray/50 pl-1">
                    租赁房型
                  </p>
                  <Select
                    value={leaseLayout || undefined}
                    onValueChange={setLeaseLayout}
                  >
                    <SelectTrigger className={selectTriggerPlain}>
                      <SelectValue placeholder="选择租赁房型" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="max-h-[min(280px,70vh)] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                    >
                      {LEASE_LAYOUT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-warm-gray/50 pl-1">
                    租赁期限
                  </p>
                  <Select
                    value={leaseTerm || undefined}
                    onValueChange={setLeaseTerm}
                  >
                    <SelectTrigger className={selectTriggerPlain}>
                      <SelectValue placeholder="选择租赁期限" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {LEASE_TERM_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 rounded-xl border border-gray-100 bg-cream/40 p-4">
                  <p className="text-xs font-medium text-warm-gray/50">
                    特殊要求（可多选）
                  </p>
                  <div className="flex flex-col gap-3">
                    {SPECIAL_REQUIREMENT_OPTIONS.map((opt) => (
                      <div key={opt} className="flex items-center gap-3">
                        <Checkbox
                          id={`special-${opt}`}
                          checked={specialSelected.has(opt)}
                          onCheckedChange={() => toggleSpecial(opt)}
                          className="border-warm-gray/30 data-[state=checked]:bg-coral data-[state=checked]:border-coral"
                        />
                        <Label
                          htmlFor={`special-${opt}`}
                          className="text-sm font-normal text-warm-gray cursor-pointer"
                        >
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </div>
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
