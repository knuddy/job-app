import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { FallbackProps } from 'react-error-boundary';

const ErrorScreen = (props: Partial<FallbackProps>) => {
  let routerError;
  try {
    routerError = useRouteError();
  } catch (e) {
    // If we are outside the router, useRouteError will throw.
    // We catch it here and keep routerError as null.
  }
  const displayError = props.error || routerError;

  let message;

  if (isRouteErrorResponse(displayError)) {
    // Handles the 4xx/5xx
    return (
      <div className="container h-100 d-flex justify-content-center align-items-center alert alert-secondary mb-0 rounded-0">
        <div className="text-center">
          <h2 className="fw-semibold display-2 mb-0">{displayError.status}</h2>
          <p className="display-6 mb-0">{displayError.statusText}</p>
        </div>
      </div>
    )
  } else if (displayError instanceof Error) {
    message = displayError.message;
  } else {
    message = "An unknown error occurred";
  }

  return (
    <div className="container h-100 d-flex justify-content-center align-items-center alert alert-danger mb-0 rounded-0">
      <div className="w-100 d-flex flex-column">
        <h4 className="fw-semibold mb-2 display-4 text-center">An Error Occurred</h4>
        <div className="text-center mb-4">
          <p className="mb-0">Try refreshing your browser. If problem persists get in contact.</p>
        </div>
        <div className="border rounded border-dark py-3">
          <h4 className="px-3">Message</h4>
          <hr/>
          <p className="px-3 m-0">{message}</p>
        </div>


      </div>
    </div>
  );
}

export default ErrorScreen;