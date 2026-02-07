export function TopToolbar({
  theme,
  isLoading,
  canUndo,
  canRedo,
  canGroup,
  onUpload,
  onToggleTheme,
  onStartOcr,
  onUndo,
  onRedo,
  onGroup,
}: {
  theme: 'light' | 'dark'
  isLoading: boolean
  canUndo: boolean
  canRedo: boolean
  canGroup: boolean
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onToggleTheme: () => void
  onStartOcr: () => void
  onUndo: () => void
  onRedo: () => void
  onGroup: () => void
}) {
  return (
    <header className="ed-topbar">
      <div className="ed-topbar-main">
        <div className="ed-topbar-group">
          <label className="ed-btn">
            上传图片
            <input className="ed-upload-input" type="file" accept="image/*" onChange={onUpload} />
          </label>
          <button className="ed-btn ed-btn-primary" onClick={onStartOcr}>
            {isLoading ? 'OCR 识别中...' : '开始 OCR'}
          </button>
        </div>

        <div className="ed-topbar-group">
          <button className="ed-btn" onClick={onUndo} disabled={!canUndo}>撤销</button>
          <button className="ed-btn" onClick={onRedo} disabled={!canRedo}>重做</button>
          <button className="ed-btn" onClick={onGroup} disabled={!canGroup}>编组</button>
        </div>

        <div className="ed-topbar-group">
          <button className="ed-btn" onClick={onToggleTheme}>
            {theme === 'light' ? '深色模式' : '浅色模式'}
          </button>
        </div>
      </div>
    </header>
  )
}
