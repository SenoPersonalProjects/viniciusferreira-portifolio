import { createSocialImage, socialImageSize } from "@/lib/social-image";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name}, ${siteConfig.role}`;
export const size = socialImageSize;
export const contentType = "image/png";

export default function Image() {
  return createSocialImage();
}
