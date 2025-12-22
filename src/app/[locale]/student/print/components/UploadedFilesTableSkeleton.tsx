import { Skeleton } from '@/components/common/Skeleton';

export function UploadedFilesTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10">
            <th className="w-12 px-4 py-3">
              <Skeleton className="h-4 w-4" variant="shimmer" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-24" variant="shimmer" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-16" variant="shimmer" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-28" variant="shimmer" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-28" variant="shimmer" />
            </th>
            <th className="px-4 py-3 text-center">
              <Skeleton className="h-4 w-20" variant="shimmer" />
            </th>
            <th className="px-4 py-3 text-center">
              <Skeleton className="h-4 w-16" variant="shimmer" />
            </th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map(i => (
            <tr
              key={i}
              className="border-b border-slate-100 dark:border-white/5"
            >
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-4" variant="shimmer" />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton
                    className="h-8 w-8 shrink-0 rounded"
                    variant="shimmer"
                  />
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-4 w-48" variant="shimmer" />
                    <Skeleton className="h-3 w-24" variant="shimmer" />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-8" variant="shimmer" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-32" variant="shimmer" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-32" variant="shimmer" />
              </td>
              <td className="px-4 py-3 text-center">
                <Skeleton
                  className="mx-auto h-6 w-12 rounded-full"
                  variant="shimmer"
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center gap-2">
                  <Skeleton className="h-8 w-8 rounded" variant="shimmer" />
                  <Skeleton className="h-8 w-8 rounded" variant="shimmer" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

