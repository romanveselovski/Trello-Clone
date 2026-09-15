import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function BoardColumnsSkeleton() {
  const taskCounts = [0, 2, 1, 0];

  return (
    <div className="h-full min-h-0 overflow-x-auto overflow-y-hidden px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex flex-row items-stretch gap-4 sm:gap-6 h-full min-h-0">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="w-72 sm:w-80 flex-shrink-0 h-full min-h-0 flex flex-col"
          >
            <Card className="py-0 gap-0 h-full flex flex-col overflow-hidden">
              <CardHeader className="border-b h-14 py-0 flex items-center bg-gray-50/80">
                <div className="flex items-center gap-2 w-full">
                  <div className="h-5 flex-1 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-8 bg-gray-200 rounded animate-pulse flex-shrink-0" />
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="px-2 flex-1 min-h-0 overflow-hidden">
                <div className="space-y-3 pt-2">
                  {Array.from({ length: taskCounts[index] }).map(
                    (_, taskIndex) => (
                      <Card key={taskIndex}>
                        <CardContent className="p-3 sm:p-4">
                          <div className="space-y-2.5">
                            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
