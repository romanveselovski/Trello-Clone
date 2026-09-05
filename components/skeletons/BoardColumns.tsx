import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function BoardColumnsSkeleton() {
  const taskCounts = [0, 2, 1, 0];

  return (
    <div className="flex flex-row gap-4 sm:gap-6 overflow-x-auto overscroll-x-contain pb-4 px-1 -mx-1 [scrollbar-gutter:stable] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="w-72 sm:w-80 flex-shrink-0 mt-1">
          <Card className="py-3 gap-2">
            <CardHeader className="border-b py-0">
              <div className="flex items-center justify-between">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="px-2">
              <div className="space-y-3">
                {Array.from({ length: 0 }).map(
                  (_, taskIndex) => (
                    <Card key={taskIndex}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="space-y-2.5">
                          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                          <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
                          <div className="flex justify-between">
                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
                {/* Show tasks only on large screens */}
                <div className="hidden lg:block">
                  {Array.from({ length: taskCounts[index] }).map(
                    (_, taskIndex) => (
                      <Card key={taskIndex}>
                        <CardContent className="p-3 sm:p-4">
                          <div className="space-y-2.5">
                            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
                            <div className="flex justify-between">
                              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                              <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </div>
              <div className="h-7 w-24 mx-auto bg-gray-200 rounded animate-pulse mt-3.5" />
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
