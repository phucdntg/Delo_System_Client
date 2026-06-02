import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import InternalServerErrorPage from "../../../shared/pages/InternalServerErrorPage";

function ErrorFallback({ error, resetErrorBoundary, errorInfo }) {
  return <InternalServerErrorPage error={error} errorInfo={errorInfo} />;
}

export default function ErrorBoundary({ children }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error("Route error:", error, info);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
