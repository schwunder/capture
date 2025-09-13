
import { runAppleScript } from "@raycast/utils";
import {
  BrowserExtension,
} from "@raycast/api";

import fs from "node:fs";
import { createHash } from 'crypto';

type Base = {
  title: string;
  url: string;
};

type Extd = Base & {
  content: string;
};

type Spec = Base & {
  comment: string;
};

type Full = Extd & Spec;

const mkdir = (path: string) => {
  try {
    fs.mkdirSync(path, { recursive: true });
    console.log(`Directory at: ${path}`);
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code !== "EEXIST") {
      console.error("Error creating:", error);
      throw error;
    }
  }
};

const hash = (data: Spec | Base, instant: boolean) => {
  let title, url, comment, combo;
  if (instant) {
    ({ title, url } = data as Base);
    combo = `${title}\x00${url}`;
  } else {
    ({ title, url, comment } = data as Spec);
    combo = `${title}\x00${url}\x00${comment}`;
  }
  const hash = createHash('sha256');
  hash.update(combo);
  return hash.digest('hex');
}

const screenshot =  (path: string, name: string) => {
  const script = `do shell script "screencapture ${path}/${name}.png"`;
  runAppleScript(script);
};

const store = (path: string, clip: Full | Extd, name: string, contentFlag: boolean) => {
  const {content, ...rest} = clip;
  const timeStamp = Date.now();
  try {
      fs.writeFileSync(`${path}/${name}.json`, JSON.stringify({...rest, timeStamp}));
  } catch (error) {
    console.error(error);
  }
  if (contentFlag) {
    try {
      fs.writeFileSync(`${path}/${name}.md`, content);
    } catch (error) {
      console.error(error);
    }
  }
};

const get = async (): Promise<Extd> => {
  const tabsPromise = BrowserExtension.getTabs();
  const contentPromise = BrowserExtension.getContent({ format: "markdown" });

  const [tabs, content] = await Promise.all([tabsPromise, contentPromise]);

  const tab = tabs.find((t) => t.active);
  if (!tab?.url) {
    const error = new Error("No Active Tab");
    error.name = "NoActiveTab";
    throw error;
  }

  return {
    title: tab.title ?? "Untitled",
    url: tab.url,
    content: content, };
};




export { get, store, screenshot, hash, mkdir };
export type { Full, Spec, Base, Extd };
