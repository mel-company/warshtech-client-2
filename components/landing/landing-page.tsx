"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  Package,
  Wrench,
  UserCog,
  ShieldCheck,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Car,
  Sparkles,
  Star,
  Quote,
  ChevronDown,
  Play,
  Zap,
  TrendingUp,
  Settings,
  Smartphone,
  Lock,
  Headphones,
  Globe,
  Receipt,
  Calendar,
  CreditCard,
  Download,
  BarChart3,
  Clock,
  Bell,
  Shield,
  ChevronRight,
  StarIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// =============================================================================
// Simple Animation Hook
// =============================================================================

function useInView(ref: React.RefObject<HTMLElement | null>, options = { threshold: 0.1 }) {
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(element);
      }
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options]);

  return isInView;
}

function AnimatedSection({ children, className, delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// =============================================================================
// Navigation
// =============================================================================

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  );
}

function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex items-center gap-1 rounded-full bg-muted p-1">
      <button
        onClick={() => setLocale("ar")}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition-all",
          locale === "ar"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        العربية
      </button>
      <button
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition-all",
          locale === "en"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        English
      </button>
    </div>
  );
}

// =============================================================================
// Hero Dashboard Mockup
// =============================================================================

function HeroDashboard() {
  const [animated, setAnimated] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative mx-auto max-w-5xl animate-in slide-in-from-bottom-8 duration-700 fill-mode-forwards">
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-red-500" />
            <div className="size-3 rounded-full bg-yellow-500" />
            <div className="size-3 rounded-full bg-green-500" />
          </div>
          <div className="mx-auto flex-1 max-w-md">
            <div className="rounded-md bg-background px-3 py-1 text-xs text-muted-foreground text-center">
              app.x-erp.com/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-6">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "العملاء", value: "1,240", icon: Users },
              { label: "الفواتير", value: "856", icon: Receipt },
              { label: "الإيرادات", value: "45K", icon: CreditCard },
              { label: "الخدمات", value: "324", icon: Wrench },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl bg-muted/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="size-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="rounded-xl bg-muted/30 p-6 h-48 flex items-end justify-between gap-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-t-sm bg-primary/20 first:rounded-tl-xl last:rounded-tr-xl transition-all duration-700 ease-out",
                  animated ? "" : "h-0"
                )}
                style={{
                  height: animated ? `${h}%` : "0%",
                  transitionDelay: `${800 + i * 50}ms`,
                  backgroundColor: i === 11 ? "hsl(var(--primary))" : undefined,
                }}
              />
            ))}
          </div>

          {/* Recent activity */}
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg bg-muted/30 p-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Car className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">صيانة دورية - تويوتا كامري</p>
                  <p className="text-xs text-muted-foreground">منذ 2 ساعة</p>
                </div>
                <span className="text-sm font-semibold text-primary">+250 د.ع</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating elements with CSS animations */}
      <div className="absolute -right-4 top-20 rounded-xl border bg-card p-4 shadow-xl animate-bounce">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
            <MessageCircle className="size-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">إشعار واتساب</p>
            <p className="text-sm font-medium">تم إرسال الفاتورة</p>
          </div>
        </div>
      </div>

      <div className="absolute -left-4 bottom-20 rounded-xl border bg-card p-4 shadow-xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <Package className="size-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">تنبيه المخزون</p>
            <p className="text-sm font-medium">زيت محرك منخفض</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Step Card (How it works)
// =============================================================================

function StepCard({ number, title, description, icon: Icon }: {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="relative group text-center">
      {/* Connector line */}
      <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-linear-to-r from-primary/30 to-transparent" />

      {/* Step number with glow */}
      <div className="relative mb-6 mx-auto">
        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl transition-all duration-300 group-hover:bg-primary/40 group-hover:scale-125" />
        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground text-xl font-bold shadow-lg shadow-primary/30 transition-all duration-300 group-hover:shadow-primary/50 group-hover:-translate-y-1">
          {number}
        </div>
      </div>

      {/* Icon */}
      <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-linear-to-br from-primary/10 to-primary/5 p-3 transition-all duration-300 group-hover:from-primary group-hover:to-primary/80 group-hover:shadow-lg group-hover:shadow-primary/25 group-hover:-translate-y-1">
        <Icon className="size-6 text-primary group-hover:text-primary-foreground transition-colors" />
      </div>

      {/* Content */}
      <h3 className="mb-2 text-xl font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm max-w-xs mx-auto">{description}</p>
    </div>
  );
}

// =============================================================================
// Bento Feature Card
// =============================================================================

function BentoCard({
  title,
  description,
  icon: Icon,
  className,
  children,
  colSpan = 1,
  gradient = false,
}: {
  title: string;
  description?: string;
  icon?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
  colSpan?: 1 | 2;
  gradient?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1",
        colSpan === 2 && "md:col-span-2",
        gradient && "bg-linear-to-br from-primary/5 via-primary/2 to-transparent border-primary/20",
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10">
        {Icon && (
          <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-primary/5 p-3 transition-all duration-300 group-hover:from-primary group-hover:to-primary/80 group-hover:shadow-lg group-hover:shadow-primary/25">
            <Icon className="size-6 text-primary group-hover:text-primary-foreground transition-colors" />
          </div>
        )}
        <h3 className="mb-2 text-lg font-bold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>}
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// Testimonial Card
// =============================================================================

function TestimonialCard({ quote, author, role, rating }: {
  quote: string;
  author: string;
  role: string;
  rating: number;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      {/* Quote background decoration */}
      <div className="absolute -top-2 -right-2 size-24 bg-primary/5 rounded-full blur-2xl transition-all duration-500 group-hover:bg-primary/10" />

      <div className="relative z-10">
        {/* Quote icon with gradient */}
        <div className="inline-flex mb-4 p-2 rounded-full bg-linear-to-br from-primary/10 to-primary/5">
          <Quote className="size-6 text-primary" />
        </div>

        {/* Star rating with animation */}
        <div className="mb-4 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "size-4 transition-transform duration-300",
                i < rating ? "fill-yellow-400 text-yellow-400 group-hover:scale-110" : "text-muted-foreground",
              )}
              style={{ transitionDelay: `${i * 50}ms` }}
            />
          ))}
        </div>

        {/* Quote text */}
        <p className="mb-6 text-muted-foreground leading-relaxed">{quote}</p>

        {/* Author info */}
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary border border-primary/10">
            {author[0]}
          </div>
          <div>
            <p className="font-semibold text-foreground">{author}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Pricing Card
// =============================================================================

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  popular,
  cta,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border p-6 transition-all duration-500 hover:shadow-2xl",
        popular
          ? "border-primary bg-linear-to-b from-primary/10 to-primary/5 shadow-xl shadow-primary/20 scale-105 z-10"
          : "bg-card hover:shadow-primary/5 hover:scale-[1.02]"
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-primary to-primary/80 px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30">
          الأكثر شعبية
        </div>
      )}

      {/* Gradient glow for popular */}
      {popular && (
        <div className="absolute -inset-px rounded-2xl bg-linear-to-b from-primary/20 to-transparent opacity-50 blur-sm -z-10" />
      )}

      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mb-6">
        <span className={cn(
          "text-4xl font-bold",
          popular && "bg-linear-to-br from-primary to-primary/70 bg-clip-text text-transparent"
        )}>
          {price}
        </span>
        {period && <span className="text-muted-foreground">/{period}</span>}
      </div>

      <ul className="mb-6 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <div className={cn(
              "flex size-5 items-center justify-center rounded-full",
              popular ? "bg-primary/20" : "bg-muted"
            )}>
              <CheckCircle2 className={cn(
                "size-3.5",
                popular ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className={cn(
          "w-full transition-all duration-300",
          popular && "shadow-lg shadow-primary/25 hover:shadow-primary/40"
        )}
        variant={popular ? "default" : "outline"}
      >
        {cta}
      </Button>
    </div>
  );
}

// =============================================================================
// FAQ Item
// =============================================================================

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <AccordionItem value={question}>
      <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground leading-relaxed">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}

// =============================================================================
// Main Landing Page
// =============================================================================

export function LandingPage() {
  const { t, dir } = useTranslation();
  const isRTL = dir === "rtl";

  const steps = [
    {
      number: "01",
      title: isRTL ? "أنشئ حسابك" : "Create your account",
      description: isRTL ? "سجل في دقائق وابدأ بإعداد ورشتك" : "Sign up in minutes and set up your workshop",
      icon: Users,
    },
    {
      number: "02",
      title: isRTL ? "أضف بياناتك" : "Add your data",
      description: isRTL ? "أدخل العملاء، المنتجات، والخدمات" : "Enter customers, products, and services",
      icon: Package,
    },
    {
      number: "03",
      title: isRTL ? "ابدأ العمل" : "Start working",
      description: isRTL ? "أنشئ الفواتير وتابع عملك بكفاءة" : "Create invoices and track your work efficiently",
      icon: FileText,
    },
  ];

  const testimonials = [
    {
      quote: isRTL
        ? "نظام رائع غير طريقة عملي بالكامل. الفواتير سهلة وسريعة والعملاء سعداء."
        : "An amazing system that completely changed how I work. Invoicing is easy and fast, customers are happy.",
      author: isRTL ? "أحمد محمد" : "Ahmed Mohamed",
      role: isRTL ? "مدير ورشة" : "Workshop Manager",
      rating: 5,
    },
    {
      quote: isRTL
        ? "أفضل استثمار قمت به لورشتي. تنبيهات المخزون أنقذتني من نفاد قطع الغيار."
        : "The best investment I made for my workshop. Stock alerts saved me from running out of spare parts.",
      author: isRTL ? "خالد العلي" : "Khaled Al-Ali",
      role: isRTL ? "صاحب مركز" : "Center Owner",
      rating: 5,
    },
    {
      quote: isRTL
        ? "دعم فني ممتاز ونظام سهل الاستخدام. أنصح به بشدة."
        : "Excellent technical support and easy-to-use system. Highly recommended.",
      author: isRTL ? "سامي عبدالله" : "Sami Abdullah",
      role: isRTL ? "مشرف خدمات" : "Service Supervisor",
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: isRTL ? "المجانية" : "Free",
      price: "0",
      period: isRTL ? "شهر" : "month",
      description: isRTL ? "للبدء والتجربة" : "To get started and try",
      features: [
        isRTL ? "100 عميل" : "100 customers",
        isRTL ? "50 منتج" : "50 products",
        isRTL ? "فواتير غير محدودة" : "Unlimited invoices",
        isRTL ? "دعم عبر البريد" : "Email support",
      ],
      cta: isRTL ? "ابدأ مجاناً" : "Start for free",
    },
    {
      name: isRTL ? "الاحترافية" : "Pro",
      price: "49",
      period: isRTL ? "شهر" : "month",
      description: isRTL ? "للورش المتنامية" : "For growing workshops",
      features: [
        isRTL ? "عملاء غير محدودين" : "Unlimited customers",
        isRTL ? "منتجات غير محدودة" : "Unlimited products",
        isRTL ? "واتساب تلقائي" : "Auto WhatsApp",
        isRTL ? "تقارير متقدمة" : "Advanced reports",
        isRTL ? "دعم م priority" : "Priority support",
      ],
      popular: true,
      cta: isRTL ? "اشترك الآن" : "Subscribe now",
    },
    {
      name: isRTL ? "المؤسسية" : "Enterprise",
      price: isRTL ? "تواصل معنا" : "Contact us",
      period: "",
      description: isRTL ? "للشركات الكبيرة" : "For large companies",
      features: [
        isRTL ? "كل ميزات الاحترافية" : "All Pro features",
        isRTL ? "API للربط" : "API access",
        isRTL ? "استضافة خاصة" : "Private hosting",
        isRTL ? "مدير حساب مخصص" : "Dedicated account manager",
        isRTL ? "تخصيص كامل" : "Full customization",
      ],
      cta: isRTL ? "تواصل معنا" : "Contact us",
    },
  ];

  const faqs = [
    {
      question: isRTL ? "هل يمكنني تجربة النظام مجاناً؟" : "Can I try the system for free?",
      answer: isRTL
        ? "نعم! يمكنك البدء بالخطة المجانية والتي تتيح لك إدارة 100 عميل و50 منتج بدون أي تكلفة."
        : "Yes! You can start with the free plan which allows you to manage 100 customers and 50 products at no cost.",
    },
    {
      question: isRTL ? "هل النظام يدعم اللغة العربية؟" : "Does the system support Arabic?",
      answer: isRTL
        ? "نعم، النظام يدعم اللغتين العربية والإنجليزية مع واجهة سهلة للتبديل بينهما."
        : "Yes, the system supports both Arabic and English languages with an easy interface to switch between them.",
    },
    {
      question: isRTL ? "كيف يعمل تكامل واتساب؟" : "How does WhatsApp integration work?",
      answer: isRTL
        ? "يمكنك إرسال الفواتير وتذكيرات الصيانة تلقائياً للعملاء عبر واتساب بضغطة زر واحدة."
        : "You can send invoices and maintenance reminders automatically to customers via WhatsApp with one click.",
    },
    {
      question: isRTL ? "هل بياناتي آمنة؟" : "Is my data secure?",
      answer: isRTL
        ? "نستخدم تشفير SSL على جميع البيانات ونسخ احتياطي يومي لضمان أمان معلوماتك."
        : "We use SSL encryption on all data and daily backups to ensure your information is secure.",
    },
  ];

  const logos = [
    "Toyota", "Nissan", "Honda", "BMW", "Mercedes", "Hyundai"
  ];

  return (
    <div className="relative min-h-screen bg-background" dir={dir}>
      {/* Animated gradient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 -left-32 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Navigation */}
      <header className="relative z-50 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Car className="size-5" />
            </div>
            <span className="font-bold text-lg">{t.app.name}</span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <NavLink href="#how-it-works">{isRTL ? "كيف يعمل" : "How it works"}</NavLink>
            <NavLink href="#features">{isRTL ? "الميزات" : "Features"}</NavLink>
            <NavLink href="#pricing">{isRTL ? "الأسعار" : "Pricing"}</NavLink>
            <NavLink href="#faq">{isRTL ? "الأسئلة الشائعة" : "FAQ"}</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">{t.auth.login}</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">{isRTL ? "ابدأ مجاناً" : "Get Started"}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
                <Sparkles className="size-4" />
                {t.landing.hero.subtitle}
                <ChevronRight className="size-4" />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight mb-6">
                {isRTL
                  ? "نظام إدارة الورش الأكثر تطوراً"
                  : "The most advanced workshop management system"}
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
                {isRTL
                  ? "أدر ورشتك بذكاء مع الفواتير الرقمية، إدارة المخزون، وتكامل واتساب"
                  : "Manage your workshop smartly with digital invoices, inventory management, and WhatsApp integration"}
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                <Link href="/register">
                  <Button size="lg" className="gap-2 px-8">
                    {t.landing.hero.ctaPrimary}
                    {isRTL ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Play className="size-4" />
                  {isRTL ? "شاهد العرض" : "Watch Demo"}
                </Button>
              </div>
            </AnimatedSection>
          </div>

          {/* Dashboard Mockup */}
          <HeroDashboard />
        </div>
      </section>

      {/* Trust Logos */}
      <section className="border-y bg-muted/30 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm text-muted-foreground mb-8">
            {isRTL ? "موثوق من آلاف الورش والمراكز" : "Trusted by thousands of workshops & centers"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50">
            {logos.map((logo, i) => (
              <span key={i} className="text-lg font-bold text-muted-foreground">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-2">
              {isRTL ? "بسيط وسريع" : "Simple & Fast"}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {isRTL ? "كيف يعمل؟" : "How it works?"}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              {isRTL
                ? "ابدأ في 3 خطوات بسيطة واستمتع بنظام احترافي لإدارة ورشتك"
                : "Start in 3 simple steps and enjoy a professional system for managing your workshop"}
            </p>
          </AnimatedSection>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <AnimatedSection key={step.number} delay={i * 100}>
                <StepCard {...step} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Features Grid */}
      <section id="features" className="px-6 py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-2">{t.landing.features.title}</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t.landing.features.subtitle}
            </h2>
          </AnimatedSection>

          <div className="grid gap-6 md:grid-cols-3">
            <AnimatedSection delay={0}>
              <BentoCard
                title={t.landing.features.customers.title}
                description={t.landing.features.customers.description}
                icon={Users}
              />
            </AnimatedSection>

            <AnimatedSection delay={50}>
              <BentoCard
                title={t.landing.features.invoices.title}
                description={t.landing.features.invoices.description}
                icon={FileText}
              />
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <BentoCard
                title={t.landing.features.products.title}
                description={t.landing.features.products.description}
                icon={Package}
              />
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <BentoCard
                title={t.landing.features.services.title}
                description={t.landing.features.services.description}
                icon={Wrench}
                colSpan={2}
                className="bg-primary/5"
              />
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <BentoCard
                title={t.landing.features.whatsapp.title}
                description={t.landing.features.whatsapp.description}
                icon={MessageCircle}
              />
            </AnimatedSection>

            <AnimatedSection delay={250}>
              <BentoCard
                title={t.landing.features.users.title}
                description={t.landing.features.users.description}
                icon={ShieldCheck}
              />
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <BentoCard
                title={t.landing.features.employees.title}
                description={t.landing.features.employees.description}
                icon={UserCog}
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: "1,500+", label: t.landing.stats.activeUsers },
              { value: "320+", label: t.landing.stats.workshops },
              { value: "50K+", label: isRTL ? "فاتيرة شهرياً" : "Invoices monthly" },
              { value: "99%", label: t.landing.stats.satisfaction },
            ].map((stat, i) => (
              <AnimatedSection key={i} delay={i * 50}>
                <div className="text-center p-6 rounded-2xl border bg-card">
                  <p className="text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-2">
              {t.landing.testimonials.title}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {isRTL ? "ماذا يقول عملاؤنا؟" : "What our customers say?"}
            </h2>
          </AnimatedSection>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <TestimonialCard {...t} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-2">
              {isRTL ? "خطط الأسعار" : "Pricing Plans"}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {isRTL ? "اختر الخطة المناسبة لك" : "Choose the right plan for you"}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              {isRTL
                ? "ابدأ مجاناً وقم بالترقية متى احتجت"
                : "Start free and upgrade when you need"}
            </p>
          </AnimatedSection>

          <div className="grid gap-6 md:grid-cols-3 items-center">
            {pricingPlans.map((plan, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <PricingCard {...plan} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <AnimatedSection className="text-center mb-12">
            <p className="text-sm font-medium text-primary mb-2">FAQ</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {isRTL ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
            </h2>
          </AnimatedSection>

          <AnimatedSection>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <FAQItem key={i} {...faq} />
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection>
            <div className="relative border-2 border-x-primary/20 overflow-hidden rounded-3xl bg-linear-to-br from-primary/40 via-30% via-white/0 to-primary/5 px-8 py-16 text-center text-primary">
              {/* Decorative elements */}

              <div className="relative z-10">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                  {isRTL ? "جاهز لتحويل ورشتك؟" : "Ready to transform your workshop?"}
                </h2>
                <p className="mx-auto max-w-lg text-lg text-white/80 mb-8">
                  {isRTL
                    ? "انضم لأكثر من 1,500 ورشة تستخدم نظامنا يومياً"
                    : "Join over 1,500 workshops using our system daily"}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link href="/register">
                    <Button size="lg" className="gap-2">
                      {t.landing.cta.button}
                      {isRTL ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      {t.auth.login}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Car className="size-4" />
                </div>
                <span className="font-bold">{t.app.name}</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                {isRTL
                  ? "نظام احترافي لإدارة مراكز خدمة السيارات مع إدارة العملاء، الفواتير، المخزون، والتقارير."
                  : "Professional system for managing car service centers with customer management, invoicing, inventory, and reports."}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{isRTL ? "المنتج" : "Product"}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">{isRTL ? "الميزات" : "Features"}</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">{isRTL ? "الأسعار" : "Pricing"}</Link></li>
                <li><Link href="#faq" className="hover:text-foreground">{isRTL ? "الأسئلة" : "FAQ"}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{isRTL ? "الدعم" : "Support"}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground">{t.auth.login}</Link></li>
                <li><Link href="/register" className="hover:text-foreground">{t.auth.createAccount}</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear()} {t.app.name}. {t.landing.footer.rights}
            </p>
            <div className="flex items-center gap-4">
              <Globe className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {isRTL ? "العربية / English" : "English / العربية"}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
