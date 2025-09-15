import { Action, ActionPanel, Form } from "@raycast/api";
import { useClip } from "./main";

export default function Command() {
  const { data, isLoading, itemProps, handleSubmit } = useClip();
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
      <Form.Checkbox label="Include Page Content (as Markdown)" {...itemProps.isContent} />
      <Form.Checkbox label="Include Screenshot" {...itemProps.isScreenshot} />
      <Form.Separator />
      <Form.Description title="Title" text={data?.title || "Loading..."} />
      <Form.Description title="URL" text={data?.url || "Loading..."} />
    </Form>
  );
}