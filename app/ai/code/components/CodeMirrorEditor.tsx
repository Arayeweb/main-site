"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";

function langForPath(path: string) {
  if (path.endsWith(".css")) return css();
  if (path.endsWith(".json")) return json();
  return javascript({ jsx: true, typescript: path.endsWith(".tsx") || path.endsWith(".ts") });
}

export default function CodeMirrorEditor({
  path,
  value,
  onChange,
}: {
  path: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <CodeMirror
      value={value}
      height="100%"
      className="ar-code-cm"
      dir="ltr"
      extensions={[langForPath(path)]}
      onChange={onChange}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
        bracketMatching: true,
      }}
    />
  );
}
