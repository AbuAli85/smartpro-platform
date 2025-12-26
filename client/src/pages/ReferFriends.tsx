import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Check, Users, TrendingUp, Clock, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function ReferFriends() {
  const [copied, setCopied] = useState(false);
  
  const { data: referralCode, isLoading: codeLoading } = trpc.referral.getMyReferralCode.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.referral.getMyReferralStats.useQuery();

  const referralUrl = referralCode?.code 
    ? `${window.location.origin}/signup?ref=${referralCode.code}`
    : "";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Join SmartPro and get started!");
    const body = encodeURIComponent(
      `I've been using SmartPro for my business services and thought you might find it useful too!\n\nUse my referral code: ${referralCode?.code}\nOr sign up directly: ${referralUrl}\n\nLet me know if you have any questions!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `Join SmartPro using my referral code ${referralCode?.code} and get started with business services! ${referralUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (codeLoading || statsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container py-8">
          <Breadcrumb items={[{ label: "Refer Friends" }]} className="mb-6" />
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
            <span className="ml-3 text-gray-600">Loading referral information...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container py-8 max-w-6xl">
        <Breadcrumb items={[{ label: "Refer Friends" }]} className="mb-6" />
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#003366] to-[#0066cc] rounded-full mb-4">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Refer Friends & Earn Rewards</h1>
          <p className="text-lg text-gray-600">
            Share SmartPro with your friends and earn 25 points when they complete their first booking!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Referrals</p>
                  <p className="text-3xl font-bold text-[#003366]">{stats?.totalReferrals || 0}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Successful</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.successfulReferrals || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats?.pendingReferrals || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Points Earned</p>
                  <p className="text-3xl font-bold text-[#003366]">{stats?.pointsEarned || 0}</p>
                </div>
                <Gift className="h-8 w-8 text-[#003366]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code Card */}
        <Card className="mb-8 border-2 border-[#003366]/20">
          <CardHeader>
            <CardTitle className="text-2xl">Your Referral Code</CardTitle>
            <CardDescription>Share this code with your friends to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                <p className="text-3xl font-mono font-bold text-center text-[#003366] tracking-wider">
                  {referralCode?.code || "Loading..."}
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => copyToClipboard(referralCode?.code || "")}
                className="bg-[#003366] hover:bg-[#002244]"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Or share via:</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(referralUrl)}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  onClick={shareViaEmail}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  onClick={shareViaWhatsApp}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Three simple steps to earn rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#003366] text-white rounded-full font-bold mb-3">
                  1
                </div>
                <h3 className="font-semibold mb-2">Share Your Code</h3>
                <p className="text-sm text-gray-600">
                  Send your unique referral code to friends via email, WhatsApp, or social media
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#003366] text-white rounded-full font-bold mb-3">
                  2
                </div>
                <h3 className="font-semibold mb-2">Friend Signs Up</h3>
                <p className="text-sm text-gray-600">
                  Your friend creates an account using your referral code
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#003366] text-white rounded-full font-bold mb-3">
                  3
                </div>
                <h3 className="font-semibold mb-2">Earn 25 Points</h3>
                <p className="text-sm text-gray-600">
                  Get 25 loyalty points when your friend completes their first booking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        {stats && stats.referrals && stats.referrals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
              <CardDescription>Track your referrals and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      {referral.referredUserName ? (
                        <>
                          <p className="font-medium">{referral.referredUserName}</p>
                          {referral.referredUserEmail && (
                            <p className="text-sm text-gray-500">{referral.referredUserEmail}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500 italic">Waiting for sign-up...</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(referral.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {referral.status === "completed" && (
                        <Badge className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      )}
                      {referral.status === "pending" && referral.referredId && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Pending First Booking
                        </Badge>
                      )}
                      {referral.status === "pending" && !referral.referredId && (
                        <Badge className="bg-gray-100 text-gray-800">
                          Awaiting Sign-up
                        </Badge>
                      )}
                      {referral.pointsAwarded && (
                        <span className="text-sm font-semibold text-green-600">+25 pts</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
