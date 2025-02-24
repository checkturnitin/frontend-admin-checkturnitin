"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { appName } from "@/utils/utils"
import {
  FiCreditCard,
  FiDollarSign,
  FiHome,
  FiLogOut,
  FiMoreHorizontal,
  FiShoppingCart,
  FiUser,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi"
import { GrTransaction } from "react-icons/gr"
import { GiWhirlpoolShuriken } from "react-icons/gi"
import { IoIosStats } from "react-icons/io"
import { MdOutlineWorkspaces } from "react-icons/md"
import { FaFileInvoice } from "react-icons/fa"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const pathName = usePathname()
  const [user, setUser] = useState<any>()

  const menuItems = [
    { href: "/admin/dashboard", icon: FiHome, label: "Dashboard" },
    { href: "/admin/stats", icon: IoIosStats, label: "Stats" },
    { href: "/admin/shop", icon: FiShoppingCart, label: "Shop" },
    { href: "/admin/transactions", icon: GrTransaction, label: "Transactions" },
    { href: "/admin/credits", icon: GiWhirlpoolShuriken, label: "Credits" },
    { href: "/admin/purchases", icon: FiDollarSign, label: "Purchases" },
    { href: "/admin/invoice", icon: FaFileInvoice, label: "Invoice" },
    { href: "/admin/payment_methods", icon: FiCreditCard, label: "Payment methods" },
    { href: "/admin/users", icon: FiUsers, label: "Users" },
    { href: "/admin/action", icon: MdOutlineWorkspaces, label: "Action" },
    { href: "/admin/checks", icon: MdOutlineWorkspaces, label: "Checks" },

    { href: "/admin/staffs", icon: MdOutlineWorkspaces, label: "Staffs" },
  ]

  return (
    <main
      className="flex bg-black text-white h-screen w-screen p-2 max-sm:p-0"
      onClick={() => {
        if (moreMenuOpen) setMoreMenuOpen(false)
      }}
    >
      <div
        className={`flex flex-col ${isCollapsed ? "w-16" : "w-64"} h-full transition-all duration-300 ease-in-out bg-black border-r border-indigo-500`}
      >
        <div className="p-4 flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/">
              <p className="font-semibold text-indigo-500">{appName} | Admin</p>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2 p-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center ${isCollapsed ? "justify-center" : "justify-start"} p-2 rounded-md ${pathName.includes(item.href) ? "bg-indigo-500" : "hover:bg-indigo-700"} transition-colors`}
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && <span className="ml-2">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-indigo-500">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-700 text-white rounded-full w-10 h-10 flex items-center justify-center">
              <FiUser />
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <p className="font-semibold truncate">{user?.name || "Admin User"}</p>
              </div>
            )}
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="p-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              <FiMoreHorizontal />
            </button>
          </div>
          {moreMenuOpen && (
            <div className="mt-2 bg-neutral-900 rounded-md p-2">
              <button
                onClick={() => {
                  localStorage.clear()
                  window.location.href = "/"
                }}
                className="flex items-center gap-2 w-full p-2 hover:bg-indigo-700 rounded-md transition-colors"
              >
                <FiLogOut className="text-red-500" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 h-full overflow-y-auto">{children}</div>
      <ToastContainer />
    </main>
  )
}

