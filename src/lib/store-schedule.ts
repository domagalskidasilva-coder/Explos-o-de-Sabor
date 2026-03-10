export type WeekdayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface WeeklyScheduleDay {
  key: WeekdayKey;
  label: string;
  open: boolean;
  openingTime: string;
  closingTime: string;
}

export const WEEKDAY_DEFINITIONS: Array<{
  key: WeekdayKey;
  label: string;
}> = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

function normalizeTime(value: string | null | undefined, fallback: string) {
  return /^\d{2}:\d{2}$/.test(value?.trim() ?? "") ? value!.trim() : fallback;
}

export function createDefaultWeeklySchedule(
  openingTime = "08:00",
  closingTime = "19:00",
): WeeklyScheduleDay[] {
  return WEEKDAY_DEFINITIONS.map(({ key, label }, index) => ({
    key,
    label,
    open: index < 6,
    openingTime,
    closingTime,
  }));
}

export function normalizeWeeklySchedule(
  value: unknown,
  fallbackOpeningTime = "08:00",
  fallbackClosingTime = "19:00",
): WeeklyScheduleDay[] {
  const defaultSchedule = createDefaultWeeklySchedule(
    fallbackOpeningTime,
    fallbackClosingTime,
  );

  if (!Array.isArray(value)) {
    return defaultSchedule;
  }

  return WEEKDAY_DEFINITIONS.map(({ key, label }, index) => {
    const current = value.find((item) => {
      return (
        item && typeof item === "object" && "key" in item && item.key === key
      );
    }) as Partial<WeeklyScheduleDay> | undefined;

    return {
      key,
      label,
      open: current?.open ?? defaultSchedule[index]!.open,
      openingTime: normalizeTime(
        current?.openingTime,
        defaultSchedule[index]!.openingTime,
      ),
      closingTime: normalizeTime(
        current?.closingTime,
        defaultSchedule[index]!.closingTime,
      ),
    };
  });
}

export function formatWeeklyScheduleSummary(schedule: WeeklyScheduleDay[]) {
  const openDays = schedule.filter((day) => day.open);

  if (openDays.length === 0) {
    return "Loja fechada todos os dias";
  }

  const labels = openDays.map((day) => day.label.replace("-feira", ""));
  return labels.join(", ");
}

export function formatWeeklyScheduleLines(schedule: WeeklyScheduleDay[]) {
  return schedule.map((day) =>
    day.open
      ? `${day.label}: ${day.openingTime} às ${day.closingTime}`
      : `${day.label}: fechado`,
  );
}

function getMinutes(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

export function getCurrentWeekdayKey(date = new Date()): WeekdayKey {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
  })
    .format(date)
    .toLowerCase();

  switch (weekday) {
    case "monday":
      return "monday";
    case "tuesday":
      return "tuesday";
    case "wednesday":
      return "wednesday";
    case "thursday":
      return "thursday";
    case "friday":
      return "friday";
    case "saturday":
      return "saturday";
    default:
      return "sunday";
  }
}

export function getCurrentBrazilMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return Number(hour) * 60 + Number(minute);
}

export function isDayScheduleOpenNow(
  day: WeeklyScheduleDay | undefined,
  date = new Date(),
) {
  if (!day?.open) {
    return false;
  }

  const openingMinutes = getMinutes(day.openingTime);
  const closingMinutes = getMinutes(day.closingTime);
  const nowMinutes = getCurrentBrazilMinutes(date);

  if (closingMinutes <= openingMinutes) {
    return false;
  }

  return nowMinutes >= openingMinutes && nowMinutes <= closingMinutes;
}
