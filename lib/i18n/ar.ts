// =============================================================================
// Arabic Translations for Car Workstation Management System
// =============================================================================

export const ar = {
  // ---------------------------------------------------------------------------
  // App Info
  // ---------------------------------------------------------------------------
  appName: "إدارة مركز السيارات",
  app: {
    name: "إدارة مركز السيارات",
    description: "نظام إدارة مراكز خدمة السيارات",
  },

  // ---------------------------------------------------------------------------
  // Common
  // ---------------------------------------------------------------------------
  common: {
    loading: "جاري التحميل...",
    back: "رجوع",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    search: "بحث",
    filter: "تصفية",
    noData: "لا توجد بيانات",
    confirm: "تأكيد",
    close: "إغلاق",
  },

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  nav: {
    dashboard: "الرئيسية",
    customers: "العملاء",
    products: "المنتجات",
    services: "الخدمات",
    employees: "الموظفين",
    users: "المستخدمين",
    roles: "الأدوار والصلاحيات",
    invoices: "الفواتير",
    pos: "نقطة البيع (كاشير)",
    activeService: "تحت الصيانة",
    reception: "الاستقبال",
    reports: "التقارير",
    detailedReports: "التقارير التفصيلية",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
  },

  navGroups: {
    overview: "عام",
    workshop: "الورشة والبيع",
    catalog: "البيانات",
    reports: "التقارير والتحليل",
    administration: "الإدارة",
  },

  workspaceHome: {
    greeting: "مرحباً {name}",
    subtitle: "اختر المهمة التي تريد البدء بها",
    roleLabel: "دورك",
    pickTask: "اختصارات حسب صلاحياتك",
    noAccess: "لا توجد صفحات متاحة لحسابك. تواصل مع المدير.",
  },

  rolesPage: {
    presetsTitle: "قوالب الأدوار",
    presetsHint: "ابدأ من قالب جاهز ثم عدّل الاسم والصلاحيات حسب حاجتك",
    presetApplied: "تم تطبيق القالب — راجع الصلاحيات ثم احفظ",
    syncAccountant: "إصلاح دور المحاسب",
    syncReception: "إصلاح دور الاستقبال",
    syncAccountantHint:
      "ينشئ أو يحدّث دور «محاسب» بكل صلاحيات نقطة البيع (من السيرفر)",
    syncReceptionHint:
      "ينشئ أو يحدّث دور «موظف استقبال» بصلاحيات الاستقبال الكاملة",
    syncRoleDone: "تم تحديث الدور — اطلب من الموظفين إعادة تسجيل الدخول",
    syncRoleFailed: "فشل مزامنة الدور مع السيرفر",
    customRole: "دور مخصص",
    permissionCount: "{count} صلاحية",
    presets: {
      reception: {
        name: "موظف استقبال",
        description: "تسجيل السيارات، العملاء، والخدمات",
      },
      accountant: {
        name: "محاسب / نقطة بيع",
        description: "بيع، فواتير، وعملاء",
      },
      cashier: {
        name: "كاشير",
        description: "نقطة البيع والفواتير",
      },
      warehouse: {
        name: "أمين مخزن",
        description: "إدارة المنتجات والمخزون",
      },
      multiTask: {
        name: "موظف متعدد المهام",
        description: "استقبال + بيع + مخزن في دور واحد",
      },
    },
  },

  // ---------------------------------------------------------------------------
  // Common Actions
  // ---------------------------------------------------------------------------
  actions: {
    add: "إضافة",
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ",
    cancel: "إلغاء",
    confirm: "تأكيد",
    search: "بحث",
    filter: "تصفية",
    export: "تصدير",
    import: "استيراد",
    refresh: "تحديث",
    close: "إغلاق",
    back: "رجوع",
    next: "التالي",
    previous: "السابق",
    view: "عرض",
    print: "طباعة",
    download: "تحميل",
    upload: "رفع",
    select: "اختر",
    selectAll: "اختيار الكل",
    clearAll: "مسح الكل",
    reset: "إعادة تعيين",
    apply: "تطبيق",
  },

  // ---------------------------------------------------------------------------
  // Common Labels
  // ---------------------------------------------------------------------------
  labels: {
    name: "الاسم",
    phone: "رقم الهاتف",
    email: "البريد الإلكتروني",
    address: "العنوان",
    status: "الحالة",
    active: "نشط",
    inactive: "غير نشط",
    date: "التاريخ",
    time: "الوقت",
    total: "الإجمالي",
    subtotal: "المجموع الفرعي",
    tax: "الضريبة",
    discount: "الخصم",
    notes: "ملاحظات",
    description: "الوصف",
    category: "الفئة",
    type: "النوع",
    price: "السعر",
    quantity: "الكمية",
    unit: "الوحدة",
    photo: "الصورة",
    photos: "الصور",
    createdAt: "تاريخ الإنشاء",
    updatedAt: "تاريخ التحديث",
    all: "الكل",
    none: "لا شيء",
    yes: "نعم",
    no: "لا",
    or: "أو",
    and: "و",
  },

  // ---------------------------------------------------------------------------
  // Customers
  // ---------------------------------------------------------------------------
  customers: {
    title: "العملاء",
    addNew: "إضافة عميل جديد",
    editCustomer: "تعديل بيانات العميل",
    deleteCustomer: "حذف العميل",
    deleteConfirm: "هل أنت متأكد من حذف هذا العميل؟",
    name: "اسم العميل",
    phone: "رقم الهاتف",
    cars: "السيارات",
    usageCount: "عدد الزيارات",
    noCars: "لا توجد سيارات مسجلة",
    searchPlaceholder: "بحث بالاسم أو رقم الهاتف...",
    car: {
      add: "إضافة سيارة",
      edit: "تعديل السيارة",
      delete: "حذف السيارة",
      name: "اسم السيارة",
      plateNumber: "رقم اللوحة",
      model: "الموديل",
      color: "اللون",
    },
  },

  vehicleEvents: {
    title: "سجل الصيانة",
    viewHistory: "عرض السجل",
    hideHistory: "إخفاء السجل",
    empty: "لا توجد عمليات مسجلة لهذه المركبة بعد",
    types: {
      OIL_CHANGE: "تغيير زيت",
      REPAIR: "تصليح",
      PARTS_REPLACEMENT: "قطع",
      INSPECTION: "فحص",
      GENERAL_SERVICE: "خدمة",
      OTHER: "أخرى",
    },
  },

  maintenance: {
    title: "الصيانة القادمة",
    lastService: "آخر صيانة",
    currentMileage: "العداد الحالي",
    nextService: "الموعد القادم",
    noSchedule: "لم يُحدد موعد",
    noScheduleYet: "أكمل فاتورة صيانة لحساب الموعد القادم",
    dueToday: "مستحق اليوم",
    daysRemaining: "بعد {days} يوم",
    kmRemaining: "بعد {km} كم",
    overdueDays: "متأخر {days} يوم",
    overdueKm: "متأخر {km} كم",
    urgency: {
      overdue: "متأخر",
      due_soon: "قريب",
      ok: "ضمن الموعد",
      unknown: "غير محدد",
    },
  },

  // ---------------------------------------------------------------------------
  // Products / Stock
  // ---------------------------------------------------------------------------
  products: {
    title: "المنتجات والمخزون",
    addNew: "إضافة منتج جديد",
    editProduct: "تعديل المنتج",
    deleteProduct: "حذف المنتج",
    deleteConfirm: "هل أنت متأكد من حذف هذا المنتج؟",
    name: "اسم المنتج",
    minPrice: "أقل سعر بيع (ربحي)",
    costPrice: "سعر التكلفة",
    salePrice: "سعر البيع",
    profitMargin: "نسبة الربح",
    selectMinMargin: "اختر نسبة الخصم من الربح",
    minPriceEnabled: "تفعيل أقل سعر بيع ربحي",
    minMarginDiscountHint:
      "تُخصم النسبة من هامش الربح: مثال بيع 5000 وتكلفة 4000 و10% → 4900",
    pricingHint:
      "أدخل التكلفة وسعر البيع، وتُحسب نسبة الربح تلقائياً.",
    validation: {
      saleBelowCost: "سعر البيع يجب أن يكون أكبر من سعر التكلفة",
      minBelowCost: "أقل سعر البيع يجب أن يحقق ربحاً فوق التكلفة",
      minAboveSale: "أقل سعر البيع يجب أن يكون أقل من سعر البيع",
      minMarginRequired: "اختر نسبة لأقل سعر بيع ربحي",
    },
    stock: "المخزون",
    minStock: "الحد الأدنى للمخزون",
    unit: "الوحدة",
    unitValue: "مقدار الوحدة",
    unitAdjustable: "الوحدة قابلة للتعديل",
    barcode: "الباركود",
    lowStock: "مخزون منخفض",
    outOfStock: "نفذ المخزون",
    inStock: "متوفر",
    searchPlaceholder: "بحث بالاسم أو الباركود...",
    unitNote: "الوحدة تمثل إجمالي المنتج (مثال: 3.5 لتر زيت). يمكن تعديل الكمية المستخدمة لاحقاً عند إضافة المنتج في الفاتورة.",
    units: {
      piece: "قطعة",
      liter: "لتر",
      kilogram: "كيلوجرام",
      meter: "متر",
      box: "صندوق",
      set: "طقم",
    },
  },

  // ---------------------------------------------------------------------------
  // Services
  // ---------------------------------------------------------------------------
  services: {
    title: "الخدمات",
    addNew: "إضافة خدمة جديدة",
    editService: "تعديل الخدمة",
    deleteService: "حذف الخدمة",
    deleteConfirm: "هل أنت متأكد من حذف هذه الخدمة؟",
    name: "اسم الخدمة",
    price: "سعر الخدمة",
    icon: "الأيقونة",
    estimatedDuration: "المدة المتوقعة (بالدقائق)",
    searchPlaceholder: "بحث عن خدمة...",
    minutes: "دقيقة",
  },

  // ---------------------------------------------------------------------------
  // Employees
  // ---------------------------------------------------------------------------
  employees: {
    title: "الموظفين",
    addNew: "إضافة موظف جديد",
    editEmployee: "تعديل بيانات الموظف",
    deleteEmployee: "حذف الموظف",
    deleteConfirm: "هل أنت متأكد من حذف هذا الموظف؟",
    name: "اسم الموظف",
    position: "المنصب",
    phone: "رقم الهاتف",
    salary: "الراتب",
    hireDate: "تاريخ التعيين",
    searchPlaceholder: "بحث بالاسم أو المنصب...",
    positions: {
      manager: "مدير",
      technician: "فني",
      receptionist: "موظف استقبال",
      accountant: "محاسب",
      cleaner: "عامل نظافة",
    },
  },

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------
  users: {
    title: "المستخدمين",
    addNew: "إضافة مستخدم جديد",
    editUser: "تعديل بيانات المستخدم",
    deleteUser: "حذف المستخدم",
    deleteConfirm: "هل أنت متأكد من حذف هذا المستخدم؟",
    name: "اسم المستخدم",
    phone: "رقم الهاتف",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    position: "المنصب",
    roles: "الصلاحيات",
    lastLogin: "آخر تسجيل دخول",
    searchPlaceholder: "بحث عن مستخدم...",
    positions: {
      admin: "مدير النظام",
      manager: "مدير",
      cashier: "كاشير",
      accountant: "محاسب",
      receptionist: "موظف استقبال",
      viewer: "مشاهد",
    },
    permissions: {
      title: "الصلاحيات",
      resource: "المورد",
      level: "المستوى",
      customers: "العملاء",
      products: "المنتجات",
      services: "الخدمات",
      employees: "الموظفين",
      users: "المستخدمين",
      invoices: "الفواتير",
      reception: "استقبال السيارات",
      receptionHint:
        "عملاء + منتجات + خدمات + فواتير (تسجيل دخول السيارة للخدمة)",
      createReceptionRole: "إنشاء دور موظف استقبال",
      receptionRoleCreated: "تم إنشاء دور موظف الاستقبال",
      receptionRoleExists: "دور موظف الاستقبال موجود مسبقاً",
      settings: "الإعدادات",
      none: "بدون صلاحية",
      read: "قراءة فقط",
      write: "قراءة وكتابة",
    },
  },

  // ---------------------------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------------------------
  auth: {
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    phone: "رقم الهاتف",
    phonePlaceholder: "أدخل رقم الهاتف",
    phoneRequired: "رقم الهاتف مطلوب",
    password: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة المرور",
    tenant: "المعمل/الفرع",
    tenantPlaceholder: "اسم المعمل أو المعرف",
    tenantHint: "أدخل النطاق الفرعي (subdomain) أو معرف المعمل كما سجّلته",
    otp: "رمز التحقق",
    sendOTP: "إرسال رمز التحقق",
    verifyOTP: "التحقق من الرمز",
    resendOTP: "إعادة إرسال الرمز",
    enterPhone: "أدخل رقم هاتفك لتسجيل الدخول",
    enterCredentials: "أدخل بيانات الدخول",
    enterOTP: "أدخل رمز التحقق",
    otpSentTo: "تم إرسال رمز التحقق إلى {phone}",
    otpSendFailed: "فشل إرسال رمز التحقق",
    otpExpired: "انتهت صلاحية رمز التحقق",
    loginSuccess: "تم تسجيل الدخول بنجاح",
    loginFailed: "فشل تسجيل الدخول - تحقق من البيانات",
    logoutSuccess: "تم تسجيل الخروج بنجاح",
    welcome: "مرحباً بك",
    welcomeBack: "مرحباً بعودتك",
    verifying: "جاري التحقق...",
    fillAllFields: "يرجى ملء جميع الحقول",
    or: "أو",
    loginWithOTP: "تسجيل الدخول برمز التحقق",
    demoHint: "للتجربة: استخدم أي رقم هاتف والرمز 123456",
    noAccount: "ليس لديك حساب؟",
    createAccount: "إنشاء حساب جديد",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    // Register page
    tenantName: "اسم المعمل/الشركة",
    tenantNamePlaceholder: "مثال: مركز خدمة السيارات",
    subdomain: "النطاق الفرعي",
    subdomainPlaceholder: "example",
    yourName: "الاسم",
    yourNamePlaceholder: "أدخل اسمك",
    confirmPassword: "تأكيد كلمة المرور",
    confirmPasswordPlaceholder: "أعد إدخال كلمة المرور",
    passwordMismatch: "كلمات المرور غير متطابقة",
    passwordTooShort: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    registerFailed: "فشل إنشاء الحساب",
    registerDescription: "أنشئ حساباً جديداً لبدء استخدام النظام",
    registerSuccess: "تم إنشاء الحساب بنجاح",
  },

  // ---------------------------------------------------------------------------
  // Invoices
  // ---------------------------------------------------------------------------
  reception: {
    title: "استقبال السيارات",
    intakeTitle: "بيانات الزبون والسيارة",
    lookup: "بحث / تسجيل",
    lookupDone: "تم تحميل البيانات",
    knownCustomer: "زبون مسجّل مسبقاً",
    searchingCustomer: "جاري جلب بيانات الزبون...",
    selectCar: "اختر السيارة",
    carsRegistered: "{count} سيارة مسجّلة",
    customerLoaded: "تم تحميل بيانات الزبون وسياراته",
    needPhoneMin: "أدخل 4 أرقام على الأقل من رقم الهاتف",
    needPhoneAndPlate: "أدخل رقم الهاتف ورقم اللوحة",
    history: "الفواتير السابقة",
    noHistory: "لا توجد فواتير سابقة",
    openJobLoaded: "تم تحميل أمر الخدمة المفتوح",
    currentJob: "أمر الخدمة الحالي",
    addItemsTitle: "الخدمات والمنتجات",
    startWithLookup: "ابدأ بالبحث عن الزبون والسيارة",
    needItems: "أضف خدمة أو منتج واحد على الأقل",
    register: "تسجيل للخدمة",
    toGarage: "إرسال للكراج",
    finish: "إنهاء الخدمة",
    registered: "تم تسجيل السيارة للخدمة",
    sentToGarage: "تم إرسال السيارة للكراج",
    completed: "تم إنهاء الخدمة",
  },

  activeService: {
    title: "تحت الصيانة",
    subtitle: "الزبائن قيد الخدمة — فواتير بحالة «قيد الانتظار»",
    searchPlaceholder: "بحث بالاسم، الهاتف، السيارة، أو الخدمة...",
    empty: "لا يوجد زبائن تحت الصيانة حالياً",
    emptyHint:
      "عند إتمام بيع من نقطة البيع تظهر الفاتورة هنا حتى تُنهى الخدمة",
    services: "الخدمات",
    productsCount: "{count} منتج",
    markDone: "إنهاء الخدمة",
    completed: "تم إنهاء الخدمة بنجاح",
    confirmTitle: "إنهاء الخدمة؟",
    confirmDescription:
      "سيتم تحويل فاتورة {name} إلى مكتملة وإزالتها من قائمة الصيانة.",
    mileageLabel: "قراءة العداد (كم)",
    mileageHint: "اختياري — يُستخدم لحساب موعد الصيانة القادم",
  },

  pos: {
    title: "نقطة البيع",
    cart: "سلة البيع",
    customerSection: "بيانات العميل والسيارة",
    searchPlaceholder: "بحث عن منتج أو خدمة...",
    emptyCart: "السلة فارغة — اختر منتجات أو خدمات",
    checkout: "إتمام البيع",
    newSale: "بيع جديد",
    saleComplete: "تم إتمام البيع بنجاح",
    completeCustomer: "أكمل بيانات العميل والسيارة",
    addItems: "أضف منتجاً أو خدمة واحدة على الأقل",
    ready: "جاهز",
    required: "مطلوب",
    accountantOnly: "هذه الصفحة للمحاسب فقط",
    catalogEmpty:
      "لا توجد منتجات أو خدمات — أضفها من لوحة التحكم (بحساب المسؤول)",
    catalogForbidden:
      "لا صلاحية لتحميل المنتجات أو الخدمات — اطلب من المدير إضافة PRODUCTS_READ و SERVICES_READ لدورك",
    missingPermissionsTitle: "صلاحيات نقطة البيع ناقصة في الدور",
    missingPermissionsHint:
      "من الأدوار → عدّل دور «محاسب» أو استخدم قالب «كاشير» ثم سجّل دخول من جديد:",
    cannotSell: "لا تملك صلاحية إنشاء فاتورة (INVOICES_WRITE)",
  },

  invoices: {
    title: "الفواتير",
    addNew: "إنشاء فاتورة جديدة",
    editInvoice: "تعديل الفاتورة",
    deleteInvoice: "حذف الفاتورة",
    deleteConfirm: "هل أنت متأكد من حذف هذه الفاتورة؟",
    invoiceNumber: "رقم الفاتورة",
    customer: "العميل",
    car: "السيارة",
    services: "الخدمات",
    products: "المنتجات",
    totalPrice: "إجمالي السعر",
    minPrice: "الحد الأدنى للسعر",
    finalPrice: "السعر النهائي",
    notes: "ملاحظات",
    status: "الحالة",
    searchPlaceholder: "بحث برقم الفاتورة، اسم العميل، رقم الهاتف...",
    searchByPhone: "بحث برقم هاتف العميل",
    searchByCar: "بحث برقم السيارة",
    searchServices: "بحث عن خدمة...",
    searchProducts: "بحث عن منتج...",
    selectCustomer: "اختر العميل",
    selectCar: "اختر السيارة",
    addService: "إضافة خدمة",
    addProduct: "إضافة منتج",
    noServices: "لم يتم إضافة خدمات",
    noProducts: "لم يتم إضافة منتجات",
    quantity: "الكمية",
    unitAmount: "الكمية بالوحدة",
    unitPrice: "سعر الوحدة",
    price: "السعر",
    total: "الإجمالي",
    priceBelowMin: "السعر النهائي لا يمكن أن يكون أقل من الحد الأدنى",
    statuses: {
      IN_SERVICE: "في الكراج",
      PENDING: "في الاستقبال",
      COMPLETED: "مكتملة",
      CANCELLED: "ملغية",
    },
    customerNotFound: "لم يتم العثور على عميل بهذا الرقم",
    carNotFound: "لم يتم العثور على سيارة بهذا الرقم",
    addNewCustomer: "إضافة عميل جديد",
    addNewCar: "إضافة سيارة جديدة",
    customerName: "اسم العميل",
    customerPhone: "رقم هاتف العميل",
    carName: "اسم السيارة",
    carNumber: "رقم اللوحة",
    carModel: "الموديل",
    carColor: "اللون",
    creatingCustomer: "جاري إنشاء العميل...",
    creatingCar: "جاري إضافة السيارة...",
    customerCreated: "تم إنشاء العميل بنجاح",
    carCreated: "تم إضافة السيارة بنجاح",
    orAddNew: "أو أضف جديد",
    steps: {
      customerAndCar: "العميل والسيارة",
      productsAndServices: "المنتجات والخدمات",
      priceAndConfirm: "السعر والتأكيد",
      next: "التالي",
      previous: "السابق",
      step: "خطوة",
      of: "من",
    },
  },

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------
  dashboard: {
    title: "لوحة التحكم",
    welcome: "مرحباً",
    totalCustomers: "إجمالي العملاء",
    totalProducts: "إجمالي المنتجات",
    totalServices: "إجمالي الخدمات",
    totalEmployees: "إجمالي الموظفين",
    todayVisits: "زيارات اليوم",
    lowStockProducts: "منتجات مخزون منخفض",
    recentCustomers: "أحدث العملاء",
    popularServices: "الخدمات الأكثر طلباً",
    summaryToday: "إليك ملخص نشاط مركز الخدمة",
    charts: {
      overview: "نظرة عامة",
      overviewDesc: "توزيع العملاء والمنتجات والخدمات والموظفين",
      revenue: "الإيرادات والفواتير",
      revenueDesc: "آخر 6 أشهر",
      inventory: "حالة المخزون",
      inventoryDesc: "توزيع المنتجات حسب المخزون",
      lowStock: "مستوى المخزون المنخفض",
      lowStockDesc: "المتبقي مقابل الحد الأدنى",
      servicesPrices: "أسعار الخدمات",
      servicesPricesDesc: "أعلى الخدمات سعراً",
      revenueLabel: "الإيرادات",
      invoicesLabel: "الفواتير",
      inStock: "متوفر",
      lowStockStatus: "منخفض",
      outOfStock: "نفذ",
      currentStock: "المخزون الحالي",
      minStock: "الحد الأدنى",
      noChartData: "لا توجد بيانات كافية لعرض الرسم",
      noLowStock: "لا توجد منتجات منخفضة المخزون",
    },
  },

  reports: {
    title: "التقارير التفصيلية",
    subtitle: "تحليل المبيعات، الفواتير، المخزون، والعملاء",
    refresh: "تحديث",
    period: "الفترة",
    periods: {
      "7d": "آخر 7 أيام",
      "30d": "آخر 30 يوماً",
      "90d": "آخر 90 يوماً",
      year: "آخر سنة",
      all: "كل الفترات",
    },
    tabs: {
      sales: "المبيعات",
      invoices: "الفواتير",
      inventory: "المخزون",
      customers: "العملاء",
      catalog: "الخدمات والمنتجات",
    },
    kpi: {
      revenue: "إجمالي الإيرادات",
      completed: "فواتير مكتملة",
      avgTicket: "متوسط الفاتورة",
      pending: "قيد المعالجة",
      stockValue: "قيمة المخزون (تكلفة)",
      lowStock: "منتجات منخفضة",
    },
    charts: {
      revenueTrend: "اتجاه الإيرادات (12 شهر)",
      statusBreakdown: "الفواتير حسب الحالة",
    },
    tables: {
      topCustomers: "أفضل العملاء",
      topProducts: "أكثر المنتجات مبيعاً",
      topServices: "أكثر الخدمات طلباً",
      lowStock: "تنبيهات المخزون",
      recentInvoices: "آخر الفواتير",
      customer: "العميل",
      phone: "الهاتف",
      count: "عدد الفواتير",
      revenue: "الإيرادات",
      product: "المنتج",
      service: "الخدمة",
      quantity: "الكمية",
      stock: "المخزون",
      minStock: "الحد الأدنى",
      invoice: "الفاتورة",
      date: "التاريخ",
      status: "الحالة",
      amount: "المبلغ",
    },
    empty: "لا توجد بيانات في هذه الفترة",
    loadFailed: "تعذّر تحميل التقارير — تحقق من صلاحية عرض الفواتير والمنتجات",
    downloadPdf: "تصدير PDF",
    generatingPdf: "جاري إنشاء التقرير...",
    pdfTitle: "تقرير تفصيلي",
    pdfGenerated: "تم إنشاء التقرير",
    pdfFailed: "تعذّر إنشاء ملف PDF",
    pdfInventorySummary:
      "إجمالي المنتجات: {total} — متوفر: {inStock} — منخفض: {low} — نفد: {out} — قيمة المخزون: {value} {currency}",
    pdfPageFooter: "تقرير آلي — ورشتك",
  },

  // ---------------------------------------------------------------------------
  // Messages
  // ---------------------------------------------------------------------------
  messages: {
    success: {
      created: "تم الإنشاء بنجاح",
      updated: "تم التحديث بنجاح",
      deleted: "تم الحذف بنجاح",
      saved: "تم الحفظ بنجاح",
      uploaded: "تم الرفع بنجاح",
    },
    error: {
      general: "حدث خطأ ما، يرجى المحاولة مرة أخرى",
      notFound: "غير موجود",
      unauthorized: "غير مصرح",
      forbidden: "ممنوع",
      validation: "يرجى التحقق من البيانات المدخلة",
      network: "خطأ في الاتصال بالشبكة",
      fetchFailed: "فشل في جلب البيانات",
      saveFailed: "فشل في حفظ البيانات",
      createFailed: "فشل في إنشاء البيانات",
      updateFailed: "فشل في تحديث البيانات",
      deleteFailed: "فشل في حذف البيانات",
      upload: "فشل في رفع الملف",
    },
    confirm: {
      delete: "هل أنت متأكد من الحذف؟",
      unsavedChanges: "لديك تغييرات غير محفوظة، هل تريد المتابعة؟",
    },
    empty: {
      noData: "لا توجد بيانات",
      noResults: "لا توجد نتائج",
    },
    loading: "جاري التحميل...",
  },

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
  validation: {
    required: "هذا الحقل مطلوب",
    minLength: "الحد الأدنى للأحرف هو {min}",
    maxLength: "الحد الأقصى للأحرف هو {max}",
    min: "الحد الأدنى للقيمة هو {min}",
    max: "الحد الأقصى للقيمة هو {max}",
    email: "البريد الإلكتروني غير صالح",
    phone: "رقم الهاتف غير صالح",
    number: "يجب أن تكون القيمة رقماً",
    positive: "يجب أن تكون القيمة موجبة",
    integer: "يجب أن تكون القيمة عدداً صحيحاً",
    passwordMatch: "كلمات المرور غير متطابقة",
  },

  // ---------------------------------------------------------------------------
  // Theme
  // ---------------------------------------------------------------------------
  theme: {
    light: "فاتح",
    dark: "داكن",
    system: "تلقائي",
  },

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------
  pagination: {
    showing: "عرض",
    of: "من",
    entries: "سجل",
    page: "صفحة",
    perPage: "لكل صفحة",
    first: "الأولى",
    last: "الأخيرة",
  },

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------
  settings: {
    title: 'الإعدادات',
    subtitle: 'إعدادات النظام والورشة',
    workspaceInfo: 'معلومات الورشة',
    workspaceDescription: 'تعديل اسم الورشة والشعار',
    workspaceName: 'اسم الورشة',
    workspaceNamePlaceholder: 'مثال: ورشة السيارات الذهبية',
    logo: 'الشعار',
    logoHint: 'PNG, JPG up to 2MB',
    regionSettings: 'إعدادات المنطقة',
    regionDescription: 'اختيار الدولة لتنسيق أرقام الهاتف',
    country: 'الدولة',
    phoneFormat: 'تنسيق رقم الهاتف',
    phoneFormatDescription: 'سيتم استخدام هذا البادئة لجميع أرقام الهاتف:',
    phoneExample: 'مثال',
    subdomain: 'النطاق الفرعي',
    subdomainHint: 'لا يمكن تغيير النطاق الفرعي بعد إنشاء الحساب',
    plan: 'الخطة',
    plans: {
      basic: 'أساسية',
      pro: 'احترافية',
      enterprise: 'مؤسسية',
    },
  },

  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------
  table: {
    actions: "الإجراءات",
    noData: "لا توجد بيانات",
    loading: "جاري التحميل...",
    selected: "محدد",
    selectAll: "تحديد الكل",
    rowsPerPage: "صفوف لكل صفحة",
  },

  // ---------------------------------------------------------------------------
  // Currency
  // ---------------------------------------------------------------------------
  currency: {
    symbol: "د.ع",
    code: "IQD",
    name: "دينار عراقي",
  },

  landing: {
    hero: {
      title: "نظام إدارة مراكز خدمة السيارات",
      subtitle: "حل متكامل لإدارة ورش السيارات بكفاءة عالية",
      description: "نظام ذكي لإدارة العملاء، الفواتير، المنتجات، الخدمات، الموظفين، المستخدمين والصلاحيات، مع إشعارات واتساب تلقائية",
      ctaPrimary: "ابدأ الآن",
      ctaSecondary: "تعرف على المزيد",
    },
    features: {
      title: "الميزات الرئيسية",
      subtitle: "كل ما تحتاجه لإدارة مركز خدمة السيارات في مكان واحد",
      customers: {
        title: "إدارة العملاء",
        description: "سجل عملائك، سياراتهم، تاريخ الزيارات والصيانة",
      },
      invoices: {
        title: "الفواتير",
        description: "إنشاء فواتير احترافية للخدمات والمنتجات بكل سهولة",
      },
      products: {
        title: "المنتجات",
        description: "إدارة المخزون مع وحدات اللتر والكميات والتنبيهات",
      },
      services: {
        title: "الخدمات",
        description: "تعريف الخدمات المتاحة مع الأسعار والمدد الزمنية",
      },
      employees: {
        title: "الموظفين",
        description: "إدارة بيانات الموظفين، الرواتب والحضور",
      },
      users: {
        title: "المستخدمين والصلاحيات",
        description: "تحكم كامل في صلاحيات الوصول للنظام",
      },
      whatsapp: {
        title: "واتساب",
        description: "إرسال إشعارات وتذكيرات تلقائية للعملاء",
      },
    },
    stats: {
      title: "إحصائيات مذهلة",
      activeUsers: "مستخدم نشط",
      workshops: "ورشة مركبة",
      satisfaction: "نسبة الرضا",
    },
    testimonials: {
      title: "آراء عملائنا",
    },
    cta: {
      title: "جاهز لتحويل إدارة ورشتك؟",
      subtitle: "سجل الآن وابدأ في دقائق",
      button: "ابدأ مجاناً",
    },
    footer: {
      rights: "جميع الحقوق محفوظة",
    },
    language: {
      ar: "العربية",
      en: "English",
    },
  },
};

export type Translations = typeof ar;
export default ar;
