"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowUpRight, Lock, Timer } from "lucide-react"
import { CaseDurationsTable } from "@/components/cases/case-durations-table"
import { CenteredSpinner } from "@/components/loading/spinner"
import { AlertNotification } from "@/components/notifications"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { toast } from "@/components/ui/use-toast"
import { useFeatureFlag } from "@/hooks/use-feature-flags"
import { useWorkspaceDetails } from "@/hooks/use-workspace"
import { deleteCaseDurationDefinition } from "@/lib/case-durations"
import { useCaseDurationDefinitions } from "@/lib/hooks"
import { useWorkspaceId } from "@/providers/workspace-id"

export function CaseDurationsView() {
  const workspaceId = useWorkspaceId()
  const { workspace, workspaceLoading, workspaceError } = useWorkspaceDetails()
  const queryClient = useQueryClient()
  const { isFeatureEnabled, isLoading: featureFlagLoading } = useFeatureFlag()

  const {
    caseDurationDefinitions,
    caseDurationDefinitionsIsLoading,
    caseDurationDefinitionsError,
  } = useCaseDurationDefinitions(
    workspaceId,
    isFeatureEnabled("case-durations")
  )

  const { mutateAsync: handleDelete, isPending: deleteIsPending } = useMutation(
    {
      mutationFn: async (durationId: string) => {
        if (!workspaceId) {
          throw new Error("Workspace ID is required")
        }

        await deleteCaseDurationDefinition(workspaceId, durationId)
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["case-duration-definitions", workspaceId],
        })
        toast({
          title: "Duration deleted",
          description: "The case duration definition was removed successfully.",
        })
      },
      onError: (error: unknown) => {
        console.error("Failed to delete case duration definition", error)
        toast({
          title: "Error deleting duration",
          description:
            error instanceof Error
              ? error.message
              : "Failed to delete the case duration definition. Please try again.",
          variant: "destructive",
        })
      },
    }
  )

  // Check feature flag loading first - fastest check
  if (featureFlagLoading) {
    return <CenteredSpinner />
  }

  // Show enterprise-only message if feature is not enabled
  // This shows immediately after feature flags load (~200ms)
  if (!isFeatureEnabled("case-durations")) {
    return (
      <div className="size-full overflow-auto">
        <div className="container flex h-full max-w-[1000px] items-center justify-center py-8">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Lock />
              </EmptyMedia>
              <EmptyTitle>Enterprise only</EmptyTitle>
              <EmptyDescription>
                Case durations are only available on enterprise plans.
              </EmptyDescription>
            </EmptyHeader>
            <Button
              variant="link"
              asChild
              className="text-muted-foreground"
              size="sm"
            >
              <a
                href="https://tracecat.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more <ArrowUpRight />
              </a>
            </Button>
          </Empty>
        </div>
      </div>
    )
  }

  // Only check workspace and case durations loading if feature is enabled
  if (workspaceLoading || caseDurationDefinitionsIsLoading) {
    return <CenteredSpinner />
  }

  if (workspaceError) {
    return (
      <AlertNotification
        level="error"
        message="Error loading workspace info."
      />
    )
  }

  if (!workspace) {
    return <AlertNotification level="error" message="Workspace not found." />
  }

  if (caseDurationDefinitionsError) {
    return (
      <AlertNotification
        level="error"
        message={`Error loading case duration definitions: ${caseDurationDefinitionsError.message}`}
      />
    )
  }

  if (!caseDurationDefinitions || caseDurationDefinitions.length === 0) {
    return (
      <div className="size-full overflow-auto">
        <div className="container flex h-full max-w-[1000px] flex-col items-center justify-center space-y-4 py-8 text-center">
          <div className="rounded-full bg-muted p-3">
            <Timer className="size-8 text-muted-foreground" />
          </div>
          <div className="space-y-1 text-muted-foreground">
            <h4 className="text-sm font-semibold">No durations defined yet</h4>
            <p className="text-xs">
              Add your first duration metric using the button in the header.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="size-full overflow-auto">
      <div className="container flex h-full max-w-[1000px] flex-col space-y-8 py-8">
        <CaseDurationsTable
          durations={caseDurationDefinitions}
          onDeleteDuration={handleDelete}
          isDeleting={deleteIsPending}
        />
      </div>
    </div>
  )
}
