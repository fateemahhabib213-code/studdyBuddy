import { useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

/**
 * The backend only accepts raw notes text in the generate request — there
 * is no separate file-upload endpoint. So this component reads a plain
 * text file directly in the browser and hands its contents to the parent
 * as notes text. Only .txt is genuinely supported; anything else is
 * rejected with a clear message rather than silently mishandled.
 */
function FileUpload({ onTextExtracted }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);

  function handleFile(file) {
    setError(null);
    if (!file) return;

    const isPlainText = file.type === "text/plain" || file.name.endsWith(".txt");
    if (!isPlainText) {
      setError("Only .txt files are supported right now.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileName(file.name);
      onTextExtracted(String(reader.result || ""));
    };
    reader.onerror = () => setError("Couldn't read that file. Please try again.");
    reader.readAsText(file);
  }

  function clearFile() {
    setFileName(null);
    onTextExtracted("");
    if (inputRef.current) inputRef.current.value = "";
  }

  if (fileName) {
    return (
      <div className="upload-filename">
        <FileText size={16} />
        {fileName}
        <button
          type="button"
          onClick={clearFile}
          aria-label="Remove uploaded file"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            marginLeft: 4,
            color: "inherit",
          }}
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        className={"upload-dropzone" + (dragging ? " dragging" : "")}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <div className="upload-dropzone-icon">
          <UploadCloud size={22} strokeWidth={2} />
        </div>
        <span className="upload-dropzone-title">
          Drag a file here, or click to browse
        </span>
        <span className="upload-dropzone-hint">Supports .txt files</span>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,text/plain"
          onChange={(e) => handleFile(e.target.files?.[0])}
          style={{ display: "none" }}
        />
      </div>
      {error && (
        <p style={{ color: "var(--color-danger)", fontSize: "var(--text-sm)", marginTop: "var(--space-2)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default FileUpload;
