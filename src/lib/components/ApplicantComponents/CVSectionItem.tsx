import { useEffect, useState } from "react";
import Markdown from "react-markdown";

export default function CVSectionItem(props: any) {
  const { data, saveCV } = props;

  const [isEditing, setIsEditing] = useState(false);

  const [content, setContent] = useState(data.content);

  useEffect(() => {
    setContent(data.content);
  }, [data]);

  return (
    <>
      <div className="card shadow-1">
        <div className="card-header">
          <h3 className="mb-0 mr-auto">
            <i className="la la-edit text-primary mr-2" />{" "}
            <span className="cv-section-name">{data.name}</span>
          </h3>

          {props.editable && (
            <button
              className={`btn btn-muted ${
                isEditing ? "btn-primary editing-now" : ""
              }`}
              onClick={() => {
                if (isEditing) {
                  setTimeout(() => {
                    saveCV();
                  }, 300);
                }

                setIsEditing(!isEditing);
              }}
            >
              <i className="la la-edit mr-2" />{" "}
              {isEditing ? "Done Editing" : "Edit"}
            </button>
          )}
        </div>

        <div className="card-body">
          {isEditing ? (
            <div className="markdown-body">
              <textarea
                className="form-control"
                defaultValue={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your content here"
              />
            </div>
          ) : (
            <div className="markdown-body cv-section-content">
              <Markdown>{content ? content : data.content}</Markdown>
            </div>
          )}

          {/* pure markdown content is kept here */}
          <textarea
            className="form-control d-none markdown-cv-content"
            value={content}
            onChange={(e) => {}}
            placeholder="Enter your content here"
          />

          {!data.content && !isEditing && !content && (
            <div className="markdown-body cv-section-content">
              <p>
                No content found. Click "Edit" to add content for this section.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
