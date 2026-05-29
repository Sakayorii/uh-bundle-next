import TacetIcon from '~assets/TacetIcon'
import Data from './data.json'
import type { ImageSourcePropType } from 'react-native'

export const Badges = {
    tacet_team: {
        label: 'Tacet Team',
        description: 'This user is a Tacet team member.',
        icon: TacetIcon,
        bnw: true,
        showDialog: true,
    },
} satisfies Record<string, Badge>

export const UsersWithBadges = Data as Record<string, BadgeId[]>

export type Badge = {
    label: string
    icon: ImageSourcePropType
    description: string
    bnw?: boolean
    showDialog?: boolean
}

export type BadgeId = keyof typeof Badges
