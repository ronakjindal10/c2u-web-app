// This is the Error component that shows an error message
import React from "react";
import { Alert } from "react-bootstrap"; // This is a third-party library that provides an alert component

function Error({ message }) {
  return (
    <div className="Error">
      <Alert variant="danger"> {/*Show an Alert element with variant attribute as "danger"*/}
        {message} {/*Show the message prop as the text content of the alert*/}
      </Alert>
    </div>
  );
}

export default Error;
