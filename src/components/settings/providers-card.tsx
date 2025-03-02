"use client"

import { Loader2 } from "lucide-react"
import {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { type SocialProvider, socialProviders } from "../../social-providers"
import { Button } from "../ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "../ui/card"

import type { SettingsCardClassNames } from "./settings-card"
import { settingsLocalization } from "./settings-cards"
import ProvidersCardSkeleton from "./skeletons/providers-card-skeleton"

export default function ProvidersCard({
    className,
    classNames,
    accounts: accountsProp,
    isPending,
    localization
}: {
    className?: string
    classNames?: SettingsCardClassNames
    accounts?: { id: string, provider: string }[] | null
    isPending?: boolean
    localization?: Partial<typeof settingsLocalization>
}) {
    localization = { ...settingsLocalization, ...localization }

    const { authClient, colorIcons, noColorIcons, providers } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending } = authClient.useSession()

    const [accounts, setAccounts] = useState<{ id: string, provider: string }[] | null>(null)
    const [accountsPending, setAccountsPending] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const hasShownLinkedToast = useRef(false)

    const getAccounts = useCallback(async () => {
        if (!accounts) setAccountsPending(true)

        const { data, error } = await authClient.listAccounts()

        if (error) toast.error(error.message || error.statusText)

        setAccounts(data)
        setAccountsPending(false)
    }, [authClient, accounts])

    useEffect(() => {
        if (!sessionData || isPending || accountsProp) return

        getAccounts()
    }, [getAccounts, isPending, sessionData, accountsProp])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get("providerLinked") && !hasShownLinkedToast.current) {
            hasShownLinkedToast.current = true
            setTimeout(() => {
                toast.success(localization.providerLinkSuccess)

                // Remove the parameter from URL
                params.delete("providerLinked")
                const query = params.toString()
                const url = `${window.location.pathname}${query ? "?" + query : ""}`
                window.history.replaceState(null, "", url)
            }, 0)
        }
    }, [localization.providerLinkSuccess])

    const handleLink = async (provider: SocialProvider) => {
        setActionLoading(provider)
        const callbackURL = `${window.location.pathname}?providerLinked=true`
        const { error } = await authClient.linkSocial({ provider, callbackURL })

        if (error) {
            toast.error(error.message || error.statusText)
            setActionLoading(null)
        }
    }

    const handleUnlink = async (providerId: string) => {
        setActionLoading(providerId)
        const { error } = await authClient.unlinkAccount({ providerId })

        if (error) {
            toast.error(error.message || error.statusText)
        } else {
            await getAccounts()
            toast.success(localization.providerUnlinkSuccess)
        }

        setActionLoading(null)
    }

    if (isPending || sessionPending || accountsPending) {
        return <ProvidersCardSkeleton className={className} />
    }

    return (
        <Card className={cn("max-w-lg w-full", className, classNames?.base)}>
            <CardHeader className={classNames?.header}>
                <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                    {localization.providers}
                </CardTitle>

                <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                    {localization.providersDescription}
                </CardDescription>
            </CardHeader>

            <CardContent className={cn("flex flex-col gap-3", classNames?.content)}>
                {providers?.map((provider) => {
                    const socialProvider = socialProviders.find((socialProvider) => socialProvider.provider === provider)
                    if (!socialProvider) return null

                    const isLinked = accounts?.some(acc => acc.provider === socialProvider.provider)
                    const isButtonLoading = actionLoading === provider || actionLoading === provider

                    return (
                        <Card key={provider} className="flex items-center gap-3 px-4 py-3">
                            {colorIcons ? (
                                <socialProvider.icon className="size-4" color />
                            ) : noColorIcons ? (
                                <socialProvider.icon className="size-4" />
                            ) : (
                                <>
                                    <socialProvider.icon className="size-4 dark:hidden" color />
                                    <socialProvider.icon className="size-4 hidden dark:block" />
                                </>
                            )}

                            <span className="text-sm">
                                {socialProvider.name}
                            </span>

                            <Button
                                className={cn("ms-auto relative", classNames?.saveButton)}
                                disabled={isButtonLoading}
                                size="sm"
                                type="button"
                                variant={isLinked ? "secondary" : "default"}
                                onClick={() => {
                                    if (actionLoading) return

                                    if (isLinked) {
                                        handleUnlink(provider)
                                    } else {
                                        handleLink(provider)
                                    }
                                }}
                            >
                                <span className={isButtonLoading ? "opacity-0" : "opacity-100"}>
                                    {isLinked ? localization.providerUnlink : localization.providerLink}
                                </span>

                                {isButtonLoading && (
                                    <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin" />
                                )}
                            </Button>
                        </Card>
                    )
                })}
            </CardContent>
        </Card>
    )
}