import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Sparkles, Copy, Check, RefreshCw, Send } from "lucide-react";

interface ReviewResponseAssistantProps {
  review: {
    id: number;
    rating: number;
    comment: string;
    customerName: string;
  };
  onResponseSubmit: (response: string) => void;
}

export function ReviewResponseAssistant({
  review,
  onResponseSubmit,
}: ReviewResponseAssistantProps) {
  const [selectedTone, setSelectedTone] = useState<"professional" | "friendly" | "apologetic">(
    "professional"
  );
  const [customResponse, setCustomResponse] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Generate AI suggestions
  const { data: suggestions, isLoading, refetch } = trpc.reviews.generateResponseSuggestions.useQuery(
    {
      reviewId: review.id,
      rating: review.rating,
      comment: review.comment,
      tone: selectedTone,
    }
  );

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setCustomResponse(text);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSubmit = () => {
    if (customResponse.trim()) {
      onResponseSubmit(customResponse);
    }
  };

  const toneOptions = [
    { value: "professional" as const, label: "Professional", color: "bg-blue-100 text-blue-700" },
    { value: "friendly" as const, label: "Friendly", color: "bg-green-100 text-green-700" },
    { value: "apologetic" as const, label: "Apologetic", color: "bg-orange-100 text-orange-700" },
  ];

  return (
    <div className="space-y-6">
      {/* Original Review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{review.customerName}</span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
                  ★
                </span>
              ))}
            </div>
          </div>
          <p className="text-muted-foreground">{review.comment}</p>
        </CardContent>
      </Card>

      {/* Tone Selection */}
      <div>
        <label className="text-sm font-semibold mb-2 block">Select Response Tone</label>
        <div className="flex gap-2">
          {toneOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedTone === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTone(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">AI-Generated Suggestions</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <CardDescription>
            Choose a suggestion or edit to create your perfect response
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      Option {index + 1}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(suggestion.text, index)}
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Use This
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {suggestion.text}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No suggestions available. Try changing the tone or refreshing.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Custom Response Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Response</CardTitle>
          <CardDescription>Edit the suggestion or write your own response</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Write your response here..."
            value={customResponse}
            onChange={(e) => setCustomResponse(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {customResponse.length} characters
            </span>
            <Button onClick={handleSubmit} disabled={!customResponse.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Post Response
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
