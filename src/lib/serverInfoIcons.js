import {
  Clock,
  Gamepad2,
  Globe,
  Info,
  Link as LinkIcon,
  Map,
  Server,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export const SERVER_INFO_ICON_NAMES = [
  "Server",
  "Gamepad2",
  "ShieldCheck",
  "Globe",
  "Users",
  "Clock",
  "Info",
  "Link",
  "Map",
  "Settings",
];

const SERVER_INFO_ICON_COMPONENTS = {
  Server,
  Gamepad2,
  ShieldCheck,
  Globe,
  Users,
  Clock,
  Info,
  Link: LinkIcon,
  Map,
  Settings,
};

export const getServerInfoIcon = (iconName) => {
  return SERVER_INFO_ICON_COMPONENTS[iconName] || Server;
};
