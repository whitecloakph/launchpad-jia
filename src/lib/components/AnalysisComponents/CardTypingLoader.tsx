import { useEffect, useState } from "react";
import { TypeAnimation } from "react-type-animation";

export default function (props) {
  const { title, notesArray } = props;

  const [notes, setNotes] = useState(null);

  useEffect(() => {
    if (notesArray && notesArray.length !== 0) {
      setNotes(notesArray);
    }
  }, [notesArray]);

  return (
    <>
      {title && (
        <div className="typer-loader">
          <i className="la la-circle-notch text-primary spin la-2x" />
          <div className="info-text">
            <h2>{title}</h2>
            {notes && (
              <TypeAnimation
                sequence={notes}
                wrapper="span"
                speed={50}
                style={{ fontSize: "0.9em", display: "inline-block" }}
                repeat={Infinity}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
