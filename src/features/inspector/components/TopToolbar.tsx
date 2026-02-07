export function TopToolbar({
  theme,
  autoFitText,
  isLoading,
  canUndo,
  canRedo,
  canGroup,
  onUpload,
  onToggleTheme,
  onToggleAutoFitText,
  onStartOcr,
  onUndo,
  onRedo,
  onGroup,
  onExportImage,
}: {
  theme: 'light' | 'dark'
  autoFitText: boolean
  isLoading: boolean
  canUndo: boolean
  canRedo: boolean
  canGroup: boolean
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onToggleTheme: () => void
  onToggleAutoFitText: () => void
  onStartOcr: () => void
  onUndo: () => void
  onRedo: () => void
  onGroup: () => void
  onExportImage: () => void
}) {
  return (
    <header className="ed-topbar">
      <div className="ed-topbar-main">
        <div className="ed-topbar-group">
          <button className={`ed-btn ${autoFitText ? 'is-active' : ''}`} onClick={onToggleAutoFitText}>
            文字自适应：{autoFitText ? '开' : '关'}
          </button>
          <label className="ed-btn">
            上传图片
            <input className="ed-upload-input" type="file" accept="image/*" onChange={onUpload} />
          </label>
          <button className="ed-btn ed-btn-primary" onClick={onStartOcr}>
            {isLoading ? 'OCR 识别中...' : '开始 OCR'}
          </button>
          <button className="ed-btn" onClick={onExportImage}>导出图片</button>
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
