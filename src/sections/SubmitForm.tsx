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
import { Button } from "@/components/ui/button";
import { appendDemandPost } from "@/lib/demandStorage";
import {
  findMatchesForPost,
  formatMatchSummaryForAdmin,
} from "@/lib/matchEngine";
import { notifyAdminMatch } from "@/lib/notifyAdmin";
import type { DemandPost, PostType } from "@/types/demand";

gsap.registerPlugin(ScrollTrigger);

type FormStatus = "idle" | "submitting" | "success";

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function SubmitForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [postType, setPostType] = useState<PostType>("rental");
  const formRef = useRef<HTMLDivElement>(null);

  const [nickname, setNickname] = useState("");
  const [wechat, setWechat] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [monthlyRent, setMonthlyRent] = useState("");
  const [roomType, setRoomType] = useState("");

  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [moveInDate, setMoveInDate] = useState("");

  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [lastMatches, setLastMatches] = useState<DemandPost[]>([]);
  const [lastNewPost, setLastNewPost] = useState<DemandPost | null>(null);
  const [notifyChannel, setNotifyChannel] = useState<
    "ntfy" | "mailto" | "none" | null
  >(null);
  const [notifyOk, setNotifyOk] = useState<boolean | null>(null);

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

  const resetFields = () => {
    setNickname("");
    setWechat("");
    setLocation("");
    setDescription("");
    setMonthlyRent("");
    setRoomType("");
    setBudgetMin("");
    setBudgetMax("");
    setMoveInDate("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rentNum = Number(monthlyRent);
    const bMin = Number(budgetMin);
    const bMax = Number(budgetMax);

    if (postType === "rental") {
      if (!Number.isFinite(rentNum) || rentNum <= 0) {
        toast.error("请填写有效的月租金");
        return;
      }
    } else {
      if (!Number.isFinite(bMin) || !Number.isFinite(bMax) || bMin <= 0 || bMax <= 0) {
        toast.error("请填写有效的预算区间");
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
    };

    const newPost: DemandPost =
      postType === "rental"
        ? {
            ...base,
            type: "rental",
            monthlyRent: rentNum,
            roomType: roomType.trim(),
          }
        : {
            ...base,
            type: "seeking",
            budgetMin: bMin,
            budgetMax: bMax,
            moveInDate: moveInDate,
          };

    const allAfter = appendDemandPost(newPost);
    const others = allAfter.filter((p) => p.id !== newPost.id);
    const matches = findMatchesForPost(newPost, others);

    if (matches.length > 0) {
      const summary = formatMatchSummaryForAdmin(newPost, matches);
      const notify = await notifyAdminMatch(summary);
      setLastNewPost(newPost);
      setLastMatches(matches);
      setNotifyChannel(notify.channel);
      setNotifyOk(notify.ok);
      setMatchDialogOpen(true);
      if (notify.ok && notify.channel === "ntfy") {
        toast.success("已通知站长，请留意推送");
      } else if (notify.ok && notify.channel === "mailto") {
        toast.info("已尝试打开邮件客户端发送提醒");
      } else if (!notify.ok) {
        toast.warning(
          notify.channel === "ntfy"
            ? `推送失败：${notify.error ?? "请检查 ntfy 地址"}`
            : "未配置推送：匹配内容已显示在弹窗中，请自行联系"
        );
      }
    } else {
      toast.success("已保存你的信息", {
        description:
          "当前为浏览器本地记录；若未配置跨设备数据，仅本机内可自动配对。",
      });
    }

    resetFields();
    setStatus("success");
    window.setTimeout(() => setStatus("idle"), 2200);
  };

  const copyMatchBlock = async () => {
    if (!lastNewPost) return;
    const text = formatMatchSummaryForAdmin(lastNewPost, lastMatches);
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败，请手动选中复制");
    }
  };

  const inputClasses =
    "w-full h-12 px-4 pl-11 rounded-xl border border-gray-200 bg-white text-warm-gray text-base placeholder:text-warm-gray/40 outline-none transition-all duration-200 focus:border-coral focus:shadow-[0_0_0_3px_rgba(255,107,107,0.15)]";

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
            <DialogDescription className="text-warm-gray/70 text-left space-y-2">
              <span className="block">
                双方都已留微信。请分别添加并拉群；下方可复制完整信息。
              </span>
              {notifyOk && notifyChannel === "ntfy" ? (
                <span className="block text-coral font-medium">
                  已向你的 ntfy 主题发送一条推送提醒。
                </span>
              ) : null}
              {notifyOk && notifyChannel === "mailto" ? (
                <span className="block text-coral font-medium">
                  若系统允许，应已打开邮件草稿；否则请查看弹窗内信息。
                </span>
              ) : null}
              {notifyOk === false ? (
                <span className="block text-amber-800/90">
                  推送未成功或未配置环境变量，请以弹窗内信息为准完成拉群。
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[40vh] overflow-y-auto rounded-xl border border-gray-200 bg-white/80 p-4 text-sm text-warm-gray/90 whitespace-pre-wrap font-mono leading-relaxed">
            {lastNewPost
              ? formatMatchSummaryForAdmin(lastNewPost, lastMatches)
              : ""}
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
              请留下微信号；匹配成功后会提醒站长，由站长加你们微信并拉群。
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
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40"
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
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40"
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    placeholder="微信号（站长匹配后加你拉群）"
                    className={inputClasses}
                    required
                    autoComplete="off"
                    value={wechat}
                    onChange={(e) => setWechat(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <MapPin
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40"
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    placeholder="房屋位置 / 期望区域"
                    className={inputClasses}
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                {postType === "rental" ? (
                  <>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/40 text-sm">
                        &yen;
                      </span>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        placeholder="月租金"
                        className={`${inputClasses} pl-8`}
                        required
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <Home
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40"
                        strokeWidth={1.5}
                      />
                      <input
                        type="text"
                        placeholder="房型，如：主卧、次卧、一居室"
                        className={inputClasses}
                        required
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/40 text-sm">
                          &yen;
                        </span>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          placeholder="最低预算"
                          className={`${inputClasses} pl-8`}
                          required
                          value={budgetMin}
                          onChange={(e) => setBudgetMin(e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/40 text-sm">
                          &yen;
                        </span>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          placeholder="最高预算"
                          className={`${inputClasses} pl-8`}
                          required
                          value={budgetMax}
                          onChange={(e) => setBudgetMax(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40"
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
                        : "描述你的需求：房型偏好、生活习惯、对室友的期望等"
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
