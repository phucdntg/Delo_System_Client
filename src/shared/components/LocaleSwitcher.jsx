import { useTranslate } from "@core/providers";

export default function LocaleSwitcher() {
  const { language, changeLanguage } = useTranslate();
  const isEn = language === "en";

  const activeStyle = {
    backgroundColor: "var(--primary-color)",
    color: "white",
    zIndex: 2,
    border: "none",
  };

  const inactiveStyle = {
    backgroundColor: "transparent",
    color: "color-mix(in srgb, var(--primary-color) 50%, transparent)",
    zIndex: 1,
    border:
      "1px solid color-mix(in srgb, var(--primary-color) 50%, transparent)",
  };

  return (
    <button
      onClick={() => changeLanguage(isEn ? "vi" : "en")}
      className="relative cursor-pointer border-none p-0 bg-transparent"
      style={{ width: 28, height: 24 }}
    >
      <div
        className="absolute top-0 left-0 w-6 h-5 flex rounded-xs text-sm"
        style={{
          transform: isEn ? "translate(0, 0)" : "translate(4px, 4px)",
          transition:
            "transform 300ms ease, background-color 300ms ease, color 300ms ease, z-index 0ms 150ms",
          ...(isEn ? activeStyle : inactiveStyle),
        }}
      >
        <span className="m-auto text-xs">EN</span>
      </div>

      <div
        className="absolute top-0 left-0 w-6 h-5 flex rounded-xs text-sm"
        style={{
          transform: isEn ? "translate(4px, 4px)" : "translate(0, 0)",
          transition:
            "transform 300ms ease, background-color 300ms ease, color 300ms ease, z-index 0ms 150ms",
          ...(isEn ? inactiveStyle : activeStyle),
        }}
      >
        <span className="m-auto text-xs">VN</span>
      </div>
    </button>
  );
}
