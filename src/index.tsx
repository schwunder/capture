import {
  Action,
  ActionPanel,
  BrowserExtension,
  closeMainWindow,
  Form,
  getPreferenceValues,
  showToast,
  Toast,
} from "@raycast/api";
import { runAppleScript, useForm, usePromise } from "@raycast/utils";
import { useEffect } from "react";
import fs from "node:fs";
import os from "os";
import * as path from "path";

// Get the user's home directory
const homeDir = os.homedir();

// Specify the path to the new directory relative to the home directory
const newDirPath = path.join(homeDir, getPreferenceValues<Preferences>().clipDirectory);

try {
  // Use fs.mkdirSync with the full, resolved path
  fs.mkdirSync(newDirPath, { recursive: true });
  console.log(`Directory created at: ${newDirPath}`);
} catch (error) {
  // Handle potential errors, such as the directory already existing
  if (error.code === "EEXIST") {
    console.log(`Directory already exists at: ${newDirPath}`);
  } else {
    console.error("Error creating directory:", error);
  }
}

interface CaptureData {
  url: string;
  title: string;
  includeContent: boolean;
  includeScreenshot: boolean;
  comment: string;
}

const getBrowserData = async () => {
  try {
    const text = await BrowserExtension.getContent({ format: "markdown" });
    const tabs = await BrowserExtension.getTabs();
    const activeTab = tabs.find((tab) => tab.active);

    return {
      text,
      title: activeTab?.title,
      url: activeTab?.url,
    };
  } catch (error) {
    console.error("Failed to get browser data:", error);
    await showToast({
      style: Toast.Style.Failure,
      title: "Couldn't Get Browser Data",
      message: "Make sure the Raycast browser extension is installed and has permissions.",
    });
    return { text: "", title: "", url: "" };
  }
};

// /Users/alien/Browsercaptures
const storeBrowserData = async (data, content) => {
  try {
    fs.writeFileSync(`${newDirPath}/baseData.json`, JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }
  if (content) {
    try {
      fs.writeFileSync(`${newDirPath}/content.md`, content);
    } catch (error) {
      console.error(error);
    }
  }
};

const storeScreenshot = async () => {
  await closeMainWindow();
  const script = `do shell script "screencapture ${newDirPath}/screenshot.png"`;
  runAppleScript(script);
};

export default function Command() {
  const { data, isLoading } = usePromise(getBrowserData);
  const { handleSubmit, itemProps, reset } = useForm<CaptureData>({
    onSubmit(values) {
      console.log("Captured values:", values);
      storeBrowserData(values, data?.text);
      if (values.includeScreenshot) {
        storeScreenshot();
      }
      showToast({
        style: Toast.Style.Success,
        title: "Capture Successful",
        message: "Your data has been captured.",
      });
    },
    initialValues: {
      url: "",
      title: "",
      includeContent: false,
      includeScreenshot: true,
      comment: "",
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        url: data.url || "",
        title: data.title || "",
        includeContent: false,
        includeScreenshot: true,
        comment: "",
      });
    }
  }, [data, reset]);

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Capture" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea title="Comment" placeholder="Add any comments..." autoFocus {...itemProps.comment} />
      <Form.Checkbox label="Include Page Content?" {...itemProps.includeContent} />
      <Form.Checkbox label="Include Screenshot?" {...itemProps.includeScreenshot} />
      <Form.TextField title="Title" placeholder="Page Title" {...itemProps.title} />
      <Form.TextField title="URL" placeholder="https://example.com" {...itemProps.url} />
    </Form>
  );
}