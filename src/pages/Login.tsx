import { useState, useEffect, useLayoutEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { useLoginMutation } from "@/store/api";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { isTokenValid } from "@/lib/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Clear form fields on mount and when location changes (e.g., after logout)
  useLayoutEffect(() => {
    // Only redirect if token exists and is valid (not expired)
    if (isTokenValid()) {
      navigate('/dashboard', { replace: true });
    } else {
      // Clear form fields if no valid token (e.g., after logout)
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setIsForgot(false);
    }
  }, [location.pathname, navigate]);

  const handleSignin = async () => {
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      
      if (result.auth_result?.IdToken) {
        localStorage.setItem('idToken', result.auth_result.IdToken);
        localStorage.setItem('userRole', result.role);
        localStorage.setItem('accessToken', result.auth_result.AccessToken);
        localStorage.setItem('refreshToken', result.auth_result.RefreshToken);
        
        // Clear all form fields for security before navigation
        setEmail("");
        setPassword("");
        setShowPassword(false);
        setIsForgot(false);
        
        toast({
          title: "Success",
          description: "Login successful!",
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error?.data?.message || "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      toast({
        title: "Validation Error",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Password Reset",
      description: "Password reset link sent to your email!",
    });
    setIsForgot(false);
  };

  return (
    <div className="w-screen h-screen m-0 p-0 overflow-x-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-screen min-h-screen flex justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-[1100px] h-auto min-h-[500px] sm:h-[650px] flex flex-col sm:flex-row rounded-[20px] overflow-hidden glass-widget shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          
          <div className="w-full sm:w-1/2 bg-gradient-to-br from-primary to-primary/80 text-white p-8 sm:p-[60px] flex flex-col justify-center backdrop-blur-sm">
            <h2 className="text-2xl sm:text-[32px] mb-5 font-semibold">
              Track team activity in real time
            </h2>
            <p className="text-base sm:text-[17px] leading-relaxed">
              Activity Tracker helps managers monitor active members,
              track sprint progress, and identify blockers early.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mt-8 sm:mt-10">
              <div className="bg-white/15 p-4 sm:p-5 rounded-xl">
                <h3 className="text-xl sm:text-2xl font-semibold mb-1">30%</h3>
                <span className="text-xs sm:text-sm">Better visibility</span>
              </div>
              <div className="bg-white/15 p-4 sm:p-5 rounded-xl">
                <h3 className="text-xl sm:text-2xl font-semibold mb-1">40%</h3>
                <span className="text-xs sm:text-sm">Faster sprint tracking</span>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex justify-center items-center p-4 sm:p-6">
            <div className="w-full max-w-[380px]">
              <div className="text-[25px] font-semibold mb-5">
                <h3 className="text-foreground">⚡ Activity Tracker</h3>
              </div>

              {!isForgot ? (
                <>
                  <p className="text-gray-600 mb-6">
                    <h3 className="text-foreground text-lg font-semibold mb-2">
                      Welcome to Activity Tracker - Sign in to access your activity dashboard
                    </h3>
                  </p>

                  <form 
                    className="space-y-4"
                    autoComplete="off"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSignin();
                    }}
                  >
                    <div>
                      <Label htmlFor="email" className="text-sm mb-1.5 block">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="off"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <Label htmlFor="password" className="text-sm">
                          Password
                        </Label>
                        <span
                          className="text-sm text-blue-600 cursor-pointer hover:underline"
                          onClick={() => setIsForgot(true)}
                        >
                          Forgot password?
                        </span>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base rounded-[10px] mt-2.5"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign in"}
                    </Button>

                    <div className="text-center my-5 text-gray-400">
                      OR
                    </div>

                    <Button
                      variant="outline"
                      disabled
                      className="w-full py-3 flex items-center justify-center gap-2.5 border border-gray-300 bg-gray-100 hover:bg-gray-100 rounded-[10px] opacity-60 cursor-not-allowed"
                    >
                      <FcGoogle size={20} />
                      Continue with Google
                    </Button>

                    <Button
                      variant="outline"
                      disabled
                      className="w-full py-3 flex items-center justify-center gap-2.5 border border-gray-300 bg-gray-100 hover:bg-gray-100 rounded-[10px] opacity-60 cursor-not-allowed"
                    >
                      <FaMicrosoft size={18} color="#00A4EF" />
                      Continue with Microsoft
                    </Button>

                    <Button
                      variant="outline"
                      disabled
                      className="w-full py-3 border border-gray-300 bg-gray-100 hover:bg-gray-100 rounded-[10px] opacity-60 cursor-not-allowed"
                    >
                      Continue with SSO / OAuth
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold mb-2 text-foreground">
                    Forgot password
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Enter your email to receive a reset link
                  </p>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="forgot-email" className="text-sm mb-1.5 block">
                        Email
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <Button
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base rounded-[10px]"
                      onClick={handleForgotPassword}
                    >
                      Send reset link
                    </Button>

                    <div
                      className="text-blue-600 cursor-pointer hover:underline text-sm mt-4 text-center"
                      onClick={() => setIsForgot(false)}
                    >
                      ← Back to sign in
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

