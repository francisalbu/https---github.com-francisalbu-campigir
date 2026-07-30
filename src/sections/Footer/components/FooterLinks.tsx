import { FooterLinkGroup } from "@/sections/Footer/components/FooterLinkGroup";
import { useI18n } from "@/i18n/i18n";

export const FooterLinks = () => {
  const { t } = useI18n();
  return (
    <div className="box-border caret-transparent gap-x-12 grid text-[16.0982px] auto-cols-[minmax(0px,1fr)] col-end-[span_2] col-start-[span_2] grid-cols-[repeat(auto-fill,minmax(min(max(128px,50%_-_24px),100%),1fr))] grid-rows-[auto] leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] gap-y-12 no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
      <FooterLinkGroup
        title={t("footer.navigation")}
        rootElement="nav"
        links={[
          { href: "#experiences", label: t("nav.experiences") },
          { href: "#experiences", label: t("nav.rentals") },
          { href: "https://www.campigir.com/pt/contactos", label: t("nav.contact") },
        ]}
      />
      <div className="box-border caret-transparent flex flex-col text-[16.0982px] justify-between leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
        <FooterLinkGroup
          title={t("footer.social")}
          links={[
            {
              href: "https://www.instagram.com/campigir/",
              label: "Instagram",
            },
          ]}
          rootElement="div"
        />
      </div>
    </div>
  );
};
