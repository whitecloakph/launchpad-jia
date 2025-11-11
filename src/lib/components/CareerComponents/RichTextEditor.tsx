"use client";

import React, { useRef, useEffect } from "react";

export default function RichTextEditor({setText, text}) {
    const descriptionEditorRef = useRef(null);

    const formatText = (command, value = null) => {
        document.execCommand(command, false, value);
        descriptionEditorRef.current?.focus();
      };
  
      const handleDescriptionChange = () => {
        if (descriptionEditorRef.current) {
          setText(descriptionEditorRef.current.innerHTML);
        }
      };

      const handlePaste = (e) => {
        e.preventDefault();
        
        // Get plain text from clipboard
        const text = e.clipboardData.getData('text/plain');
        
        // Insert the plain text at cursor position
        document.execCommand('insertText', false, text);
        
        // Update the state
        handleDescriptionChange();
      };
  
      // Handle placeholder for contenteditable div
      useEffect(() => {
        const editor = descriptionEditorRef.current;
        if (editor) {
          const handleFocus = () => {
            if (editor.innerHTML === '' || editor.innerHTML === '<br>') {
              editor.innerHTML = '';
            }
          };
          
          const handleBlur = () => {
            if (editor.innerHTML === '' || editor.innerHTML === '<br>') {
              editor.innerHTML = '';
            }
          };
  
          editor.addEventListener('focus', handleFocus);
          editor.addEventListener('blur', handleBlur);
          
          return () => {
            editor.removeEventListener('focus', handleFocus);
            editor.removeEventListener('blur', handleBlur);
          };
        }
      }, []);
  
  
      useEffect(() => {
        if (descriptionEditorRef.current && !descriptionEditorRef.current.innerHTML && text) {
          descriptionEditorRef.current.innerHTML = text;
        }
      }, []);

      return (
        <>
        <div
          ref={descriptionEditorRef}
          contentEditable={true}
          className="form-control"
          style={{
            height: "300px",
            overflowY: "auto",
            borderTopLeftRadius: "0",
            borderTopRightRadius: "0",
            padding: "12px",
            lineHeight: "1.5",
            position: "relative"
          }}
          onInput={handleDescriptionChange}
          onBlur={handleDescriptionChange}
          onPaste={handlePaste}
          data-placeholder="Enter job description..."
        ></div>
        {/* Rich Text Editor Toolbar */}
        <div style={{ 
          border: "1px solid #E9EAEB",
          borderRadius: "0 0 4px 4px",
          backgroundColor: "#FFFFFF",
          display: "flex",
          gap: "4px",
          flexWrap: "wrap",
          height: "48px"
        }}>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => formatText('bold')}
            title="Bold"
            style={{ padding: "4px 8px", fontSize: 20, color: "#535862" }}
          >
            <i className="la la-bold"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => formatText('italic')}
            title="Italic"
            style={{ padding: "4px 8px", fontSize: 20, color: "#535862" }}
          >
            <i className="la la-italic"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => formatText('underline')}
            title="Underline"
            style={{ padding: "4px 8px", fontSize: 20, color: "#535862" }}
          >
            <i className="la la-underline"></i>
          </button>
          {/* Strikethrough */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => formatText('strikeThrough')}
            title="Strikethrough"
            style={{ padding: "4px 8px", fontSize: 20, color: "#535862" }}
          >
            <i className="la la-strikethrough"></i>
          </button>
          
          <div style={{ width: "1px", backgroundColor: "#D5D7DA", margin: "0 4px" }}></div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => formatText('insertOrderedList')}
            title="Numbered List"
            style={{ padding: "4px 8px", fontSize: 20, color: "#535862" }}
          >
            <i className="la la-list-ol"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => formatText('insertUnorderedList')}
            title="Bullet List"
            style={{ padding: "4px 8px", fontSize: 20, color: "#535862" }}
          >
            <i className="la la-list-ul"></i>
          </button>
          
        </div>
        <style jsx>{`
          [data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #6c757d;
            pointer-events: none;
            position: absolute;
            top: 12px;
            left: 12px;
          }
        `}</style>
        </>
      )
}