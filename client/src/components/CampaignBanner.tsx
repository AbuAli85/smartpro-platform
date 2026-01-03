import { trpc } from "@/lib/trpc";
import { useRegionalContent } from "@/hooks/useRegionalContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Tag } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export function CampaignBanner() {
  const { region } = useRegionalContent();
  const { language } = useLanguage();
  const [dismissedCampaigns, setDismissedCampaigns] = useState<number[]>([]);

  const { data, isLoading } = trpc.campaigns.getActiveCampaigns.useQuery({
    region: region === "all" ? null : region,
  });

  const trackImpression = trpc.campaigns.trackImpression.useMutation();
  const trackClick = trpc.campaigns.trackClick.useMutation();

  if (isLoading || !data || data.campaigns.length === 0) {
    return null;
  }

  // Filter out dismissed campaigns
  const visibleCampaigns = data.campaigns.filter(
    (campaign: any) => !dismissedCampaigns.includes(campaign.id)
  );

  if (visibleCampaigns.length === 0) {
    return null;
  }

  // Show the highest priority campaign
  const campaign = visibleCampaigns[0];

  // Track impression when component mounts
  if (!dismissedCampaigns.includes(campaign.id)) {
    trackImpression.mutate({ campaignId: campaign.id });
  }

  const handleDismiss = () => {
    setDismissedCampaigns([...dismissedCampaigns, campaign.id]);
  };

  const handleClick = () => {
    trackClick.mutate({ campaignId: campaign.id });
  };

  return (
    <section
      className="relative py-8 overflow-hidden"
      style={{
        backgroundColor: campaign.backgroundColor || "#003366",
        color: campaign.textColor || "#FFFFFF",
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
      </div>

      <div className="container relative">
        <div className="flex items-center justify-between gap-4">
          {/* Campaign Content */}
          <div className="flex-1 flex items-center gap-6">
            {/* Icon/Badge */}
            <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex-shrink-0">
              <Tag className="w-8 h-8" />
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {campaign.discountPercentage && (
                  <span className="px-2 py-0.5 bg-white/30 rounded-full text-xs font-bold">
                    {campaign.discountPercentage}% OFF
                  </span>
                )}
                <h3 className="text-xl md:text-2xl font-bold">
                  {language === "ar" && campaign.titleAr ? campaign.titleAr : campaign.title}
                </h3>
              </div>
              <p className="text-sm md:text-base opacity-90">
                {language === "ar" && campaign.descriptionAr
                  ? campaign.descriptionAr
                  : campaign.description}
              </p>
              {campaign.discountCode && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs opacity-75">
                    {language === "ar" ? "استخدم الكود:" : "Use code:"}
                  </span>
                  <code className="px-2 py-1 bg-white/20 rounded text-sm font-mono font-bold">
                    {campaign.discountCode}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          {campaign.ctaText && campaign.ctaLink && (
            <Button
              asChild
              size="lg"
              className="bg-white hover:bg-white/90 flex-shrink-0"
              style={{ color: campaign.backgroundColor || "#003366" }}
              onClick={handleClick}
            >
              <Link href={campaign.ctaLink}>
                {language === "ar" && campaign.ctaTextAr ? campaign.ctaTextAr : campaign.ctaText}
                <ArrowRight
                  className={`h-5 w-5 ${language === "ar" ? "mr-2 rotate-180" : "ml-2"}`}
                />
              </Link>
            </Button>
          )}

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
