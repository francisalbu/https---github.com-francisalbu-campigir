export type FooterLinkGroupProps = {
  title: string;
  links: {
    href: string;
    label: string;
  }[];
  rootElement: string;
};

export const FooterLinkGroup = (props: FooterLinkGroupProps) => {
  const content = (
    <>
      <div className="box-border caret-transparent flex min-w-16 no-underline align-bottom">
        <div className="items-center bg-white box-border caret-transparent flex text-zinc-900 justify-center no-underline align-middle px-[24px] py-[10px] rounded-[375px]">
          <span className="box-border font-ppneuemontreal font-medium text-[16px] leading-none tracking-[0.02em] uppercase md:text-[17px]">
            {props.title}
          </span>
        </div>
      </div>
      <ul
        role="list"
        className="box-border caret-transparent flex flex-col text-[16.0982px] leading-[24.1473px] list-[''] min-h-[auto] min-w-[auto] outline-[3px] no-underline align-bottom pl-0 md:text-[17.7143px] md:leading-[26.5714px]"
      >
        {props.links.map((link) => (
          <li
            className="box-border caret-transparent block text-[16.0982px] leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] no-underline align-bottom -mb-px md:text-[17.7143px] md:leading-[26.5714px]"
            key={`${link.href}-${link.label}`}
          >
            <a
              href={link.href}
              className="box-border caret-transparent inline-block text-[16.0982px] leading-[24.1473px] max-w-full outline-offset-[3px] outline-2 relative no-underline align-bottom border px-[20.1964px] py-[6.09821px] rounded-[32px] border-solid border-white md:text-[17.7143px] md:leading-[26.5714px] md:px-[23.4286px] md:py-[7.71429px] hover:outline-0"
            >
              <div className="box-border caret-transparent text-[16.0982px] h-full leading-[24.1473px] outline-[3px] pointer-events-none absolute no-underline align-bottom w-full rounded-[32px] left-0 top-0 md:text-[17.7143px] md:leading-[26.5714px]"></div>
              <div className="box-border caret-transparent text-[16.0982px] h-full leading-[24.1473px] outline-[3px] pointer-events-none absolute no-underline align-bottom w-full overflow-hidden rounded-[32px] left-0 top-0 md:text-[17.7143px] md:leading-[26.5714px]"></div>
              <div className="items-center box-border caret-transparent flex text-[16.0982px] justify-start leading-[24.1473px] outline-[3px] relative no-underline align-bottom md:text-[17.7143px] md:leading-[26.5714px]">
                <div className="box-border caret-transparent flow-root text-[20.9821px] font-normal tracking-[-0.209821px] leading-[31.4732px] min-h-[auto] min-w-[auto] outline-[3px] no-underline align-bottom font-roslindaledisplaycondensed md:text-[37.1429px] md:tracking-[-0.371429px] md:leading-[55.7143px]">
                  {link.label}
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </>
  );

  if (props.rootElement === "nav") {
    return (
      <nav className="items-start box-border caret-transparent gap-x-[36.5893px] flex flex-col flex-nowrap text-[16.0982px] justify-start leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] gap-y-[36.5893px] no-underline align-bottom md:gap-x-[46.2857px] md:flex-row md:flex-wrap md:text-[17.7143px] md:leading-[26.5714px] md:gap-y-[46.2857px]">
        {content}
      </nav>
    );
  }

  return (
    <div className="items-start box-border caret-transparent gap-x-[36.5893px] flex flex-col flex-nowrap text-[16.0982px] justify-start leading-[24.1473px] min-h-[auto] min-w-[auto] outline-[3px] gap-y-[36.5893px] no-underline align-bottom md:gap-x-[46.2857px] md:flex-row md:flex-wrap md:text-[17.7143px] md:leading-[26.5714px] md:gap-y-[46.2857px]">
      {content}
    </div>
  );
};
