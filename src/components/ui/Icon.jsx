import {
  Bike,
  Box,
  Clock,
  CircleCheck,
  Headphones,
  House,
  PackageX,
  Plug,
  Receipt,
  Shirt,
  Truck,
  TriangleAlert,
} from "lucide-react";

/**
 * Mock data refers to icons by name so the JSON stays serialisable.
 * This is the only place that maps those names to Lucide components.
 */
const ICONS = {
  receipt: Receipt,
  box: Box,
  truck: Truck,
  bike: Bike,
  house: House,
  headphones: Headphones,
  shirt: Shirt,
  plug: Plug,
  "circle-check": CircleCheck,
  "triangle-alert": TriangleAlert,
  "package-x": PackageX,
  clock: Clock,
};

export function Icon({ name, ...props }) {
  const Component = ICONS[name] ?? CircleCheck;
  return <Component aria-hidden="true" {...props} />;
}
