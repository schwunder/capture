import { BrowserExtension, Action, ActionPanel, Form, showToast, Toast } from "@raycast/api";
import { usePromise, useForm } from "@raycast/utils";
import { useEffect } from "react";

interface CaptureData {
  url: string;
  title: string;
  includeContent: boolean;
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

export default function Command() {
  const { data, isLoading } = usePromise(getBrowserData);

  const { handleSubmit, itemProps, reset } = useForm<CaptureData>({
    onSubmit(values) {
      console.log("Captured values:", values);
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
      comment: "",
    },
  });

  // This effect runs when the `data` from `usePromise` is successfully fetched.
  // It uses the `reset` function from `useForm` to update the form's state
  // with the fetched title and URL, without conflicting with user input.
  useEffect(() => {
    if (data) {
      reset({
        url: data.url || "",
        title: data.title || "",
        includeContent: false, // You can decide to keep or reset these
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
      <Form.Checkbox label="Include Page Content?" {...itemProps.includeContent}
      />
      <Form.TextField
        title="Title"
        placeholder="Page Title"
        {...itemProps.title}
      />
      <Form.TextField
        title="URL"
        placeholder="https://example.com"
        {...itemProps.url}
      />
      <Form.TextArea
        title="Comment"
        placeholder="Add any comments..."
        {...itemProps.comment}
      />
    </Form>
  );
}

