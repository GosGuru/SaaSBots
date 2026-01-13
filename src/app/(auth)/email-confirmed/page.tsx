"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function EmailConfirmedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(next);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, next]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center relative">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            <Sparkles className="w-5 h-5 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <CardTitle className="text-2xl text-green-600 dark:text-green-400">
            ¡Email confirmado!
          </CardTitle>
          <CardDescription className="text-base">
            Tu cuenta ha sido verificada exitosamente.
            <br />
            Ya puedes acceder a todas las funcionalidades.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Serás redirigido automáticamente en
            </p>
            <p className="text-3xl font-bold text-primary mt-2">
              {countdown}
            </p>
            <p className="text-sm text-muted-foreground">
              segundos
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Link href={next} className="w-full">
            <Button className="w-full">
              Ir al Dashboard ahora
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
