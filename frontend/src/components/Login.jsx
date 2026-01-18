import { setAuthUser } from "@/redux/authSlice";
import axios from "axios";
import { Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function Login() {
  const dispatch = useDispatch();

  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  
  const LoginHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.post(
        "https://bit-mitra.onrender.com/api/v1/user/login",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        navigate("/");
        toast.success(res.data.message);
        setInput({
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.log(`Login.jsx ${error.message}`);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center gradient-mesh p-4">
      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-glow hidden lg:block" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow hidden lg:block" />
      
      <div className="w-full max-w-md animate-fade-in">
        {/* Glass Card */}
        <form
          onSubmit={LoginHandler}
          className="glass rounded-3xl p-8 md:p-10 space-y-6"
        >
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-2">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient">BIT-MITRA</h1>
            <p className="text-muted-foreground">
              Welcome back! Login to connect with friends
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={input.email}
                  onChange={changeEventHandler}
                  className="pl-10 h-12 bg-background/50 border-border/50 rounded-xl input-focus"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={input.password}
                  onChange={changeEventHandler}
                  className="pl-10 h-12 bg-background/50 border-border/50 rounded-xl input-focus"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 btn-gradient rounded-xl text-base"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-muted-foreground">
                New to BIT-MITRA?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signUp"
              className="font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
