import { Extd, Full, get, hash, mkdir, screenshot, Spec, store } from "./utils";
import { useForm, usePromise } from "@raycast/utils";
import { closeMainWindow, getPreferenceValues, PopToRootType, showToast, Toast } from "@raycast/api";
import os from "os";
import path from "path";

type FormValues = {
  comment: string;
  captureContent: boolean;
  captureScreenshot: boolean;
};

const mainHook = () => {
  const home = os.homedir();
  const preferences = getPreferenceValues<Preferences>();
  const { clipDirectory, captureContent, captureScreenshot } = preferences;
  const directory = path.join(home, clipDirectory);

  const { data, isLoading } = usePromise(() => get(), []);

  const { handleSubmit, itemProps } = formHook(directory, captureContent, captureScreenshot, data);
  return { data, isLoading, itemProps, handleSubmit };
};

const formHook = (directory: string, captureContent: boolean, captureScreenshot: boolean, data: Extd | undefined) => {
  const { handleSubmit, itemProps } = useForm<FormValues>({
    onSubmit(values) {
      if (!data) {
        showToast({ style: Toast.Style.Failure, title: "Error: No browser data found" });
        return;
      }

      const timeStamp = Date.now();

      const toHash: Spec = {
        title: data.title,
        url: data.url,
        comment: values.comment,
      };
      const clipName = hash(toHash);

      mkdir(directory);
      const toStore: Full = {
        ...data,
        timeStamp: timeStamp,
        comment: values.comment,
      };
      store(directory, toStore, clipName, values.captureContent);

      if (values.captureScreenshot) {
        closeMainWindow({ popToRootType: PopToRootType.Immediate });
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
};

export { mainHook };