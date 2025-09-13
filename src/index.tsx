import { usePromise } from "@raycast/utils";
import {
  Action,
  ActionPanel,
  Form,
  getPreferenceValues,
} from "@raycast/api";
import os from "os";
import * as path from "path";

import { get } from "./utils";
import { formHook } from "./main";


const home = os.homedir();
const preferences = getPreferenceValues<Preferences>();
const { clipDirectory, captureContent, captureScreenshot } = preferences;
const directory = path.join(home, clipDirectory);






export default function Command() {
  const { data, isLoading } = usePromise(() => get(), []);

  const { handleSubmit, itemProps } = formHook(directory, captureContent, captureScreenshot, data  )

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Clip" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea title="Comment" placeholder="Add any comments..." autoFocus {...itemProps.comment} />
      <Form.Separator />
      <Form.Checkbox label="Include Page Content (as Markdown)" {...itemProps.captureContent} />
      <Form.Checkbox label="Include Screenshot" {...itemProps.captureScreenshot} />
      <Form.Separator />
      <Form.Description title="Title" text={data?.title || "Loading..."} />
      <Form.Description title="URL" text={data?.url || "Loading..."} />
    </Form>
  );
}