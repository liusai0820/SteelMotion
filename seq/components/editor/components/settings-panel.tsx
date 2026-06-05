"use client"
import { memo, useCallback, useState } from "react"
import { SettingsIcon } from "./icons"
import { ASPECT_RATIOS, PLAYBACK_CONSTANTS, STEELMOTION_EXPORT_TEMPLATES } from "../constants"
import { clearAutosave, hasAutosave } from "../services/project-service"
import {
  PanelContainer,
  PanelHeader,
  PanelContent,
  PanelSectionBordered,
  Toggle,
  Select,
  NumberInput,
} from "./panel-primitives"

interface ProjectSettings {
  projectName: string
  aspectRatio: string
  frameRate: number
  defaultClipDuration: number
  autoSave: boolean
  autoSaveInterval: number
  snapToGrid: boolean
  showWaveforms: boolean
  showThumbnails: boolean
  exportTemplateId: string
}

interface SettingsPanelProps {
  onClose: () => void
  onClearTimeline: () => void
  onClearLibrary: () => void
  onClearAll: () => void
  defaultDuration: number
  onDurationChange: (val: number) => void
  projectSettings?: Partial<ProjectSettings>
  onSettingsChange?: (settings: Partial<ProjectSettings>) => void
}

export const SettingsPanel = memo(function SettingsPanel({
  onClose,
  onClearTimeline,
  onClearLibrary,
  onClearAll,
  defaultDuration,
  onDurationChange,
  projectSettings,
  onSettingsChange,
}: SettingsPanelProps) {
  const [settings, setSettings] = useState<ProjectSettings>({
    projectName: projectSettings?.projectName || "未命名项目",
    aspectRatio: projectSettings?.aspectRatio || "16:9",
    frameRate: projectSettings?.frameRate || PLAYBACK_CONSTANTS.DEFAULT_FPS,
    defaultClipDuration: defaultDuration,
    autoSave: projectSettings?.autoSave ?? true,
    autoSaveInterval: projectSettings?.autoSaveInterval || 60,
    snapToGrid: projectSettings?.snapToGrid ?? true,
    showWaveforms: projectSettings?.showWaveforms ?? true,
    showThumbnails: projectSettings?.showThumbnails ?? true,
    exportTemplateId: projectSettings?.exportTemplateId || STEELMOTION_EXPORT_TEMPLATES[0].id,
  })

  const updateSetting = useCallback(
    <K extends keyof ProjectSettings>(key: K, value: ProjectSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value }
        onSettingsChange?.(next)
        return next
      })
      if (key === "defaultClipDuration") {
        onDurationChange(value as number)
      }
    },
    [onSettingsChange, onDurationChange],
  )

  const handleClearTimeline = useCallback(() => {
    if (window.confirm("确定清空时间线吗？此操作不可撤销。")) {
      onClearTimeline()
    }
  }, [onClearTimeline])

  const handleClearLibrary = useCallback(() => {
    if (window.confirm("确定清空素材库吗？此操作不可撤销。")) {
      onClearLibrary()
    }
  }, [onClearLibrary])

  const handleResetSettings = useCallback(() => {
    if (window.confirm("确定恢复默认设置吗？")) {
      const defaults: ProjectSettings = {
        projectName: "未命名项目",
        aspectRatio: "16:9",
        frameRate: 30,
        defaultClipDuration: 5,
        autoSave: true,
        autoSaveInterval: 60,
        snapToGrid: true,
        showWaveforms: true,
        showThumbnails: true,
        exportTemplateId: STEELMOTION_EXPORT_TEMPLATES[0].id,
      }
      setSettings(defaults)
      onSettingsChange?.(defaults)
      onDurationChange(5)
    }
  }, [onSettingsChange, onDurationChange])

  const handleClearAll = useCallback(() => {
    if (
      window.confirm(
        "确定新建项目吗？这会清空时间线、素材库和分镜，且不可撤销。",
      )
    ) {
      onClearAll()
    }
  }, [onClearAll])

  const handleClearAutosave = useCallback(() => {
    if (
      window.confirm("确定清除自动保存数据吗？这会移除自动保存项目并重置默认轨道。")
    ) {
      clearAutosave()
      window.location.reload()
    }
  }, [])

  return (
    <PanelContainer>
      <PanelHeader title="项目设置" onClose={onClose} />

      <PanelContent>
        {/* Project Info Section */}
        <PanelSectionBordered title="项目" icon={<SettingsIcon className="w-4 h-4 text-[var(--accent-text)]" />}>
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400">项目名称</label>
            <input
              type="text"
              value={settings.projectName}
              onChange={(e) => updateSetting("projectName", e.target.value)}
              className="w-full bg-[var(--surface-0)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-[var(--accent-primary)]"
              placeholder="输入项目名称..."
            />
          </div>

          <Select
            label="画幅"
            value={settings.aspectRatio}
            options={ASPECT_RATIOS.map((ar) => ({ value: ar.value, label: ar.label }))}
            onChange={(v) => updateSetting("aspectRatio", v)}
          />

          <Select
            label="帧率"
            value={settings.frameRate}
            options={[
              { value: 24, label: "24 fps（电影）" },
              { value: 25, label: "25 fps（PAL）" },
              { value: 30, label: "30 fps（标准）" },
              { value: 60, label: "60 fps（流畅）" },
            ]}
            onChange={(v) => updateSetting("frameRate", Number(v))}
          />
        </PanelSectionBordered>

        {/* Timeline Section */}
        <PanelSectionBordered
          title="时间线"
          icon={
            <svg
              className="w-4 h-4 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
              <path d="M9 3v18" />
            </svg>
          }
        >
          <NumberInput
            label="默认片段时长"
            value={settings.defaultClipDuration}
            min={1}
            max={60}
            step={1}
            unit="秒"
            onChange={(v) => updateSetting("defaultClipDuration", v)}
          />

          <Toggle
            label="吸附到网格"
            description="片段会吸附到其它片段和标记点"
            checked={settings.snapToGrid}
            onChange={(v) => updateSetting("snapToGrid", v)}
          />

          <Toggle
            label="显示音频波形"
            description="在音频片段上显示波形"
            checked={settings.showWaveforms}
            onChange={(v) => updateSetting("showWaveforms", v)}
          />

          <Toggle
            label="显示视频缩略图"
            description="在片段上显示视频缩略图"
            checked={settings.showThumbnails}
            onChange={(v) => updateSetting("showThumbnails", v)}
          />
        </PanelSectionBordered>

        {/* Export Template Section */}
        <PanelSectionBordered
          title="导出模板"
          icon={<SettingsIcon className="w-4 h-4 text-sky-400" />}
          defaultOpen={false}
        >
          <Select
            label="模板"
            value={settings.exportTemplateId}
            options={STEELMOTION_EXPORT_TEMPLATES.map((template) => ({ value: template.id, label: template.name }))}
            onChange={(v) => updateSetting("exportTemplateId", String(v))}
          />

          {STEELMOTION_EXPORT_TEMPLATES.filter((template) => template.id === settings.exportTemplateId).map(
            (template) => (
              <div key={template.id} className="space-y-2 text-[11px] text-neutral-400">
                <p>片头：{template.opener}</p>
                <p>片尾：{template.closer}</p>
                <p>Logo：{template.logo.enabled ? template.logo.position : "关闭"}</p>
                <p>水印：{template.watermark.enabled ? template.watermark.text : "关闭"}</p>
                <p>字幕：{template.subtitles.enabled ? template.subtitles.style : "关闭"}</p>
              </div>
            ),
          )}
        </PanelSectionBordered>

        {/* Auto-Save Section */}
        <PanelSectionBordered
          title="自动保存"
          icon={
            <svg
              className="w-4 h-4 text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          }
        >
          <Toggle
            label="开启自动保存"
            description="定期自动保存当前项目"
            checked={settings.autoSave}
            onChange={(v) => updateSetting("autoSave", v)}
          />

          {settings.autoSave && (
            <Select
              label="保存间隔"
              value={settings.autoSaveInterval}
              options={[
                { value: 30, label: "每 30 秒" },
                { value: 60, label: "每 1 分钟" },
                { value: 120, label: "每 2 分钟" },
                { value: 300, label: "每 5 分钟" },
              ]}
              onChange={(v) => updateSetting("autoSaveInterval", Number(v))}
            />
          )}
        </PanelSectionBordered>

        {/* Keyboard Shortcuts */}
        <PanelSectionBordered
          title="快捷键"
          icon={
            <svg
              className="w-4 h-4 text-purple-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M6 8h.01" />
              <path d="M10 8h.01" />
              <path d="M14 8h.01" />
              <path d="M18 8h.01" />
              <path d="M8 12h.01" />
              <path d="M12 12h.01" />
              <path d="M16 12h.01" />
              <path d="M7 16h10" />
            </svg>
          }
          defaultOpen={false}
        >
          <div className="space-y-2">
            {[
              { keys: "Space", action: "播放 / 暂停" },
              { keys: "Cmd/Ctrl + Z", action: "撤销" },
              { keys: "Cmd/Ctrl + Shift + Z", action: "重做" },
              { keys: "Delete / Backspace", action: "删除片段" },
              { keys: "Cmd/Ctrl + D", action: "复制片段" },
              { keys: "Cmd/Ctrl + A", action: "全选片段" },
              { keys: "Arrow Left/Right", action: "切换片段" },
              { keys: "Alt + Arrow", action: "微调片段" },
              { keys: "Home / End", action: "跳到开始 / 结尾" },
              { keys: "J / K / L", action: "后退 / 暂停 / 前进" },
            ].map((shortcut) => (
              <div key={shortcut.action} className="flex items-center justify-between py-1">
                <span className="text-xs text-neutral-400">{shortcut.action}</span>
                <kbd className="px-2 py-0.5 bg-[var(--hover-overlay)] border border-[var(--border-default)] rounded text-[10px] text-neutral-300 font-mono">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        </PanelSectionBordered>

        {/* Danger Zone */}
        <PanelSectionBordered
          title="危险操作"
          icon={
            <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          }
          defaultOpen={false}
        >
          <div className="space-y-3">
            <button
              onClick={handleClearAll}
              className="w-full py-2.5 px-4 rounded-lg border border-red-500/50 bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-semibold transition-colors"
            >
              新建项目（清空全部）
            </button>

            <div className="border-t border-[var(--border-default)] pt-3 space-y-3">
              <button
                onClick={handleClearTimeline}
                className="w-full py-2.5 px-4 rounded-lg border border-red-900/30 bg-red-900/10 text-red-400 hover:bg-red-900/20 text-xs font-medium transition-colors"
              >
                清空时间线
              </button>

              <button
                onClick={handleClearLibrary}
                className="w-full py-2.5 px-4 rounded-lg border border-red-900/30 bg-red-900/10 text-red-400 hover:bg-red-900/20 text-xs font-medium transition-colors"
              >
                清空素材库
              </button>

              {hasAutosave() && (
                <button
                  onClick={handleClearAutosave}
                  className="w-full py-2.5 px-4 rounded-lg border border-amber-900/30 bg-amber-900/10 text-amber-400 hover:bg-amber-900/20 text-xs font-medium transition-colors"
                >
                  清除自动保存
                </button>
              )}

              <button
                onClick={handleResetSettings}
                className="w-full py-2.5 px-4 rounded-lg border border-[var(--border-default)] bg-[var(--hover-overlay)] text-neutral-400 hover:bg-[var(--active-overlay)] text-xs font-medium transition-colors"
              >
                恢复默认设置
              </button>
            </div>
          </div>
        </PanelSectionBordered>

        {/* Footer */}
        <div className="mt-auto pt-4 text-center border-t border-[var(--border-default)]">
          <p className="text-[10px] text-neutral-600">SteelMotion 视频剪辑台 v1.0.0</p>
          <p className="text-[10px] text-neutral-700 mt-1">基于 Next.js 与 FFmpeg</p>
        </div>
      </PanelContent>
    </PanelContainer>
  )
})

SettingsPanel.displayName = "SettingsPanel"
