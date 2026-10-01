import { CategoryTree, Order, Product, StudentCombo, User } from '../types/store';

export const HERO_IMAGE_URL = '/src/assets/images/hero_campus_bookshop_1790836505430.jpg';
export const COMBO_ENG_IMAGE_URL = '/src/assets/images/combo_engineering_kit_1790836521606.jpg';
export const COMBO_WEB_IMAGE_URL = '/src/assets/images/combo_webtech_kit_1790836535301.jpg';
export const CATEGORY_BOOKS_IMAGE_URL = '/src/assets/images/category_academic_books_1790836546891.jpg';
export const CATEGORY_STATIONERY_IMAGE_URL = '/src/assets/images/category_precision_stationery_1790836561865.jpg';

export const INITIAL_CATEGORIES: CategoryTree = {
  Books: [
    'Programming',
    'Database',
    'Networking',
    'Mathematics',
    'Web Technology',
  ],
  Stationery: [
    'Pens',
    'Notebooks',
    'Files',
    'Calculators',
    'Drawing materials',
  ],
};

export const INITIAL_PRODUCTS: Product[] = [
  // BOOKS -> Web Technology
  {
    id: 'bk-web-01',
    sku: 'ISBN-978-81-203-5412',
    title: 'Modern Web Technology: Servlets, JSP, XML & XPath Architecture',
    authorOrBrand: 'Dr. R. Krishnamurthy & A. Srinivasan',
    category: 'Books',
    subcategory: 'Web Technology',
    price: 540,
    originalPrice: 650,
    stock: 34,
    semesterTag: 'Semester V · Core Lab & Theory',
    bindingOrMaterial: 'Thread-Sewn Paperback · 612 Pages',
    description:
      'Comprehensive university textbook covering HTML5 semantic forms, CSS3 grid layouts, JavaScript DOM validation, Java Servlets lifecycle, JSP custom tags, XML schema validation, XPath 1.0 querying, AJAX asynchronous requests, and HTTP session/cookie state management.',
    specs: {
      Publisher: 'University Press India',
      Edition: '4th Revised Syllabus Edition (2026)',
      ISBN: '978-81-203-5412-8',
      SyllabusCode: 'CS3501 / IT3502',
    },
    coverStyle: {
      bgHex: '#1E3A2F',
      accentHex: '#D4A373',
      textHex: '#FBFBF9',
      editionLabel: '4TH EDITION · 2026 SYLLABUS',
      codeLabel: 'CS-3501',
    },
    imageUrl: CATEGORY_BOOKS_IMAGE_URL,
  },
  {
    id: 'bk-web-02',
    sku: 'ISBN-978-81-203-5499',
    title: 'Web Technology Practical Lab Manual (XML, XPath, Servlets & AJAX)',
    authorOrBrand: 'Department of Computer Science Press',
    category: 'Books',
    subcategory: 'Web Technology',
    price: 220,
    originalPrice: 260,
    stock: 58,
    semesterTag: 'Semester V · Lab Companion',
    bindingOrMaterial: 'Spiral Flat-Lay Manual · 184 Pages',
    description:
      'Step-by-step laboratory exercises with complete code listings for HTML/JS form validation, XML catalog modeling, XPath filtering, Tomcat Servlet deployment, JSP session carts, and AJAX live search.',
    specs: {
      Publisher: 'Campus Academic Print',
      Edition: '2026 Lab Regulation',
      ISBN: '978-81-203-5499-9',
      Experiments: '15 Verified Lab Experiments + Viva Bank',
    },
    coverStyle: {
      bgHex: '#283618',
      accentHex: '#E9EDC9',
      textHex: '#FEFAE0',
      editionLabel: 'LAB MANUAL · 15 EXPERIMENTS',
      codeLabel: 'WT-LAB',
    },
  },

  // BOOKS -> Programming
  {
    id: 'bk-prog-01',
    sku: 'ISBN-978-0-13-468599',
    title: 'Data Structures, Algorithms & Object-Oriented Programming in Java',
    authorOrBrand: 'Prof. S. Narayanan & M. Weiss',
    category: 'Books',
    subcategory: 'Programming',
    price: 620,
    originalPrice: 740,
    stock: 27,
    semesterTag: 'Semester III · Core CS',
    bindingOrMaterial: 'Hardcover Cloth Edition · 740 Pages',
    description:
      'Rigorous treatment of asymptotic complexity, balanced trees, graph algorithms, concurrency, collections framework, and JVM memory architecture with 200+ graded programming problems.',
    specs: {
      Publisher: 'Pearson Academic',
      Edition: '6th Edition',
      ISBN: '978-0-13-468599-1',
      SyllabusCode: 'CS3301',
    },
    coverStyle: {
      bgHex: '#1D2D44',
      accentHex: '#748CAB',
      textHex: '#F0EBD8',
      editionLabel: '6TH EDITION · JAVA 21 LTS',
      codeLabel: 'CS-3301',
    },
  },
  {
    id: 'bk-prog-02',
    sku: 'ISBN-978-93-528-6112',
    title: 'Problem Solving with C & Python: From Logic to Systems',
    authorOrBrand: 'Dr. K. Venkataraman',
    category: 'Books',
    subcategory: 'Programming',
    price: 460,
    originalPrice: 520,
    stock: 42,
    semesterTag: 'Semester I & II · Foundation',
    bindingOrMaterial: 'Paperback · 496 Pages',
    description:
      'Designed for first-year engineering students mastering pointers, memory allocation, modular C programming, and Pythonic data manipulation for computational labs.',
    specs: {
      Publisher: 'Oxford University Press',
      Edition: '3rd Edition',
      ISBN: '978-93-528-6112-4',
      SyllabusCode: 'GE3151',
    },
    coverStyle: {
      bgHex: '#3D405B',
      accentHex: '#F2CC8F',
      textHex: '#F4F1DE',
      editionLabel: 'FOUNDATION SERIES',
      codeLabel: 'GE-3151',
    },
  },

  // BOOKS -> Database
  {
    id: 'bk-db-01',
    sku: 'ISBN-978-0-07-802215',
    title: 'Database System Concepts, Relational Algebra & SQL Tuning',
    authorOrBrand: 'A. Silberschatz, H. Korth & S. Sudarshan',
    category: 'Books',
    subcategory: 'Database',
    price: 680,
    originalPrice: 795,
    stock: 19,
    semesterTag: 'Semester IV · Core Database',
    bindingOrMaterial: 'Paperback · 912 Pages',
    description:
      'Definitive university text on relational schema design, B+ tree indexing, ACID transaction serializability, Normal Forms (1NF–BCNF), PL/SQL triggers, and distributed NoSQL stores.',
    specs: {
      Publisher: 'McGraw Hill Education',
      Edition: '7th International Edition',
      ISBN: '978-0-07-802215-9',
      SyllabusCode: 'CS3492',
    },
    coverStyle: {
      bgHex: '#4A154B',
      accentHex: '#ECB22E',
      textHex: '#FBFBF9',
      editionLabel: '7TH INTERNATIONAL EDITION',
      codeLabel: 'CS-3492',
    },
  },

  // BOOKS -> Networking
  {
    id: 'bk-net-01',
    sku: 'ISBN-978-0-13-359414',
    title: 'Computer Networking: Top-Down Protocol Stack & Socket Lab',
    authorOrBrand: 'J. F. Kurose & K. W. Ross',
    category: 'Books',
    subcategory: 'Networking',
    price: 590,
    originalPrice: 690,
    stock: 23,
    semesterTag: 'Semester V · Core Networks',
    bindingOrMaterial: 'Paperback · 856 Pages',
    description:
      'Explores HTTP/3, DNS, TCP congestion control, BGP routing, subnetting, Wireshark packet inspection, and network security cryptography from application layer down to physical link.',
    specs: {
      Publisher: 'Pearson Higher Ed',
      Edition: '8th Edition',
      ISBN: '978-0-13-359414-0',
      SyllabusCode: 'CS3591',
    },
    coverStyle: {
      bgHex: '#0F4C5C',
      accentHex: '#E36414',
      textHex: '#FBFBF9',
      editionLabel: '8TH EDITION · WIRESHARK LABS',
      codeLabel: 'CS-3591',
    },
  },

  // BOOKS -> Mathematics
  {
    id: 'bk-math-01',
    sku: 'ISBN-978-81-7409-195',
    title: 'Discrete Mathematics, Combinatorics & Graph Theory',
    authorOrBrand: 'Kenneth H. Rosen & Kamala Krithivasan',
    category: 'Books',
    subcategory: 'Mathematics',
    price: 510,
    originalPrice: 595,
    stock: 31,
    semesterTag: 'Semester III · Mathematics',
    bindingOrMaterial: 'Paperback · 780 Pages',
    description:
      'Covers propositional & predicate logic, recurrence relations, modular arithmetic, algebraic structures, lattices, and Euler/Hamiltonian graph algorithms essential for computer science.',
    specs: {
      Publisher: 'McGraw Hill India',
      Edition: '8th Indian Adaptation',
      ISBN: '978-81-7409-195-6',
      SyllabusCode: 'MA3354',
    },
    coverStyle: {
      bgHex: '#5F0F40',
      accentHex: '#FB8B24',
      textHex: '#FBFBF9',
      editionLabel: '8TH EDITION · LOGIC & GRAPHS',
      codeLabel: 'MA-3354',
    },
  },
  {
    id: 'bk-math-02',
    sku: 'ISBN-978-81-7409-112',
    title: 'Matrices, Calculus & Differential Equations for Engineers',
    authorOrBrand: 'Dr. B. S. Grewal',
    category: 'Books',
    subcategory: 'Mathematics',
    price: 550,
    originalPrice: 640,
    stock: 40,
    semesterTag: 'Semester I · First Year',
    bindingOrMaterial: 'Hardcover · 1040 Pages',
    description:
      'Standard engineering mathematics reference covering eigenvalues, multivariable calculus, Laplace & Fourier transforms, and partial differential equations with solved university papers.',
    specs: {
      Publisher: 'Khanna Publishers',
      Edition: '44th Edition',
      ISBN: '978-81-7409-112-3',
      SyllabusCode: 'MA3151',
    },
    coverStyle: {
      bgHex: '#2B2D42',
      accentHex: '#8D99AE',
      textHex: '#EDF2F4',
      editionLabel: '44TH EDITION · 1000+ SOLVED PROBLEMS',
      codeLabel: 'MA-3151',
    },
  },

  // STATIONERY -> Notebooks
  {
    id: 'st-nb-01',
    sku: 'STN-REC-160A4',
    title: 'Hardcover Linen University Lab Record Book (160 Pages, Indexed)',
    authorOrBrand: 'Folio & Form Campus Press',
    category: 'Stationery',
    subcategory: 'Notebooks',
    price: 145,
    originalPrice: 175,
    stock: 120,
    semesterTag: 'All Semesters · Practical Labs',
    bindingOrMaterial: '100 GSM Archival Paper · Thread-Bound Hardcover',
    description:
      'Official university specification practical record book featuring bonafide certificate page, table of contents index, and alternating left-side blank observation / right-side ruled pages.',
    specs: {
      Size: 'A4 Oversized (220mm × 305mm)',
      PaperWeight: '100 GSM Fountain-Pen Friendly',
      Pages: '160 Numbered Pages + Index + Bonafide Sheet',
      Ruling: 'Alternating Graph/Blank & Single Ruled',
    },
    coverStyle: {
      bgHex: '#2F3E46',
      accentHex: '#CAD2C5',
      textHex: '#FBFBF9',
      editionLabel: '100 GSM · BONAFIDE CERTIFIED',
      codeLabel: 'REC-160',
    },
    imageUrl: CATEGORY_STATIONERY_IMAGE_URL,
  },
  {
    id: 'st-nb-02',
    sku: 'STN-NB-240GRID',
    title: 'A4 Dot-Grid & Ruled Engineering Lecture Notebook (240 Pages)',
    authorOrBrand: 'Folio & Form Paper Co.',
    category: 'Stationery',
    subcategory: 'Notebooks',
    price: 110,
    originalPrice: 135,
    stock: 150,
    semesterTag: 'All Semesters · Daily Lectures',
    bindingOrMaterial: 'Twin-Wire Spiral · 90 GSM Ivory Paper',
    description:
      'Lay-flat twin-wire spiral notebook with micro-perforated sheets, 5mm subtle dot-grid margins for system architecture diagrams, and date/subject header blocks on every page.',
    specs: {
      Size: 'A4 (210mm × 297mm)',
      PaperWeight: '90 GSM Acid-Free Ivory',
      Pages: '240 Pages',
      Binding: '360° Lay-Flat Twin Wire',
    },
    coverStyle: {
      bgHex: '#354F52',
      accentHex: '#84A98C',
      textHex: '#FBFBF9',
      editionLabel: '90 GSM · 5MM ARCHITECTURAL GRID',
      codeLabel: 'NB-240',
    },
  },

  // STATIONERY -> Pens
  {
    id: 'st-pen-01',
    sku: 'STN-PEN-UNI5',
    title: 'Archival Exam Rollerball & Technical Fineliner Set (Pack of 5)',
    authorOrBrand: 'Uni-Ball & Rotring Studio',
    category: 'Stationery',
    subcategory: 'Pens',
    price: 160,
    originalPrice: 195,
    stock: 95,
    semesterTag: 'University Theory & Lab Exams',
    bindingOrMaterial: 'Waterproof Pigment Ink · 0.5mm & 0.7mm',
    description:
      'Engineered for smudge-free speed writing during 3-hour university semester exams. Includes 3 low-viscosity blue rollerballs, 1 matte black heading pen, and 1 0.3mm diagram fineliner.',
    specs: {
      InkType: 'Water-Resistant Archival Pigment',
      TipSizes: '3× 0.7mm Blue, 1× 0.7mm Black, 1× 0.3mm Diagram Black',
      Grip: 'Knurled Matte Anti-Fatigue Barrel',
      Refillable: 'Yes (Standard Euro Cartridge)',
    },
    coverStyle: {
      bgHex: '#1B263B',
      accentHex: '#E0E1DD',
      textHex: '#FBFBF9',
      editionLabel: 'PACK OF 5 · EXAM GRADE INK',
      codeLabel: 'PEN-05',
    },
  },

  // STATIONERY -> Files
  {
    id: 'st-file-01',
    sku: 'STN-FIL-20PKT',
    title: 'Archival Viva Portfolio & Lab Sheet Cobra File Folder (Set of 2)',
    authorOrBrand: 'Solo Academic Archive',
    category: 'Stationery',
    subcategory: 'Files',
    price: 95,
    originalPrice: 120,
    stock: 88,
    semesterTag: 'Project Viva & Lab Submissions',
    bindingOrMaterial: 'Polypropylene Rigid Board · Steel Clip',
    description:
      'Includes one 20-pocket anti-glare clear sleeve portfolio for project reports/certificates and one heavy-duty spring cobra file for punched lab observation sheets.',
    specs: {
      Capacity: 'Up to 120 A4 Sheets + 20 Clear Sleeves',
      Material: '700 Micron Recyclable Polypropylene',
      SpineLabel: 'Replaceable Subject & Roll No. Card',
      Closure: 'Elastic Band + Stainless Spring Clip',
    },
    coverStyle: {
      bgHex: '#3C3744',
      accentHex: '#B4C5E4',
      textHex: '#FBFBF9',
      editionLabel: 'SET OF 2 · VIVA & LAB ARCHIVE',
      codeLabel: 'FIL-02',
    },
  },

  // STATIONERY -> Calculators
  {
    id: 'st-calc-01',
    sku: 'STN-CALC-FX991',
    title: 'Casio FX-991CW ClassWiz Non-Programmable Scientific Calculator',
    authorOrBrand: 'Casio Computer Co.',
    category: 'Stationery',
    subcategory: 'Calculators',
    price: 1295,
    originalPrice: 1495,
    stock: 44,
    semesterTag: 'Approved for All University Exams',
    bindingOrMaterial: 'High-Resolution 4-Gradation LCD · Solar + Battery',
    description:
      '540+ scientific functions including 4×4 matrix operations, numerical integration/differentiation, complex numbers, base-N conversions, and statistical distributions. 100% AICTE/University exam compliant.',
    specs: {
      Functions: '540+ Built-in Functions',
      Display: 'Natural Textbook Display (192 × 63 dots)',
      Power: 'Two-Way Solar + LR44 Backup',
      Warranty: '3 Years Campus Replacement Warranty',
    },
    coverStyle: {
      bgHex: '#212529',
      accentHex: '#ADB5BD',
      textHex: '#F8F9FA',
      editionLabel: '540+ FUNCTIONS · EXAM APPROVED',
      codeLabel: 'FX-991CW',
    },
  },

  // STATIONERY -> Drawing materials
  {
    id: 'st-draw-01',
    sku: 'STN-DRW-KIT01',
    title: 'Precision Engineering Graphics Mini-Drafter, Compass & A2 Sheet Tube',
    authorOrBrand: 'Staedtler & Omega Technical',
    category: 'Stationery',
    subcategory: 'Drawing materials',
    price: 690,
    originalPrice: 820,
    stock: 30,
    semesterTag: 'Semester I & II · Engineering Graphics',
    bindingOrMaterial: 'Powder-Coated Steel Arms + Brass Compass + 20 A2 Sheets',
    description:
      'Complete first-year engineering drawing kit containing a zero-play steel mini-drafter, bow compass with extension bar, set squares, French curves, 2H/HB/H leads, sheet clips, and telescopic A2 drawing tube.',
    specs: {
      Includes: 'Mini-Drafter, Brass Compass, 20× A2 Cartridge Sheets, Tube',
      SheetGrade: '180 GSM Acid-Free Drawing Cartridge',
      ProtractorScale: 'Laser-Etched Acrylic Beveled Edge',
      SyllabusCode: 'GE3251 Engineering Graphics',
    },
    coverStyle: {
      bgHex: '#14213D',
      accentHex: '#FCA311',
      textHex: '#FFFFFF',
      editionLabel: 'COMPLETE GRAPHICS INSTRUMENT SET',
      codeLabel: 'EG-3251',
    },
  },
];

export const STUDENT_COMBOS: StudentCombo[] = [
  {
    id: 'combo-1st-year-eng',
    title: '1st Year Engineering Kit',
    subtitle: 'Notebook + Record Book + Pens + File + Calculator',
    targetGroup: 'B.E. / B.Tech First Year (Semesters I & II)',
    description:
      'Everything a first-year engineering student needs from Day 1 of lectures and practical labs. Bundled with an instant 16% student kit subsidy.',
    items: [
      {
        productId: 'st-nb-02',
        quantity: 2,
        label: '2× A4 Dot-Grid & Ruled Lecture Notebooks (240p)',
      },
      {
        productId: 'st-nb-01',
        quantity: 2,
        label: '2× Hardcover Linen Lab Record Books (160p)',
      },
      {
        productId: 'st-pen-01',
        quantity: 1,
        label: '1× Archival Exam Rollerball & Fineliner Set (Pack of 5)',
      },
      {
        productId: 'st-file-01',
        quantity: 1,
        label: '1× Viva Portfolio & Lab Sheet Cobra File Set',
      },
      {
        productId: 'st-calc-01',
        quantity: 1,
        label: '1× Casio FX-991CW Scientific Calculator',
      },
    ],
    regularPrice: 2060,
    comboPrice: 1720,
    imageUrl: COMBO_ENG_IMAGE_URL,
  },
  {
    id: 'combo-web-tech-lab',
    title: 'Web Technology Lab Kit',
    subtitle: 'Record Book + Notebook + Pen + Lab Manual',
    targetGroup: 'CS / IT Semester V — Web Technology (CS3501)',
    description:
      'Curated specifically for the Web Technology Laboratory (HTML, CSS, JS, JSP, Servlets, XML & XPath). Includes the spiral Lab Manual, official 160-page Record Book, lecture notebook, and archival pen set.',
    items: [
      {
        productId: 'st-nb-01',
        quantity: 1,
        label: '1× Hardcover Linen Lab Record Book (160 Pages)',
      },
      {
        productId: 'st-nb-02',
        quantity: 1,
        label: '1× A4 Engineering Lecture Notebook (240 Pages)',
      },
      {
        productId: 'st-pen-01',
        quantity: 1,
        label: '1× Archival Exam & Lab Pen Set (Pack of 5)',
      },
      {
        productId: 'bk-web-02',
        quantity: 1,
        label: '1× Web Technology Practical Lab Manual (XML/XPath/Servlet)',
      },
    ],
    regularPrice: 635,
    comboPrice: 520,
    imageUrl: COMBO_WEB_IMAGE_URL,
  },
  {
    id: 'combo-cs-core-books',
    title: 'CS Core Semester Textbook & Viva Kit',
    subtitle: 'Web Tech Textbook + Database + Networking + Viva File',
    targetGroup: 'Pre-Final Year Computer Science & IT',
    description:
      'Complete semester textbook stack covering Web Technology, Database Systems, and Computer Networking along with an archival 20-pocket Viva portfolio folder.',
    items: [
      {
        productId: 'bk-web-01',
        quantity: 1,
        label: '1× Modern Web Technology (Servlets, JSP, XML & XPath)',
      },
      {
        productId: 'bk-db-01',
        quantity: 1,
        label: '1× Database System Concepts (7th Edition)',
      },
      {
        productId: 'bk-net-01',
        quantity: 1,
        label: '1× Computer Networking: Top-Down Approach',
      },
      {
        productId: 'st-file-01',
        quantity: 1,
        label: '1× Archival Viva Portfolio & Lab File Set',
      },
    ],
    regularPrice: 1905,
    comboPrice: 1590,
    imageUrl: CATEGORY_BOOKS_IMAGE_URL,
  },
];

export const DEMO_USERS: User[] = [
  {
    id: 'usr-stu-01',
    name: 'Aarav Subramanian',
    rollNumber: '24CS1042',
    email: '2403717610422113@cit.edu.in',
    department: 'B.E. Computer Science & Engineering',
    semester: 'Semester V',
    role: 'student',
  },
  {
    id: 'usr-adm-01',
    name: 'Prof. Meenakshi Sundaram (Store Admin)',
    rollNumber: 'ADMIN-CIT-01',
    email: 'admin@campusstore.edu.in',
    department: 'Central Book & Stationery Directorate',
    semester: 'Faculty Administrator',
    role: 'admin',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-2026-8419',
    studentId: 'usr-stu-01',
    studentName: 'Aarav Subramanian',
    rollNumber: '24CS1042',
    department: 'B.E. Computer Science & Engineering',
    email: '2403717610422113@cit.edu.in',
    phone: '+91 98402 71520',
    deliveryAddress: 'Room 312, Block B Hostel / CSE Department Counter',
    paymentMethod: 'UPI Instant Pay',
    items: [
      {
        id: 'combo-web-tech-lab',
        title: 'Web Technology Lab Kit (Record + Notebook + Pen + Lab Manual)',
        categoryLabel: 'Student Combo · Semester V',
        sku: 'COMBO-WT-01',
        unitPrice: 520,
        quantity: 1,
      },
      {
        id: 'bk-web-01',
        title: 'Modern Web Technology: Servlets, JSP, XML & XPath Architecture',
        categoryLabel: 'Books · Web Technology',
        sku: 'ISBN-978-81-203-5412',
        unitPrice: 540,
        quantity: 1,
      },
    ],
    subtotal: 1175,
    comboSavings: 115,
    deliveryFee: 0,
    total: 1060,
    status: 'Delivered',
    createdAt: '2026-09-24 14:20',
  },
  {
    id: 'ORD-2026-8452',
    studentId: 'usr-stu-02',
    studentName: 'Divya Krishnan',
    rollNumber: '26EC1018',
    department: 'B.E. Electronics & Communication',
    email: 'divya.k26@cit.edu.in',
    phone: '+91 94441 62910',
    deliveryAddress: 'First Year Academic Block — Central Stationery Desk',
    paymentMethod: 'Campus Smart Card',
    items: [
      {
        id: 'combo-1st-year-eng',
        title: '1st Year Engineering Kit (Notebook + Record + Pens + File + Calculator)',
        categoryLabel: 'Student Combo · First Year',
        sku: 'COMBO-ENG-01',
        unitPrice: 1720,
        quantity: 1,
      },
      {
        id: 'st-draw-01',
        title: 'Precision Engineering Graphics Mini-Drafter, Compass & A2 Sheet Tube',
        categoryLabel: 'Stationery · Drawing materials',
        sku: 'STN-DRW-KIT01',
        unitPrice: 690,
        quantity: 1,
      },
    ],
    subtotal: 2750,
    comboSavings: 340,
    deliveryFee: 0,
    total: 2410,
    status: 'Packed at Campus Store',
    createdAt: '2026-09-29 10:05',
  },
];
