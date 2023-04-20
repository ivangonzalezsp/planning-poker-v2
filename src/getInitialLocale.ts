export function getInitialLocale() {
  if (typeof window !== "undefined") {
    const storedLocale = localStorage.getItem("locale");
    if (storedLocale) {
      return storedLocale;
    }
    const [browserLocale] = navigator.language.split("-");
    return browserLocale;
  } else {
    return "en";
  }
}
