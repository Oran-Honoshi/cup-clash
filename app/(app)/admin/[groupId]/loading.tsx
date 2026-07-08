import { BallLoader } from "@/components/ui/BallLoader";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <BallLoader size="lg" />
    </div>
  );
}
