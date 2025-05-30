"use client"

import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { CardDescription, CardFooter } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import type { SettingsCardClassNames } from "./settings-card"

export interface SettingsCardFooterProps {
    actionLabel?: ReactNode
    disabled?: boolean
    isSubmitting?: boolean
    isPending?: boolean
    instructions?: ReactNode
    classNames?: SettingsCardClassNames
    className?: string
    optimistic?: boolean
    variant?: "default" | "destructive"
}

export function SettingsCardFooter({
    actionLabel,
    disabled,
    isSubmitting,
    isPending,
    instructions,
    classNames,
    className,
    optimistic,
    variant = "default"
}: SettingsCardFooterProps) {
    return (
        <CardFooter
            className={cn(
                "flex flex-col justify-between gap-4 rounded-b-xl md:flex-row",
                (actionLabel || instructions) && "!py-4 border-t",
                variant === "default"
                    ? "bg-muted dark:bg-transparent"
                    : "border-destructive/30 bg-destructive/10",
                className,
                classNames?.footer
            )}
        >
            {isPending ? (
                <>
                    {instructions && (
                        <Skeleton
                            className={cn(
                                "my-0.5 h-3 w-48 max-w-full md:h-4 md:w-56",
                                classNames?.skeleton
                            )}
                        />
                    )}

                    {actionLabel && (
                        <Skeleton className={cn("h-8 w-14 md:ms-auto", classNames?.skeleton)} />
                    )}
                </>
            ) : (
                <>
                    {instructions && (
                        <CardDescription
                            className={cn(
                                "text-muted-foreground text-xs md:text-sm",
                                classNames?.instructions
                            )}
                        >
                            {instructions}
                        </CardDescription>
                    )}

                    {actionLabel && (
                        <Button
                            className={cn("md:ms-auto", classNames?.button)}
                            disabled={disabled || isSubmitting}
                            size="sm"
                            type="submit"
                            variant={variant === "destructive" ? "destructive" : "default"}
                        >
                            <span className={cn(!optimistic && isSubmitting && "opacity-0")}>
                                {actionLabel}
                            </span>

                            {!optimistic && isSubmitting && (
                                <span className="absolute">
                                    <Loader2 className="animate-spin" />
                                </span>
                            )}
                        </Button>
                    )}
                </>
            )}
        </CardFooter>
    )
}
