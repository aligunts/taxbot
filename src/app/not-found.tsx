export default function NotFound() {
  return (
    <div className="error-container">
      <div className="error-content">
        <h2 className="error-title">404 - Page Not Found</h2>
        <p className="error-message">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <a href="/" className="error-button">
          Return to Home
        </a>
      </div>
    </div>
  );
}
