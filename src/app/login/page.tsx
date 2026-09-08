"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@sarunyu/system-one";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { AuthShell } from "@/components/AuthShell";

/**
 * No auth backend exists yet (see `src/app/page.tsx`, which just redirects
 * `/` straight to `/client-hub`) — submitting takes the same shortcut rather
 * than pretending to validate credentials against nothing.
 */
export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    router.push("/client-hub");
  }

  return (
    <AuthShell>
      <h1 className="type-h4 text-foreground">เข้าสู่ระบบ IC Portal</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          placeholder="รหัสลูกค้า / เบอร์โทรศัพท์ / อีเมล"
          value={identifier}
          onChange={setIdentifier}
          required
        />

        <div className="flex flex-col gap-3">
          <Input
            placeholder="รหัสผ่าน"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            }
          />
          <Link
            href="/forgot-password"
            className="self-end text-sm font-semibold text-primary-action hover:underline"
          >
            ลืมรหัสผ่าน
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full mt-6">
          เข้าสู่ระบบ
        </Button>
      </form>

      <p className="type-description text-center text-muted-foreground">
        ©Copyright 2016 Yuanta Securities (Thailand). All Rights Reserved
      </p>
    </AuthShell>
  );
}
