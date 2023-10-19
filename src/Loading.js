// This is the Loading component that shows a loading spinner
import React from "react";
import { Spinner } from "react-bootstrap"; // This is a third-party library that provides a spinner component

function Loading() {
  return (
    <div className="Loading">
      <Spinner animation="border" role="status"> {/* Show a Spinner element with animation attribute as "border" and role attribute as "status"*/}
        <span className="sr-only">Loading...</span> {/* Show a span element with class name "sr-only" and text content as "Loading..."*/}
      </Spinner>
    </div>
  );
}

export default Loading;
