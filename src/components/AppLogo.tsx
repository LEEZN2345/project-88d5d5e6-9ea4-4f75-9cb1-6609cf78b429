import logoAsset from "@/assets/logo.png.asset.json";

export function AppLogo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="东大门蚂蚁 Dongdaemun ants"
      className={className}
    />
  );
}

export function AppLogoMark({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="东大门蚂蚁"
      className={className}
    />
  );
}
