// src/instant.tsx
import { closeMainWindow, showToast, Toast } from "@raycast/api";
import { get, hash, screenshot, store } from "./utils";
import { preamble } from "./main";

export default async function Command() {
  await closeMainWindow();
  const data = await get();
  if (!data) {
    showToast({ style: Toast.Style.Failure, title: "Error: No browser data found" });
    return;
  }
  const {directory, captureContent, captureScreenshot} = preamble();
  const instant = true;
  const {url, title} = data;
  const name = hash({url, title}, instant);
  store(directory, data, name, captureContent);
  if (captureScreenshot) {
    screenshot(directory, name);
  }
  showToast({ style: Toast.Style.Success, title: "Clipped successfully!" });
  return;
}
