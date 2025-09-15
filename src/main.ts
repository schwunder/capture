import {
  BrowserExtension,
  closeMainWindow,
  getPreferenceValues,
  PopToRootType,
  showToast,
  Toast,
} from "@raycast/api";
import { runAppleScript, useForm, usePromise } from "@raycast/utils";
import fs from "node:fs";
import os from "os";
import path from "path";

// Types
export type Page = {
  title: string;
  url: string;
  content: string;
};

export type Config = {
  comment?: string;
  isContent: boolean;
  isScreenshot: boolean;
};

// Error Handling
export const onError = (err: unknown) => {
  if (err instanceof Error) {
    let title = "Clipping Failed";
    const message = err.message;

    if ("code" in err) {
      if (err.code === "EEXIST") {
        return;
      }
      title = "File System Error";
    } else if (message === "could not get tabs") {
      title = "Data Error";
    }

    showToast({ style: Toast.Style.Failure, title: title, message: message });
  } else {
    showToast({ style: Toast.Style.Failure, title: "An Unknown Error Occurred" });
  }
};

export const fetch = async (): Promise<Page> => {
  const tabs = await BrowserExtension.getTabs();
  const tab = tabs.find((t) => t.active);

  if (!tab?.url) {
    throw new Error("could not get tabs");
  }

  const content = await BrowserExtension.getContent({ format: "markdown" });

  return {
    title: tab.title ?? "Untitled",
    url: tab.url,
    content: content,
  };
};

// Main React Hook
export const useClip = () => {
  const { directory, isContent, isScreenshot } = getPreferenceValues<Preferences>();
  const dir = path.join(os.homedir(), directory);
  const { data, isLoading, error } = usePromise(() => fetch());
  const { handleSubmit, itemProps } = useForm<Config>({
    onSubmit(values) {
      if (error) {
        onError(error);
        return;      }
      try {
        const {url ,title, content} = data!;
        const {comment, isContent, isScreenshot} = values;
        const timeStamp = Date.now();
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(`${dir}/${timeStamp}.json`, JSON.stringify({timeStamp, url, title, comment}, null, 2));
        if (isContent && content) {
          fs.writeFileSync(`${dir}/${timeStamp}.md`, content);
        }
        if (isScreenshot) {
          closeMainWindow({ popToRootType: PopToRootType.Immediate });
          const script = `do shell script "screencapture ${dir}/${timeStamp}.png"`;
          runAppleScript(script);
        }
        showToast({ style: Toast.Style.Success, title: "clipped." });
      } catch (err) {
        onError(err);
      }
    },
    initialValues: {
      comment: "",
      isContent: isContent,
      isScreenshot: isScreenshot,
    },
  });

  return { data, isLoading, itemProps, handleSubmit };
};