import { closeMainWindow, getPreferenceValues, PopToRootType, showToast, Toast } from "@raycast/api";
import {
  onError,
  fetch,
} from "./main";
import fs from "node:fs";
import { runAppleScript } from "@raycast/utils";
import path from "path";
import os from "os";

export default async function Command() {
  await closeMainWindow();
  try {
    const { directory, isContent, isScreenshot } = getPreferenceValues<Preferences>();
    const dir = path.join(os.homedir(), directory);
    const {content, url, title} = await fetch();
    const timeStamp = Date.now();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/${timeStamp}.json`, JSON.stringify({timeStamp, url, title}, null, 2));
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
}