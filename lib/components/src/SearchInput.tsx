import { Design } from '@tacet-mod/discord/design'
import { lookupGeneratedIconComponent } from '@tacet-mod/utils/discord'
import type { DiscordModules } from '@tacet-mod/discord/types'

const MagnifyingGlassIcon = lookupGeneratedIconComponent('MagnifyingGlassIcon')

export default function SearchInput(
    props: DiscordModules.Components.TextInputProps,
) {
    return (
        <Design.TextInput
            leadingIcon={MagnifyingGlassIcon}
            placeholder="Search"
            returnKeyType="search"
            size="md"
            {...props}
        />
    )
}
