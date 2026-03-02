"use client";

import React, { createContext, useContext, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RequestStatus = "pending" | "approved" | "rejected";
export type RequestType = "borrow" | "reservation";

export interface AdminBorrowRequest {
  type: "borrow";
  id: string;
  studentName: string;
  studentId: string;
  model: string;
  unitId: string;
  category: string;
  borrowDate: string;
  returnDate: string;
  returnDateISO: string;
  purpose: string;
  submittedDate: string;
  status: RequestStatus;
  rejectionReason?: string;
}

export interface AdminRoomRequest {
  type: "reservation";
  id: string;
  studentName: string;
  studentId: string;
  roomId: string;
  roomName: string;
  floor: string;
  roomType: string;
  date: string;
  timeSlot: string;
  purpose: string;
  submittedDate: string;
  status: RequestStatus;
  rejectionReason?: string;
}

export type AdminRequest = AdminBorrowRequest | AdminRoomRequest;

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedRequests: AdminRequest[] = [
  {
    type: "borrow",
    id: "br-001",
    studentName: "Juan dela Cruz",
    studentId: "2024-00123",
    model: "Sony A7 IV",
    unitId: "CAM-A7IV-01",
    category: "Cameras",
    borrowDate: "Feb 24, 2026",
    returnDate: "Feb 27, 2026",
    returnDateISO: "2026-02-27",
    purpose: "Documentary film project for COMM 412 — campus life coverage.",
    submittedDate: "Feb 21, 2026",
    status: "pending",
  },
  {
    type: "borrow",
    id: "br-002",
    studentName: "Maria Santos",
    studentId: "2023-00456",
    model: "Rode NTG3",
    unitId: "AUD-NTG3-01",
    category: "Audio",
    borrowDate: "Feb 25, 2026",
    returnDate: "Feb 25, 2026",
    returnDateISO: "2026-02-25",
    purpose: "Live interview recording for the College Radio broadcast.",
    submittedDate: "Feb 21, 2026",
    status: "pending",
  },
  {
    type: "borrow",
    id: "br-003",
    studentName: "Carlo Reyes",
    studentId: "2022-00789",
    model: "Aputure 600D Pro",
    unitId: "LGT-600D-01",
    category: "Lighting",
    borrowDate: "Feb 26, 2026",
    returnDate: "Feb 28, 2026",
    returnDateISO: "2026-02-28",
    purpose: "Studio shoot for the annual IT Week photo exhibit.",
    submittedDate: "Feb 20, 2026",
    status: "pending",
  },
  {
    type: "borrow",
    id: "br-004",
    studentName: "Ana Lim",
    studentId: "2024-00201",
    model: "Zoom H6",
    unitId: "AUD-H6-01",
    category: "Audio",
    borrowDate: "Mar 1, 2026",
    returnDate: "Mar 2, 2026",
    returnDateISO: "2026-03-02",
    purpose: "Field recordings for soundscape art installation.",
    submittedDate: "Feb 22, 2026",
    status: "approved",
  },
  {
    type: "borrow",
    id: "br-005",
    studentName: "Jose Garcia",
    studentId: "2021-00334",
    model: "BMPCC 6K Pro",
    unitId: "CAM-BMPCC-01",
    category: "Cameras",
    borrowDate: "Feb 19, 2026",
    returnDate: "Feb 22, 2026",
    returnDateISO: "2026-02-22",
    purpose: "Short film production.",
    submittedDate: "Feb 19, 2026",
    status: "rejected",
    rejectionReason: "Item already on loan during requested period. Please choose different dates.",
  },
  {
    type: "reservation",
    id: "rv-001",
    studentName: "Lea Mendoza",
    studentId: "2023-00567",
    roomId: "R101",
    roomName: "Seminar Room B",
    floor: "1st Floor",
    roomType: "Seminar Room",
    date: "Feb 24, 2026",
    timeSlot: "9:00 AM – 11:00 AM",
    purpose: "CS thesis group defense rehearsal.",
    submittedDate: "Feb 21, 2026",
    status: "pending",
  },
  {
    type: "reservation",
    id: "rv-002",
    studentName: "Mark Villanueva",
    studentId: "2022-00612",
    roomId: "R102",
    roomName: "Lab 1",
    floor: "1st Floor",
    roomType: "Computer Lab",
    date: "Feb 25, 2026",
    timeSlot: "1:00 PM – 3:00 PM",
    purpose: "Programming contest practice session.",
    submittedDate: "Feb 20, 2026",
    status: "pending",
  },
  {
    type: "reservation",
    id: "rv-003",
    studentName: "Grace Tan",
    studentId: "2024-00890",
    roomId: "R105",
    roomName: "Seminar Room B",
    floor: "2nd Floor",
    roomType: "Seminar Room",
    date: "Feb 26, 2026",
    timeSlot: "3:00 PM – 5:00 PM",
    purpose: "Research presentation for CCIS department colloquium.",
    submittedDate: "Feb 19, 2026",
    status: "approved",
  },
  {
    type: "reservation",
    id: "rv-004",
    studentName: "Rico Delos Santos",
    studentId: "2021-00445",
    roomId: "R103",
    roomName: "Lab 2",
    floor: "1st Floor",
    roomType: "Computer Lab",
    date: "Feb 23, 2026",
    timeSlot: "10:00 AM – 12:00 PM",
    purpose: "System integration testing.",
    submittedDate: "Feb 18, 2026",
    status: "rejected",
    rejectionReason: "Lab 2 is reserved for examinations on that date.",
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

interface AdminStoreContext {
  requests: AdminRequest[];
  approve: (id: string) => void;
  reject: (id: string, reason: string) => void;
}

const AdminContext = createContext<AdminStoreContext | null>(null);

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<AdminRequest[]>(seedRequests);

  function approve(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved", rejectionReason: undefined } : r))
    );
  }

  function reject(id: string, reason: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected", rejectionReason: reason } : r))
    );
  }

  return (
    <AdminContext.Provider value={{ requests, approve, reject }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminStore() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminStore must be used inside AdminStoreProvider");
  return ctx;
}
