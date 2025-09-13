import { Extd, Full, hash, mkdir, screenshot, Spec, store } from "./utils";
import { useForm } from "@raycast/utils";
import { closeMainWindow, showToast, Toast } from "@raycast/api";

type FormValues = {
  comment: string;
  captureContent: boolean;
  captureScreenshot: boolean;
};

const mainHook () 

const formHook = (directory: string, captureContent: boolean, captureScreenshot: boolean, data: Extd | undefined) => {
  const { handleSubmit, itemProps } = useForm<FormValues>({
    onSubmit(values) {
      if (!data) {
        showToast({ style: Toast.Style.Failure, title: "Error: No browser data found" });
        return;
      }
      const toHash: Spec = {
        title: data.title,
        url: data.url,
        comment: values.comment,
      };
      const clipName = hash(toHash);

      mkdir(directory);
      const toStore: Full = {
        ...data,
        comment: values.comment,
      };
      store(directory, toStore, clipName, values.captureContent);

      if (values.captureScreenshot) {
        closeMainWindow();
        screenshot(directory, clipName);
      }
      showToast({ style: Toast.Style.Success, title: "Clipped successfully!" });
    },
    initialValues: {
      comment: "",
      captureContent,
      captureScreenshot,
    },
  });
  return { handleSubmit, itemProps };
}

export {formHook}