import { Detail, BrowserExtension} from "@raycast/api";
import { usePromise } from "@raycast/utils";

export default function Command() {
  const { data } = usePromise(
    async() => {
      const title = await BrowserExtension.getContent({ format: "text", cssSelector: "title" });
      const text = await BrowserExtension.getContent({ format: "markdown" });
      const tabs = await BrowserExtension.getTabs()

      return {
        title: title,
        text: text,
        tabs: tabs,
      };
    }
  );

  if (!data) return null;
  const newTitle = data.title;
  const text = data.text;
  const allUrls = data.tabs.reduce((acc, tab) => {
    return acc + tab.url;
  }, '')
  if (!data.tabs[0]) return null;
  const active = data.tabs[0].active;
  const id = data.tabs[0].id;
  const url = data.tabs[0].url;
  const favicon = data.tabs[0].favicon;
  const title = data.tabs[0].title;
  const markdown = `${newTitle}, ${text} ${active}, ${id}, ${url}, ${favicon}, ${title}, ${allUrls}`;
  return <Detail markdown = {markdown} />;
}
