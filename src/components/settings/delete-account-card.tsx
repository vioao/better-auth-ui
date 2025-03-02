import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { DeleteAccountCardPrimitive } from "../primitives/settings/delete-account-card-primitive"

import { type SettingsCardClassNames } from "./settings-card"
import { settingsLocalization } from "./settings-cards"

export function DeleteAccountCard({
    className,
    classNames,
    localization
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    localization?: Partial<typeof settingsLocalization>
}) {
    const { authClient } = useContext(AuthUIContext)
    const { isPending } = authClient.useSession()

    return (
        <DeleteAccountCardPrimitive
            className={className}
            classNames={classNames}
            isPending={isPending}
            localization={localization}
        />
    )
}