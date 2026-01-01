import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, TrendingUp, Award, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useFormatNumber } from "@/hooks/useFormatNumber";

export default function LoyaltyDashboard() {
  const { t } = useTranslation();
  const { formatNumber, formatCurrency } = useFormatNumber();
  const { data: loyalty, isLoading: loadingLoyalty } = trpc.loyalty.getMyLoyalty.useQuery();
  const { data: transactions, isLoading: loadingTransactions } = trpc.loyalty.getMyTransactions.useQuery({ limit: 50 });

  if (loadingLoyalty || loadingTransactions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading loyalty program...</p>
        </div>
      </div>
    );
  }

  const pointsValue = loyalty ? (loyalty.availablePoints / 100) * 5 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#004080] text-white">
        <div className="container py-12">
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-8 w-8 text-[#D4AF37]" />
            <h1 className="text-3xl font-bold">{t("loyalty.title")}</h1>
          </div>
          <p className="text-blue-100">{t("loyalty.subtitle")}</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Available Points */}
          <Card className="border-t-4 border-t-[#D4AF37]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-[#D4AF37]" />
                {t("loyalty.availablePoints")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#003366]">
                {formatNumber(loyalty?.availablePoints || 0)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Worth {formatCurrency(pointsValue)}
              </p>
            </CardContent>
          </Card>

          {/* Total Earned */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {formatNumber(loyalty?.totalPoints || 0)}
              </div>
              <p className="text-sm text-gray-600 mt-2">All-time points</p>
            </CardContent>
          </Card>

          {/* Redeemed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Redeemed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                {loyalty?.redeemedPoints || 0}
              </div>
              <p className="text-sm text-gray-600 mt-2">Points used</p>
            </CardContent>
          </Card>
        </div>

        {/* How to Earn Points */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to Earn Points</CardTitle>
            <CardDescription>Multiple ways to earn loyalty rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Complete Bookings</h3>
                  <p className="text-sm text-gray-600">Earn 10 points per completed booking</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Write Reviews</h3>
                  <p className="text-sm text-gray-600">Earn 5 points per review submitted</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Refer Friends</h3>
                  <p className="text-sm text-gray-600">Earn 25 points per successful referral</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/20">
              <p className="text-sm font-medium text-gray-900">
                💰 Redemption Rate: 100 points = 5 OMR discount
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Use your points to get discounts on future bookings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent loyalty activity</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.type === "earn" ? "default" : "secondary"}
                          className={
                            transaction.type === "earn"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {transaction.type === "earn" ? "Earned" : "Redeemed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{transaction.reason}</TableCell>
                      <TableCell className="text-right font-semibold">
                        <span
                          className={
                            transaction.type === "earn" ? "text-green-600" : "text-red-600"
                          }
                        >
                          {transaction.type === "earn" ? "+" : "-"}
                          {transaction.points}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Complete bookings and write reviews to start earning points
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
