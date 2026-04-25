const EmptyState = ({
  title,
  message,
  actionText,
  onAction,
}: {
  title?: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}) => (
  <div className="empty-state">
    {title && <p className="empty-state-title">{title}</p>}
    <p className="empty-state-msg">{message}</p>
    {actionText && onAction && (
      <button className="btn btn-primary" onClick={onAction} style={{ marginTop: '1rem' }}>
        {actionText}
      </button>
    )}
  </div>
);

export default EmptyState;
