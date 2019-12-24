import React, { useCallback, useState } from "react";
import styled, { css } from "astroturf";
import { useDropzone } from "react-dropzone";
import mediatags from "jsmediatags";

import { TagType } from "jsmediatags/types";

interface FileWithPath extends File {
  path: string;
}

const Dotted = styled.div`
  width: 500px;
  max-width: 90vmin;
  height: 500px;
  max-height: 90vmin;
  border: 2px dashed black;
  overflow-y: auto;
  padding: 10px;
`;

type FileMaybeTag = { file: FileWithPath; tag?: TagType };

const Dropzone: React.FC = () => {
  const [files, setFiles] = useState<FileMaybeTag[] | null>(null);
  const onDrop = useCallback(
    async (acceptedFiles: FileWithPath[]) => {
      const filesWithTags = await Promise.all(
        acceptedFiles.map<Promise<FileMaybeTag>>(file => {
          if (!file.type.startsWith("audio/")) {
            return Promise.resolve({ file });
          }
          return new Promise((res, rej) =>
            mediatags.read(file, {
              onSuccess(tag) {
                res({ file, tag });
                console.log(tag);
              },
              onError(error) {
                rej(error);
              }
            })
          );
        })
      );

      filesWithTags.sort((a, b) => {
        if (a.tag && !b.tag) return -1;
        if (b.tag && !a.tag) return 1;
        if (a.tag && b.tag) {
          if (a.tag.tags.track && b.tag.tags.track) {
            return a.tag.tags.track < b.tag.tags.track ? -1 : 1;
          }
        }
        return a.file.path < b.file.path ? -1 : 1;
      });

      setFiles(filesWithTags);
    },
    [setFiles]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDrop as any // doesn't like files with path prop?
  });

  return (
    <Dotted {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : files ? (
        files.map(({ file, tag }, i) => (
          <FileData file={file} tag={tag} key={i} />
        ))
      ) : (
        <p>Drag and drop some files here, or click to select files</p>
      )}
    </Dotted>
  );
};

const { entry, row, icon, text } = css`
  .entry + .entry {
    margin-top: 1em;
  }

  .row {
    display: flex;
    align-items: center;
  }

  .row + .row {
    margin-top: 1em;
  }

  .icon {
    width: 25px;
    height: 25px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    color: #eee;
    background-color: black;
    /* border: 1px solid black; */
    border-radius: 2px;
    padding: 3px;
  }

  .text {
    margin-left: 1em;
  }
`;

const FileData: React.FC<FileMaybeTag> = ({ file, tag }) => {
  return (
    <div className={entry}>
      <div className={row}>
        <span className={icon}>
          {file.type.startsWith("audio/") ? "♫" : " "}
        </span>
        <code className={text}>{file.path}</code>
      </div>
      {/* {false && (
        <div className={row}>
          {Object.entries(tag.tags)
            .filter(t => t[0] !== "picture")
            .map(([k, v]) => (
              <div key={k}>
                [{k}]: {JSON.stringify(v)}
              </div>
            ))}
        </div>
      )} */}
    </div>
  );
};

export default Dropzone;
