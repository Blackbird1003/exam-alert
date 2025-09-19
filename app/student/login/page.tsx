"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { studentLogin } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [matricNumber, setMatricNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, message } = await studentLogin({
        matricNumber,
        password,
      });

      if (success) {
        toast.success("Login successful! ✅,Redirecting to dashboard.");
        router.push("/student/dashboard");
      } else {
        toast.error(message);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md rounded-xl shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-1">
            <span className="text-xl">🕒📩</span>
            <h2 className="text-xl font-bold text-indigo-600">Exam Alert</h2>
          </div>
          <CardTitle className="text-2xl">Student Login</CardTitle>
          <p>securly log into your account </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="matricNumber" className="mb-1">
                Matric Number
              </Label>
              <Input
                type="text"
                id="matricNumber"
                placeholder="1234567890"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="mb-1">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full mt-3" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-500 flex flex-col space-y-2">
          <div>
            Forgot password?{" "}
            <Link
              href="/student/forgot-password"
              className="text-indigo-600 hover:underline ml-1"
            >
              Reset it
            </Link>
          </div>
          <div>
            Don’t have an account?{" "}
            <Link
              href="/student/register"
              className="text-indigo-600 hover:underline ml-1"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
