import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Home, HelpCircle, Shield, Wifi } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLoginUrl } from "@/const";

export default function AuthError() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const [, params] = useRoute("/auth-error");
  
  // Get error details from URL query params
  const searchParams = new URLSearchParams(window.location.search);
  const errorType = searchParams.get("type") || "unknown";
  const errorMessage = searchParams.get("message") || "";

  useEffect(() => {
    // Log the error for debugging
    console.error("[AuthError] Authentication failed:", { errorType, errorMessage });
  }, [errorType, errorMessage]);

  const getErrorDetails = () => {
    switch (errorType) {
      case "oauth_failed":
        return {
          title: language === "ar" ? "فشل تسجيل الدخول" : "Login Failed",
          description: language === "ar" 
            ? "حدث خطأ أثناء محاولة تسجيل الدخول باستخدام حساب Manus الخاص بك."
            : "An error occurred while trying to log in with your Manus account.",
          icon: <Shield className="h-12 w-12 text-red-500" />
        };
      case "token_exchange_failed":
        return {
          title: language === "ar" ? "خطأ في التحقق" : "Verification Error",
          description: language === "ar"
            ? "تعذر التحقق من بيانات الاعتماد الخاصة بك. يرجى المحاولة مرة أخرى."
            : "We couldn't verify your credentials. Please try again.",
          icon: <AlertCircle className="h-12 w-12 text-orange-500" />
        };
      case "user_info_failed":
        return {
          title: language === "ar" ? "خطأ في استرجاع البيانات" : "Data Retrieval Error",
          description: language === "ar"
            ? "تعذر استرجاع معلومات ملفك الشخصي. يرجى المحاولة مرة أخرى."
            : "We couldn't retrieve your profile information. Please try again.",
          icon: <AlertCircle className="h-12 w-12 text-orange-500" />
        };
      case "network_error":
        return {
          title: language === "ar" ? "خطأ في الاتصال" : "Connection Error",
          description: language === "ar"
            ? "تحقق من اتصالك بالإنترنت وحاول مرة أخرى."
            : "Please check your internet connection and try again.",
          icon: <Wifi className="h-12 w-12 text-red-500" />
        };
      default:
        return {
          title: language === "ar" ? "حدث خطأ ما" : "Something Went Wrong",
          description: language === "ar"
            ? "حدث خطأ غير متوقع أثناء تسجيل الدخول."
            : "An unexpected error occurred during login.",
          icon: <AlertCircle className="h-12 w-12 text-red-500" />
        };
    }
  };

  const errorDetails = getErrorDetails();

  const commonIssues = [
    {
      title: language === "ar" ? "انتهت صلاحية الجلسة" : "Session Expired",
      description: language === "ar"
        ? "قد تكون جلسة تسجيل الدخول الخاصة بك قد انتهت. حاول تسجيل الدخول مرة أخرى."
        : "Your login session may have expired. Try logging in again.",
    },
    {
      title: language === "ar" ? "مشاكل في المتصفح" : "Browser Issues",
      description: language === "ar"
        ? "امسح ذاكرة التخزين المؤقت وملفات تعريف الارتباط في المتصفح، أو جرب متصفحًا مختلفًا."
        : "Clear your browser cache and cookies, or try a different browser.",
    },
    {
      title: language === "ar" ? "مشاكل في الشبكة" : "Network Issues",
      description: language === "ar"
        ? "تحقق من اتصالك بالإنترنت وتأكد من أنك لا تستخدم VPN أو وكيل."
        : "Check your internet connection and ensure you're not using a VPN or proxy.",
    },
    {
      title: language === "ar" ? "صيانة الخدمة" : "Service Maintenance",
      description: language === "ar"
        ? "قد تكون خدمة المصادقة قيد الصيانة. حاول مرة أخرى خلال بضع دقائق."
        : "The authentication service may be under maintenance. Try again in a few minutes.",
    },
  ];

  const handleTryAgain = () => {
    window.location.href = getLoginUrl();
  };

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir={language === "ar" ? "rtl" : "ltr"}>
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {errorDetails.icon}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {errorDetails.title}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {errorDetails.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {language === "ar" ? "تفاصيل الخطأ: " : "Error details: "}
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <HelpCircle className="h-5 w-5" />
              <h3>{language === "ar" ? "المشاكل الشائعة والحلول" : "Common Issues & Solutions"}</h3>
            </div>
            
            <div className="grid gap-3">
              {commonIssues.map((issue, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-1">{issue.title}</h4>
                  <p className="text-sm text-gray-600">{issue.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-900">
              {language === "ar" 
                ? "إذا استمرت المشكلة، يرجى الاتصال بالدعم الفني على help@smartpro.om"
                : "If the problem persists, please contact technical support at help@smartpro.om"}
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button 
            onClick={handleTryAgain} 
            className="w-full sm:w-auto bg-[#003366] hover:bg-[#002244] text-white"
            size="lg"
          >
            <RefreshCw className={`h-4 w-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
            {language === "ar" ? "حاول مرة أخرى" : "Try Again"}
          </Button>
          <Button 
            onClick={handleGoHome} 
            variant="outline" 
            className="w-full sm:w-auto"
            size="lg"
          >
            <Home className={`h-4 w-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
            {language === "ar" ? "العودة للصفحة الرئيسية" : "Go to Homepage"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
