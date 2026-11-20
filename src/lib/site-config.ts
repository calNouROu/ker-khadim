export function getSiteContactDetails() {
  const email =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    process.env.CONTACT_TO_EMAIL?.trim() ||
    "";
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || "";
  const address = process.env.NEXT_PUBLIC_CONTACT_ADDRESS?.trim() || "";
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "";
  const whatsappMessage = encodeURIComponent(
    "Bonjour, je vous contacte depuis le site KËR KHADIM."
  );
  const socialLinks = [
    { name: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
    { name: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL },
    { name: "YouTube", href: process.env.NEXT_PUBLIC_YOUTUBE_URL },
  ].filter(
    (link): link is { name: string; href: string } =>
      Boolean(link.href && /^https:\/\//i.test(link.href))
  );

  return {
    email,
    phone,
    address,
    whatsappUrl: whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
      : "",
    socialLinks,
  };
}
