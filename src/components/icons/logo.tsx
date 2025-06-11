import type { SVGProps } from "react";
import { BrainCircuit } from "lucide-react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return <BrainCircuit className="h-8 w-8 text-primary" {...props} />;
}
