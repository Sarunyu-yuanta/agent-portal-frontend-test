/** Unset until marketing supplies one — the panel falls back to a plain grey card. */
const ILLUSTRATION_SRC: string | null = null;

/** Shared chrome for the login / forgot-password / reset-password screens. */
export function AuthShell({
  children,
  withIllustration = true,
}: {
  children: React.ReactNode;
  /** Screens with no companion image (e.g. forgot-password) skip the split layout entirely. */
  withIllustration?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main
        className="flex-1 flex items-center justify-center bg-cover bg-center px-4 py-10"
        style={{ backgroundImage: "url(/login-bg.jpg)" }}
      >
        <div
          className={`flex w-full ${withIllustration ? "max-w-[978px]" : "max-w-[495px]"} bg-white rounded-3xl p-2 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]`}
        >
          {withIllustration && (
            <div className="hidden lg:block relative w-1/2 shrink-0 rounded-[20px] overflow-hidden bg-[#B5B5B5]">
              {ILLUSTRATION_SRC && (
                <img src={ILLUSTRATION_SRC} alt="" className="absolute inset-0 w-full h-full object-cover" />
              )}
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center gap-[18px] px-6 sm:px-12 lg:px-20 py-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
