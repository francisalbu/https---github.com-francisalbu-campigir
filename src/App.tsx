import { PageShell } from "@/sections/PageShell";
import { I18nProvider } from "@/i18n/i18n";

export const App = () => {
  return (
    <I18nProvider>
      <body className="accent-auto bg-rose-900 box-border caret-transparent text-white block text-[16.0982px] not-italic normal-nums font-medium tracking-[normal] leading-[24.1473px] list-outside list-disc min-h-full outline-[3px] overscroll-x-none overscroll-y-none pointer-events-auto text-start no-underline indent-[0px] normal-case align-bottom visible border-separate font-ppneuemontreal md:text-[17.7143px] md:leading-[26.5714px]">
        <PageShell />
      </body>
    </I18nProvider>
  );
};
