import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Edit2, Trash2, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewReplyInterfaceProps {
  reviewId: number;
  rating: number;
  comment: string;
  existingReply?: string | null;
  onReplySubmitted?: () => void;
}

export function ReviewReplyInterface({
  reviewId,
  rating,
  comment,
  existingReply,
  onReplySubmitted,
}: ReviewReplyInterfaceProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isReplying, setIsReplying] = useState(!!existingReply);
  const [replyText, setReplyText] = useState(existingReply || "");
  const [selectedTone, setSelectedTone] = useState<"professional" | "friendly" | "apologetic">("professional");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestionsQuery = trpc.reviews.generateResponseSuggestions.useQuery(
    {
      reviewId,
      rating,
      comment,
      tone: selectedTone,
    },
    {
      enabled: showSuggestions,
    }
  );

  const submitReplyMutation = trpc.reviews.submitReply.useMutation({
    onSuccess: () => {
      toast({
        title: t("reviews.replySubmitted"),
        description: t("reviews.replySubmittedDesc"),
      });
      setIsReplying(false);
      onReplySubmitted?.();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const editReplyMutation = trpc.reviews.editReply.useMutation({
    onSuccess: () => {
      toast({
        title: t("reviews.replyUpdated"),
        description: t("reviews.replyUpdatedDesc"),
      });
      setIsReplying(false);
      onReplySubmitted?.();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteReplyMutation = trpc.reviews.deleteReply.useMutation({
    onSuccess: () => {
      toast({
        title: t("reviews.replyDeleted"),
        description: t("reviews.replyDeletedDesc"),
      });
      setReplyText("");
      setIsReplying(false);
      onReplySubmitted?.();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!replyText.trim() || replyText.length < 10) {
      toast({
        title: t("common.error"),
        description: t("reviews.replyTooShort"),
        variant: "destructive",
      });
      return;
    }

    if (existingReply) {
      editReplyMutation.mutate({ reviewId, responseText: replyText });
    } else {
      submitReplyMutation.mutate({ reviewId, responseText: replyText });
    }
  };

  const handleDelete = () => {
    if (confirm(t("reviews.confirmDeleteReply"))) {
      deleteReplyMutation.mutate({ reviewId });
    }
  };

  const handleUseSuggestion = (suggestion: string) => {
    setReplyText(suggestion);
    setShowSuggestions(false);
  };

  if (!isReplying && !existingReply) {
    return (
      <Button
        onClick={() => setIsReplying(true)}
        variant="outline"
        size="sm"
        className="mt-2"
      >
        <Send className="w-4 h-4 mr-2" />
        {t("reviews.replyToReview")}
      </Button>
    );
  }

  if (existingReply && !isReplying) {
    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsReplying(true)}
            variant="outline"
            size="sm"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            {t("reviews.editReply")}
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            size="sm"
            disabled={deleteReplyMutation.isPending}
          >
            {deleteReplyMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {t("reviews.deleteReply")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="mt-3 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{existingReply ? t("reviews.editReply") : t("reviews.replyToReview")}</h4>
        <Button
          onClick={() => {
            setIsReplying(false);
            if (!existingReply) {
              setReplyText("");
            }
          }}
          variant="ghost"
          size="sm"
        >
          {t("common.cancel")}
        </Button>
      </div>

      {!showSuggestions && (
        <div className="flex items-center gap-2">
          <Select value={selectedTone} onValueChange={(value: any) => setSelectedTone(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">{t("reviews.toneProfessional")}</SelectItem>
              <SelectItem value="friendly">{t("reviews.toneFriendly")}</SelectItem>
              <SelectItem value="apologetic">{t("reviews.toneApologetic")}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setShowSuggestions(true)}
            variant="outline"
            size="sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t("reviews.getSuggestions")}
          </Button>
        </div>
      )}

      {showSuggestions && (
        <div className="space-y-2">
          {suggestionsQuery.isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {suggestionsQuery.data && suggestionsQuery.data.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("reviews.clickToUse")}</p>
              {suggestionsQuery.data.map((suggestion: any, index: number) => (
                <Card
                  key={index}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleUseSuggestion(suggestion.text)}
                >
                  <p className="text-sm">{suggestion.text}</p>
                </Card>
              ))}
              <Button
                onClick={() => setShowSuggestions(false)}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                {t("reviews.writeOwn")}
              </Button>
            </div>
          )}
        </div>
      )}

      {!showSuggestions && (
        <>
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={t("reviews.replyPlaceholder")}
            rows={4}
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {replyText.length}/1000 {t("common.characters")}
            </span>
            <Button
              onClick={handleSubmit}
              disabled={
                !replyText.trim() ||
                replyText.length < 10 ||
                submitReplyMutation.isPending ||
                editReplyMutation.isPending
              }
            >
              {(submitReplyMutation.isPending || editReplyMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {existingReply ? t("reviews.updateReply") : t("reviews.submitReply")}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
