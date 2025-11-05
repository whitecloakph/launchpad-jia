"use client";

import React, { useRef, useEffect } from "react";

export default function CandidateRichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    // Get plain text from clipboard
    const text = e.clipboardData.getData("text/plain");

    // Insert the plain text at cursor position
    document.execCommand("insertText", false, text);

    // Update the state
    handleContentChange();
  };

  // Handle placeholder for contenteditable div
  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      const handleFocus = () => {
        if (editor.innerHTML === "" || editor.innerHTML === "<br>") {
          editor.innerHTML = "";
        }
      };

      const handleBlur = () => {
        if (editor.innerHTML === "" || editor.innerHTML === "<br>") {
          editor.innerHTML = "";
        }
      };

      editor.addEventListener("focus", handleFocus);
      editor.addEventListener("blur", handleBlur);

      return () => {
        editor.removeEventListener("focus", handleFocus);
        editor.removeEventListener("blur", handleBlur);
      };
    }
  }, []);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <>
      <div
        ref={editorRef}
        contentEditable={true}
        className="form-control"
        style={{
          height: "200px",
          overflowY: "auto",
          border: "none",
          borderRadius: "0",
          padding: "12px",
          lineHeight: "1.5",
          position: "relative",
          outline: "none",
        }}
        onInput={handleContentChange}
        onBlur={handleContentChange}
        onPaste={handlePaste}
        data-placeholder="Enter email body..."
      ></div>

      {/* Rich Text Editor Toolbar */}
      <div
        style={{
          border: "1px solid #E9EAEB",
          borderRadius: "0 0 4px 4px",
          backgroundColor: "#FFFFFF",
          display: "flex",
          gap: "4px",
          flexWrap: "wrap",
          height: "fit-content",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => formatText("bold")}
          title="Bold"
          style={{
            height: "auto",
            display: "grid",
            fontSize: 20,
            color: "#535862",
          }}
        >
          <i
            className="la la-bold"
            style={{
              margin: "auto",
            }}
          ></i>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => formatText("italic")}
          title="Italic"
          style={{
            height: "fit-content",
            display: "grid",
            fontSize: 20,
            color: "#535862",
          }}
        >
          <i className="la la-italic"></i>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => formatText("underline")}
          title="Underline"
          style={{
            height: "fit-content",
            display: "grid",
            fontSize: 20,
            color: "#535862",
          }}
        >
          <i className="la la-underline"></i>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => formatText("insertUnorderedList")}
          title="Bullet List"
          style={{
            height: "fit-content",
            display: "grid",
            fontSize: 20,
            color: "#535862",
          }}
        >
          <i className="la la-list-ul"></i>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => formatText("insertOrderedList")}
          title="Numbered List"
          style={{
            height: "fit-content",
            display: "grid",
            fontSize: 20,
            color: "#535862",
          }}
        >
          <i className="la la-list-ol"></i>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => formatText("createLink")}
          title="Insert Link"
          style={{ padding: "4px 4px", fontSize: 20, color: "#535862" }}
        >
          <i className="la la-link"></i>
        </button>
      </div>
    </>
  );
}
