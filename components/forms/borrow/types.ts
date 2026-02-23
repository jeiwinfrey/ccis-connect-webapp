export interface Unit {
  unitId: string;
  notes: string;
  condition: "Excellent" | "Good" | "Fair";
  status: "available" | "on-loan";
  borrower?: string;
  dueBack?: string;
}

export interface EquipmentItem {
  id: string;
  model: string;
  description: string;
  image: string;
  available: boolean;
  currentlyBorrowed: boolean;
  units: Unit[];
}

export interface Category {
  name: string;
  emoji: string;
  description: string;
  color: string;
  items: EquipmentItem[];
}

export interface BorrowRequest {
  id: string;
  model: string;
  emoji: string;
  category: string;
  loanDuration: string;
  dates: string;
  submittedDate: string;
  rejectedDate?: string;
  reason?: string;
}

export const conditionColor: Record<Unit["condition"], string> = {
  Excellent: "text-emerald-600",
  Good: "text-sky-600",
  Fair: "text-amber-500",
};

export const equipmentCategories: Category[] = [
  {
    name: "Cameras",
    emoji: "📷",
    description: "DSLRs, mirrorless, cinema & action cameras",
    color: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
    items: [
      {
        id: "cam-1",
        model: "Sony A7 IV",
        description: "33MP full-frame, 4K60p, 10-bit 4:2:2",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "CAM-A7IV-01", notes: "Includes 2 batteries · Last used Feb 10", condition: "Excellent", status: "available" },
          { unitId: "CAM-A7IV-02", notes: "Minor scuff on grip · Last used Feb 15", condition: "Good", status: "available" },
          { unitId: "CAM-A7IV-03", notes: "Brand new sensor clean · Last used Feb 18", condition: "Excellent", status: "available" },
          { unitId: "CAM-A7IV-04", notes: "LCD has hairline scratch · Last used Jan 30", condition: "Fair", status: "available" },
          { unitId: "CAM-A7IV-05", notes: "All accessories included · Last used Feb 12", condition: "Good", status: "available" },
          { unitId: "CAM-A7IV-06", notes: "A. Santos · Due back Mar 1", condition: "Good", status: "on-loan", borrower: "A. Santos", dueBack: "Mar 1" },
        ],
      },
      {
        id: "cam-2",
        model: "Canon EOS R5",
        description: "45MP full-frame, 8K RAW, dual card slots",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "CAM-R5-01", notes: "With RF 24-70mm f/2.8 · 1 unit", condition: "Excellent", status: "available" },
          { unitId: "CAM-R5-02", notes: "Body only · Last used Feb 8", condition: "Good", status: "available" },
        ],
      },
      {
        id: "cam-3",
        model: "BMPCC 6K Pro",
        description: "6K Super 35, Blackmagic RAW, built-in ND",
        image: "/api/placeholder/300/200",
        available: false,
        currentlyBorrowed: true,
        units: [
          { unitId: "CAM-BMPCC-01", notes: "J. Reyes · Due back Mar 2", condition: "Good", status: "on-loan", borrower: "J. Reyes", dueBack: "Mar 2" },
        ],
      },
      {
        id: "cam-4",
        model: "GoPro HERO13",
        description: "5.3K 60fps, waterproof, HyperSmooth 6.0",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "CAM-GP13-01", notes: "With accessories kit · Last used Feb 20", condition: "Excellent", status: "available" },
          { unitId: "CAM-GP13-02", notes: "Scratched lens cover · Last used Feb 1", condition: "Fair", status: "available" },
        ],
      },
      {
        id: "cam-5",
        model: "Nikon Z9",
        description: "45.7MP stacked sensor, 8K 60p, CFexpress",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "CAM-Z9-01", notes: "With 70-200mm · Last used Feb 17", condition: "Excellent", status: "available" },
        ],
      },
    ],
  },
  {
    name: "Audio Equipment",
    emoji: "🎤",
    description: "Microphones, recorders, headphones & mixers",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
    items: [
      {
        id: "audio-1",
        model: "Shure SM7B",
        description: "Dynamic broadcast mic, 50Hz-16kHz response",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "AUD-SM7B-01", notes: "With XLR cable · Last used Feb 19", condition: "Excellent", status: "available" },
          { unitId: "AUD-SM7B-02", notes: "No cable included · Last used Feb 5", condition: "Good", status: "available" },
        ],
      },
      {
        id: "audio-2",
        model: "Zoom H6",
        description: "6-track portable recorder, interchangeable mics",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "AUD-H6-01", notes: "Full kit · Last used Feb 14", condition: "Good", status: "available" },
        ],
      },
      {
        id: "audio-3",
        model: "Audio-Technica AT2020",
        description: "Condenser mic, cardioid, 20Hz-20kHz",
        image: "/api/placeholder/300/200",
        available: false,
        currentlyBorrowed: false,
        units: [
          { unitId: "AUD-AT2020-01", notes: "Under maintenance", condition: "Fair", status: "on-loan" },
        ],
      },
      {
        id: "audio-4",
        model: "Rode NTG3",
        description: "Shotgun mic, RF-bias, broadcast quality",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "AUD-NTG3-01", notes: "With blimp · Last used Feb 11", condition: "Excellent", status: "available" },
        ],
      },
    ],
  },
  {
    name: "Lighting",
    emoji: "💡",
    description: "LED panels, strobes, modifiers & stands",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    items: [
      {
        id: "light-1",
        model: "Aputure 600D Pro",
        description: "600W daylight LED, Bowens mount, wireless",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "LGT-600D-01", notes: "With softbox · Last used Feb 16", condition: "Good", status: "available" },
          { unitId: "LGT-600D-02", notes: "Body only · Last used Feb 9", condition: "Good", status: "available" },
        ],
      },
      {
        id: "light-2",
        model: "Godox SL-60W",
        description: "60W LED spotlight, 5600K, silent cooling",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "LGT-SL60-01", notes: "Last used Feb 21", condition: "Excellent", status: "available" },
        ],
      },
      {
        id: "light-3",
        model: "Nanlite PavoTube II",
        description: "RGB tube light, 36W, app control",
        image: "/api/placeholder/300/200",
        available: false,
        currentlyBorrowed: false,
        units: [
          { unitId: "LGT-PAVO-01", notes: "M. Cruz · Due back Mar 3", condition: "Good", status: "on-loan", borrower: "M. Cruz", dueBack: "Mar 3" },
        ],
      },
      {
        id: "light-4",
        model: "Profoto B10",
        description: "250Ws strobe, TTL, high-speed sync",
        image: "/api/placeholder/300/200",
        available: true,
        currentlyBorrowed: false,
        units: [
          { unitId: "LGT-B10-01", notes: "With battery + charger · Last used Feb 13", condition: "Excellent", status: "available" },
        ],
      },
    ],
  },
];

export const pendingRequests: BorrowRequest[] = [
  { id: "req-1", model: "Sony A7 IV", emoji: "📷", category: "Cameras", loanDuration: "3-day loan", dates: "Feb 24 – Feb 27", submittedDate: "Feb 21" },
  { id: "req-2", model: "Rode NTG3", emoji: "🎤", category: "Audio", loanDuration: "1-day loan", dates: "Feb 25", submittedDate: "Feb 21" },
  { id: "req-3", model: "Aputure 600D Pro", emoji: "💡", category: "Lighting", loanDuration: "2-day loan", dates: "Feb 26 – Feb 28", submittedDate: "Feb 20" },
];

export const rejectedRequests: BorrowRequest[] = [
  { id: "rej-1", model: "BMPCC 6K Pro", emoji: "🎥", category: "Cameras", loanDuration: "3-day loan", dates: "Feb 19 – Feb 22", submittedDate: "Feb 19", rejectedDate: "Feb 19", reason: "Item already on loan during requested period. Please choose different dates." },
];
