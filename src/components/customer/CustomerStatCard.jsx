import Link from "next/link";

export function CustomerStatCard({ title, value, icon: Icon, href, description }) {
  const content = (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
        {Icon && <Icon className="h-5 w-5 text-zinc-400" />}
      </div>
      <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
      {description && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}