"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    IconLayoutDashboard,
    IconBook,
    IconCalendar,
    IconPackage,
    IconHistory,
    IconShield,
    IconLogout,
    IconClock,
    IconCheck,
    IconX,
    IconPackages,
    IconCircleDotted,
    IconSettings,
    IconDoor,
    IconChartBar,
} from "@tabler/icons-react";

import { Logo } from "@/components/ui/logo";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "@/components/features/admin/dashboard";
import BorrowRequestPending from "@/components/features/admin/borrow/borrow-request-pending";
import BorrowRequestAccepted from "@/components/features/admin/borrow/borrow-request-accepted";
import BorrowRequestRejected from "@/components/features/admin/borrow/borrow-request-rejected";
import RoomReservationPending from "@/components/features/admin/room/room-reservation-pending";
import RoomReservationAccepted from "@/components/features/admin/room/room-reservation-accepted";
import RoomReservationRejected from "@/components/features/admin/room/room-reservation-rejected";
import EquipmentAvailable from "@/components/features/admin/equipment/equipment-available";
import EquipmentOnLoan from "@/components/features/admin/equipment/equipment-on-loan";
import EquipmentAll from "@/components/features/admin/equipment/equipment-all";
import History from "@/components/features/admin/history";
import Admin from "@/components/features/admin/admin";
import EquipmentManagement from "@/components/features/admin/equipment/equipment-management";
import RoomManagement from "@/components/features/admin/room/room-management";
import Analytics from "@/components/features/admin/analytics";

type ActiveSection =
    | "dashboard"
    | "borrow-pending"
    | "borrow-accepted"
    | "borrow-rejected"
    | "room-pending"
    | "room-accepted"
    | "room-rejected"
    | "equipment-available"
    | "equipment-on-loan"
    | "equipment-all"
    | "equipment-manage"
    | "room-manage"
    | "history"
    | "analytics"
    | "admin";

const borrowSubItems = [
    { key: "borrow-pending" as ActiveSection, label: "Pending", icon: IconClock },
    { key: "borrow-accepted" as ActiveSection, label: "Accepted", icon: IconCheck },
    { key: "borrow-rejected" as ActiveSection, label: "Rejected", icon: IconX },
];

const roomSubItems = [
    { key: "room-pending" as ActiveSection, label: "Pending", icon: IconClock },
    { key: "room-accepted" as ActiveSection, label: "Accepted", icon: IconCheck },
    { key: "room-rejected" as ActiveSection, label: "Rejected", icon: IconX },
];

const equipmentSubItems = [
    { key: "equipment-available" as ActiveSection, label: "Available", icon: IconCircleDotted },
    { key: "equipment-on-loan" as ActiveSection, label: "On Loan", icon: IconPackages },
    { key: "equipment-all" as ActiveSection, label: "All Units", icon: IconPackage },
];

function AdminSidebar({
    active,
    setActive,
    onLogout,
}: {
    active: ActiveSection;
    setActive: (s: ActiveSection) => void;
    onLogout: () => void;
}) {
    const isBorrowActive = active.startsWith("borrow");
    const isRoomActive = active.startsWith("room");
    const isEquipActive = active.startsWith("equipment");

    return (
        <Sidebar collapsible="icon" aria-label="Admin sidebar">
            {/* Header: Logo + Brand */}
            <SidebarHeader className="py-4 px-3">
                <div className="flex items-center gap-2 px-1">
                    <Logo
                        className="h-6 w-6 shrink-0 text-primary"
                        strokeWidth={1.8}
                    />
                    <span className="text-sm font-semibold text-foreground truncate group-data-[collapsible=icon]:hidden">
                        CCIS Connect
                    </span>
                </div>
            </SidebarHeader>

            <div className="border-b border-border" />

            <SidebarContent>
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>

                            {/* Dashboard */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={active === "dashboard"}
                                    onClick={() => setActive("dashboard")}
                                    tooltip="Dashboard"
                                >
                                    <IconLayoutDashboard />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {/* Borrow Requests */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    className="pointer-events-none cursor-default"
                                    tooltip="Borrow Requests"
                                >
                                    <IconBook />
                                    <span>Borrow Requests</span>
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    {borrowSubItems.map((item) => (
                                        <SidebarMenuSubItem key={item.key}>
                                            <SidebarMenuSubButton
                                                isActive={active === item.key}
                                                onClick={() => setActive(item.key)}
                                                asChild={false}
                                            >
                                                <item.icon className="h-3.5 w-3.5" />
                                                <span>{item.label}</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </SidebarMenuItem>

                            {/* Room Reservations */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    className="pointer-events-none cursor-default"
                                    tooltip="Room Reservations"
                                >
                                    <IconCalendar />
                                    <span>Room Reservations</span>
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    {roomSubItems.map((item) => (
                                        <SidebarMenuSubItem key={item.key}>
                                            <SidebarMenuSubButton
                                                isActive={active === item.key}
                                                onClick={() => setActive(item.key)}
                                                asChild={false}
                                            >
                                                <item.icon className="h-3.5 w-3.5" />
                                                <span>{item.label}</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </SidebarMenuItem>

                            {/* Equipment Inventory */}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    className="pointer-events-none cursor-default"
                                    tooltip="Equipment Inventory"
                                >
                                    <IconPackage />
                                    <span>Equipment Inventory</span>
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    {equipmentSubItems.map((item) => (
                                        <SidebarMenuSubItem key={item.key}>
                                            <SidebarMenuSubButton
                                                isActive={active === item.key}
                                                onClick={() => setActive(item.key)}
                                                asChild={false}
                                            >
                                                <item.icon className="h-3.5 w-3.5" />
                                                <span>{item.label}</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </SidebarMenuItem>

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                {/* Management */}
                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={active === "room-manage"}
                                    onClick={() => setActive("room-manage")}
                                    tooltip="Manage Rooms"
                                >
                                    <IconDoor />
                                    <span>Manage Rooms</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={active === "equipment-manage"}
                                    onClick={() => setActive("equipment-manage")}
                                    tooltip="Manage Inventory"
                                >
                                    <IconSettings />
                                    <span>Manage Inventory</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <div className="border-b border-border" />

            {/* Footer */}
            <SidebarFooter className="py-3 px-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            isActive={active === "history"}
                            onClick={() => setActive("history")}
                            tooltip="History"
                        >
                            <IconHistory />
                            <span>History</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            isActive={active === "analytics"}
                            onClick={() => setActive("analytics")}
                            tooltip="Analytics"
                        >
                            <IconChartBar />
                            <span>Analytics</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            isActive={active === "admin"}
                            onClick={() => setActive("admin")}
                            tooltip="Admin"
                        >
                            <IconShield />
                            <span>Admin</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Logout"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={onLogout}
                        >
                            <IconLogout />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

function ContentArea({ active }: { active: ActiveSection }) {
    switch (active) {
        case "dashboard":
            return <Dashboard />;
        case "borrow-pending":
            return <BorrowRequestPending />;
        case "borrow-accepted":
            return <BorrowRequestAccepted />;
        case "borrow-rejected":
            return <BorrowRequestRejected />;
        case "room-pending":
            return <RoomReservationPending />;
        case "room-accepted":
            return <RoomReservationAccepted />;
        case "room-rejected":
            return <RoomReservationRejected />;
        case "room-manage":
            return <RoomManagement />;
        case "equipment-available":
            return <EquipmentAvailable />;
        case "equipment-on-loan":
            return <EquipmentOnLoan />;
        case "equipment-all":
            return <EquipmentAll />;
        case "equipment-manage":
            return <EquipmentManagement />;
        case "history":
            return <History />;
        case "analytics":
            return <Analytics />;
        case "admin":
            return <Admin />;
        default:
            return <Dashboard />;
    }
}

export default function AdminPage() {
    const [active, setActive] = useState<ActiveSection>("dashboard");
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
    }

    const breadcrumb: Record<ActiveSection, string[]> = {
        dashboard: ["Dashboard"],
        "borrow-pending": ["Borrow Requests", "Pending"],
        "borrow-accepted": ["Borrow Requests", "Accepted"],
        "borrow-rejected": ["Borrow Requests", "Rejected"],
        "room-pending": ["Room Reservations", "Pending"],
        "room-accepted": ["Room Reservations", "Accepted"],
        "room-rejected": ["Room Reservations", "Rejected"],
        "room-manage": ["Manage Rooms"],
        "equipment-available": ["Equipment Inventory", "Available"],
        "equipment-on-loan": ["Equipment Inventory", "On Loan"],
        "equipment-all": ["Equipment Inventory", "All Units"],
        "equipment-manage": ["Manage Inventory"],
        history: ["History"],
        analytics: ["Analytics"],
        admin: ["Admin"],
    };

    const crumbs = breadcrumb[active];

    return (
        <TooltipProvider>
            <SidebarProvider>
                <a href="#main-content" className="skip-link">Skip to main content</a>
                <AdminSidebar active={active} setActive={setActive} onLogout={handleLogout} />
                <SidebarInset>
                    {/* Top bar */}
                    <header className="flex h-14 items-center gap-3 border-b border-border/60 px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                        <div className="h-4 w-px bg-border" />
                        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
                            {crumbs.map((crumb, i) => (
                                <span key={i} className="flex items-center gap-1.5">
                                    {i > 0 && <span className="text-muted-foreground text-sm" aria-hidden="true">/</span>}
                                    <span className={`text-sm ${i === crumbs.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}`} aria-current={i === crumbs.length - 1 ? "page" : undefined}>
                                        {crumb}
                                    </span>
                                </span>
                            ))}
                        </nav>
                    </header>

                    {/* Main content */}
                    <main id="main-content">
                        <ContentArea active={active} />
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}