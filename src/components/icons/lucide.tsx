import {
  Archive,
  ArrowLeft,
  Bell,
  Bookmark,
  Camera,
  ChartPie,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  CircleAlert,
  CircleCheck,
  CircleX,
  Folder,
  Funnel,
  GripVertical,
  Inbox,
  Info,
  Link,
  Lock,
  LogOut,
  type LucideIcon,
  type LucideProps,
  MailOpen,
  MailX,
  Menu,
  MessagesSquare,
  Minus,
  Palette,
  PanelLeft,
  Paperclip,
  Pipette,
  Plus,
  Redo2,
  Search,
  Send,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  SquarePen,
  Star,
  SunMoon,
  Tag,
  Trash2,
  Undo2,
  User,
  X,
} from "lucide-react";
import {
  type ForwardRefExoticComponent,
  forwardRef,
  type RefAttributes,
} from "react";

export const ICON_STROKE_WIDTH = 1.2;

type AppIcon = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;

function createIcon(Icon: LucideIcon, displayName: string): AppIcon {
  const StrokedIcon = forwardRef<SVGSVGElement, LucideProps>(
    ({ strokeWidth = ICON_STROKE_WIDTH, ...props }, ref) => (
      <Icon ref={ref} strokeWidth={strokeWidth} {...props} />
    ),
  );

  StrokedIcon.displayName = displayName;

  return StrokedIcon;
}

export const ArchiveBoxIcon = createIcon(Archive, "ArchiveBoxIcon");
export const ArchiveIcon = createIcon(Archive, "ArchiveIcon");
export const ArrowLeftIcon = createIcon(ArrowLeft, "ArrowLeftIcon");
export const ArrowRightStartOnRectangleIcon = createIcon(
  LogOut,
  "ArrowRightStartOnRectangleIcon",
);
export const ArrowUturnLeftIcon = createIcon(Undo2, "ArrowUturnLeftIcon");
export const ArrowUturnRightIcon = createIcon(Redo2, "ArrowUturnRightIcon");
export const Bars2Icon = createIcon(Menu, "Bars2Icon");
export const BellIcon = createIcon(Bell, "BellIcon");
export const BookmarkIcon = createIcon(Bookmark, "BookmarkIcon");
export const CameraIcon = createIcon(Camera, "CameraIcon");
export const ChartPieIcon = createIcon(ChartPie, "ChartPieIcon");
export const ChatBubbleLeftRightIcon = createIcon(
  MessagesSquare,
  "ChatBubbleLeftRightIcon",
);
export const CheckCircleIcon = createIcon(CircleCheck, "CheckCircleIcon");
export const CheckIcon = createIcon(Check, "CheckIcon");
export const ChevronDownIcon = createIcon(ChevronDown, "ChevronDownIcon");
export const ChevronLeftIcon = createIcon(ChevronLeft, "ChevronLeftIcon");
export const ChevronRightIcon = createIcon(ChevronRight, "ChevronRightIcon");
export const ChevronsLeftIcon = createIcon(ChevronsLeft, "ChevronsLeftIcon");
export const ChevronsRightIcon = createIcon(ChevronsRight, "ChevronsRightIcon");
export const ChevronUpDownIcon = createIcon(
  ChevronsUpDown,
  "ChevronUpDownIcon",
);
export const Cog6ToothIcon = createIcon(Settings, "Cog6ToothIcon");
export const DangerIcon = createIcon(ShieldAlert, "DangerIcon");
export const ExclamationCircleIcon = createIcon(
  CircleAlert,
  "ExclamationCircleIcon",
);
export const EyeDropperIcon = createIcon(Pipette, "EyeDropperIcon");
export const FolderIcon = createIcon(Folder, "FolderIcon");
export const FunnelIcon = createIcon(Funnel, "FunnelIcon");
export const GripVerticalIcon = createIcon(GripVertical, "GripVerticalIcon");
export const InboxIcon = createIcon(Inbox, "InboxIcon");
export const InformationCircleIcon = createIcon(Info, "InformationCircleIcon");
export const LinkIcon = createIcon(Link, "LinkIcon");
export const LockIcon = createIcon(Lock, "LockIcon");
export const MagnifyingGlassIcon = createIcon(Search, "MagnifyingGlassIcon");
export const MailOpenIcon = createIcon(MailOpen, "MailOpenIcon");
export const MinusIcon = createIcon(Minus, "MinusIcon");
export const PaletteIcon = createIcon(Palette, "PaletteIcon");
export const PanelLeftIcon = createIcon(PanelLeft, "PanelLeftIcon");
export const PaperAirplaneIcon = createIcon(Send, "PaperAirplaneIcon");
export const PaperClipIcon = createIcon(Paperclip, "PaperClipIcon");
export const PencilSquareIcon = createIcon(SquarePen, "PencilSquareIcon");
export const PlusIcon = createIcon(Plus, "PlusIcon");
export const SentIcon = createIcon(Send, "SentIcon");
export const SettingsIcon = createIcon(Settings, "SettingsIcon");
export const ShieldCheckIcon = createIcon(ShieldCheck, "ShieldCheckIcon");
export const ShieldIcon = createIcon(Shield, "ShieldIcon");
export const SignOutIcon = createIcon(LogOut, "SignOutIcon");
export const SparkleIcon = createIcon(Sparkles, "SparkleIcon");
export const StarIcon = createIcon(Star, "StarIcon");
export const TagIcon = createIcon(Tag, "TagIcon");
export const ThemeIcon = createIcon(SunMoon, "ThemeIcon");
export const TrashIcon = createIcon(Trash2, "TrashIcon");
export const UfoIcon = createIcon(MailX, "UfoIcon");
export const UserIcon = createIcon(User, "UserIcon");
export const XCircleIcon = createIcon(CircleX, "XCircleIcon");
export const XMarkIcon = createIcon(X, "XMarkIcon");
