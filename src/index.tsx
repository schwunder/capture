import {
  Action,
  ActionPanel,
  Form,
} from "@raycast/api";
import { mainHook } from "./main";

export default function Command() {
const {data, isLoading, itemProps, handleSubmit} = mainHook();
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