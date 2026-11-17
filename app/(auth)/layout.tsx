import { Logo } from '@/components/layout/Logo';
import { SafeImage } from '@/components/ui/safe-image';
import { IMAGES } from '@/lib/images';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
      <div className="relative hidden bg-leaf-dark lg:block">
        <SafeImage
          src={IMAGES.vegetableSpread}
          alt="A spread of fresh peppers, broccoli, carrots and greens"
          fill
          sizes="50vw"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-soil/85 to-transparent p-12 pt-32">
          <p className="max-w-sm font-display text-3xl font-semibold leading-tight text-white">
            “Picked in the morning, on your table by evening.”
          </p>
        </div>
      </div>
    </div>
  );
}
