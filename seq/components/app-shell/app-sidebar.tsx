"use client"

import type * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/seq/lib/utils"
import { Home, ImageIcon, LayoutGrid, Film, Settings, PlusSquare, Layers, SlidersHorizontal, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/seq/components/ui/tooltip"
import { LogoIcon } from "@/seq/components/editor/components/icons"
import { UserMenu } from "@/seq/components/editor/components/user-menu"

export type SidebarView = "library" | "create" | "settings" | "transitions" | "inspector" | "storyboard"

interface AppSidebarProps {
  activeView?: SidebarView
  isPanelOpen?: boolean
  onViewChange?: (view: SidebarView) => void
  onTogglePanel?: () => void
}

const NAV_ITEMS = [
  { id: "home", href: "/", icon: Home, label: "首页", miniLabel: "首页", shortcut: "H" },
  {
    id: "image-playground",
    href: "/image-playground",
    icon: ImageIcon,
    label: "图片生成",
    miniLabel: "图片",
    shortcut: "I",
  },
  { id: "storyboard", href: "/storyboard", icon: LayoutGrid, label: "分镜", miniLabel: "分镜", shortcut: "S" },
  { id: "studio", href: "/timeline", icon: Film, label: "剪辑台", miniLabel: "剪辑", shortcut: "T" },
] as const

const STUDIO_ITEMS: {
  id: SidebarView
  icon: React.FC<{ className?: string }>
  label: string
  miniLabel: string
  shortcut?: string
}[] = [
  { id: "create", icon: PlusSquare, label: "生成", miniLabel: "生成", shortcut: "1" },
  { id: "library", icon: Layers, label: "素材库", miniLabel: "素材", shortcut: "2" },
  { id: "storyboard", icon: LayoutGrid, label: "分镜面板", miniLabel: "分镜", shortcut: "3" },
  { id: "transitions", icon: SlidersHorizontal, label: "转场", miniLabel: "转场", shortcut: "4" },
  { id: "inspector", icon: Info, label: "检查器", miniLabel: "详情", shortcut: "5" },
  { id: "settings", icon: Settings, label: "设置", miniLabel: "设置", shortcut: "6" },
]

export function AppSidebar({ activeView, isPanelOpen, onViewChange, onTogglePanel }: AppSidebarProps) {
  const pathname = usePathname()
  const isStudioPage = pathname === "/timeline"

  const getNavItemActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <TooltipProvider delayDuration={100}>
      <aside className="fixed left-0 top-0 bottom-0 z-50 flex w-[60px] flex-col border-r border-[var(--border-default)] bg-[var(--surface-0)]">
        {/* Logo */}
        <div className="flex h-14 items-center justify-center border-b border-[var(--border-default)]">
          <Link href="/" className="flex items-center justify-center group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-lg transition-all group-hover:shadow-xl">
              <LogoIcon className="h-4 w-4 text-black" />
            </div>
          </Link>
        </div>

        {/* User Menu */}
        <div className="flex justify-center py-3 border-b border-[var(--border-default)]">
          <UserMenu />
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="flex flex-col gap-0.5 px-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = getNavItemActive(item.href)
              const Icon = item.icon

              return (
                <li key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2 transition-all group",
                          isActive ? "text-white" : "text-[var(--text-tertiary)] hover:text-white",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                            isActive ? "bg-[var(--surface-3)]" : "group-hover:bg-[var(--hover-overlay)]",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span
                          className={cn(
                            "text-[10px] font-medium leading-none transition-colors",
                            isActive
                              ? "text-white"
                              : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]",
                          )}
                        >
                          {item.miniLabel}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      <p>
                        {item.label}
                        {item.shortcut && <span className="ml-2 text-[var(--text-tertiary)]">({item.shortcut})</span>}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              )
            })}
          </ul>

          {/* Studio-specific items */}
          {isStudioPage && onViewChange && onTogglePanel && (
            <>
              <div className="mx-2.5 my-2 h-px bg-[var(--border-default)]" />
              <ul className="flex flex-col gap-0.5 px-1.5">
                {STUDIO_ITEMS.map((item) => {
                  const isActive = activeView === item.id && isPanelOpen
                  const Icon = item.icon

                  return (
                    <li key={item.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              if (activeView === item.id) {
                                onTogglePanel()
                              } else {
                                onViewChange(item.id)
                              }
                            }}
                            className={cn(
                              "flex w-full flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2 transition-all group",
                              isActive ? "text-white" : "text-[var(--text-tertiary)] hover:text-white",
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                                isActive ? "bg-[var(--surface-3)]" : "group-hover:bg-[var(--hover-overlay)]",
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span
                              className={cn(
                                "text-[10px] font-medium leading-none transition-colors",
                                isActive
                                  ? "text-white"
                                  : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]",
                              )}
                            >
                              {item.miniLabel}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12}>
                          <p className="text-sm">
                            {item.label}
                            {item.shortcut && (
                              <span className="ml-2 text-[var(--text-tertiary)]">({item.shortcut})</span>
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </nav>

        {/* Footer with credits */}
        <div className="border-t border-[var(--border-default)] p-3">
          <div className="flex flex-col items-center gap-0.5 text-center">
            <span className="text-sm font-semibold text-white">∞</span>
            <span className="text-[10px] text-[var(--text-tertiary)]">额度</span>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}

export default AppSidebar
