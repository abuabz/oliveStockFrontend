"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

const initialState = {
  error: "",
};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="w-full max-w-md p-8 bg-background/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-border/50">
      <div className="flex flex-col items-center justify-center mb-8 space-y-4">
        <div className="p-4 bg-primary/10 rounded-full">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to access the OliveEstate dashboard
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            required
            className="h-12 bg-muted/50"
            placeholder="Enter username"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="h-12 bg-muted/50"
            placeholder="Enter password"
          />
        </div>

        {state?.error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 text-center font-medium">
            {state.error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-[15px] font-semibold rounded-xl"
          disabled={pending}
        >
          {pending ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
