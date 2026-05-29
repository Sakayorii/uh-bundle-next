import { AlertActionCreators } from '@tacet-mod/discord/actions'
import { Design } from '@tacet-mod/discord/design'
import { getModules } from '@tacet-mod/modules/finders'
import { withProps } from '@tacet-mod/modules/finders/filters'
import { InternalPluginFlags, registerPlugin } from '@tacet-mod/plugins/_'
import { PluginFlags } from '@tacet-mod/plugins/constants'
import { afterJSX, beforeJSX } from '@tacet-mod/react/jsx-runtime'
import { findInReactFiber } from '@tacet-mod/utils/react'
import { Image } from 'react-native'
import { Badges, UsersWithBadges } from './constants'
import { styles, useBadgeStyles } from './styles'
import { afterRendered } from './utils'
import type { FC, ReactElement } from 'react'
import type {
    ImageProps,
    ImageSourcePropType,
    ImageStyle,
    PressableProps,
    StyleProp,
} from 'react-native'
import type { Badge, BadgeId } from './constants'

const DUMMY_SYMBOL = {} as unknown as string

interface ProfileBadgeProps {
    id: string
    userId: string
    label: string
    source: ImageSourcePropType
    themeType: string
    badgeSize: number
}

interface ProfileBadgeRowsProps {
    userId: string
    badges: Array<{
        description: string
        icon: string
        id: string
        link?: string
    }>
    themeType: string
    showToastOnPress?: boolean
}

type ViewWithProfileBadges = ReactElement<{
    children: Array<ReactElement<ProfileBadgeProps, FC<ProfileBadgeProps>>>
}>

registerPlugin(
    {
        id: 'tacet.user-badges',
        name: 'User Badges',
        description: 'Badges for Tacet contributors and sponsors.',
        author: 'Sakayori Studio',
        icon: 'ShieldUserIcon',
    },
    {
        start({ cleanup }) {
            const unsub = getModules(
                withProps<{ ProfileBadgeRows: FC<ProfileBadgeRowsProps> }>(
                    'ProfileBadgeRows',
                ),
                ({ ProfileBadgeRows }) => {
                    cleanup(
                        beforeJSX(ProfileBadgeRows, args => {
                            const [, props] = args

                            if (
                                UsersWithBadges[props.userId] &&
                                !props.badges.length
                            )
                                // @ts-expect-error: This will never be rendered
                                props.badges.push({ id: DUMMY_SYMBOL })

                            return args
                        }),
                    )

                    cleanup(
                        afterJSX(ProfileBadgeRows, el => {
                            patchProfileBadgeRows(el)
                            return el
                        }),
                    )
                },
            )

            cleanup(unsub)
        },
        stop({ plugin }) {
            plugin.flags |= PluginFlags.ReloadRequired
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal | InternalPluginFlags.Essential,
)

function patchProfileBadgeRows(
    element: ReactElement<ProfileBadgeRowsProps, FC<ProfileBadgeRowsProps>>,
): void {
    const unpatch = afterRendered(element, el => {
        unpatch()

        const container = findInReactFiber(
            el as ReactElement,
            isViewContainingProfileBadgeElements,
        )

        if (!container) return el

        const [{ type: ProfileBadge, props }] = container.props.children
        const userBadges = UsersWithBadges[props.userId]

        if (userBadges) {
            for (const badgeId of userBadges) {
                const badge = Badges[badgeId]
                if (!badge) continue

                const badgeElement = (
                    <ProfileBadge
                        {...props}
                        key={badgeId}
                        id={badgeId}
                        label={badge.label}
                        source={badge.icon}
                    />
                )

                patchProfileBadge(badgeElement, badgeId, badge)
                container.props.children.push(badgeElement)
            }

            if (props.id === DUMMY_SYMBOL) container.props.children.shift()
        }

        return el
    })
}

function patchProfileBadge(
    element: ReactElement<ProfileBadgeProps, FC<ProfileBadgeProps>>,
    id: BadgeId,
    badge: Badge,
): void {
    const { bnw, showDialog } = badge
    if (!bnw && !showDialog) return

    const unpatch = afterRendered(element, el => {
        unpatch()

        const badgeStyles = useBadgeStyles()

        if (showDialog) {
            const pressable = findInReactFiber(
                el as ReactElement,
                (node): node is ReactElement<PressableProps> =>
                    node.type?.render,
            )

            if (pressable)
                pressable.props.onPress = () =>
                    openBadgeDialog(id, badge, badgeStyles)
        }

        if (bnw) {
            const image = findInReactFiber(
                el as ReactElement,
                (node): node is ReactElement<ImageProps> => node.type === Image,
            )

            if (image) {
                const styles = image.props.style as Extract<
                    StyleProp<ImageStyle>,
                    any[]
                >
                styles.push(badgeStyles.tinted)
            }
        }

        return el
    })
}

const { AlertActionButton, AlertModal, Stack, Text } = Design

function openBadgeDialog(
    id: BadgeId,
    { label, description, bnw, icon }: Badge,
    badgeStyles: ReturnType<typeof useBadgeStyles>,
): void {
    AlertActionCreators.openAlert(
        `TACET_PROFILE_BADGE-${id}`,
        <AlertModal
            title={
                <Stack style={styles.stack}>
                    <Image
                        source={icon}
                        style={[styles.display, bnw && badgeStyles.tinted]}
                    />
                    <Text
                        variant="heading-lg/bold"
                        color="mobile-text-heading-primary"
                    >
                        {label}
                    </Text>
                </Stack>
            }
            content={description}
            actions={<AlertActionButton text="Okay" />}
        />,
    )
}

const isViewContainingProfileBadgeElements = (
    node: any,
): node is ViewWithProfileBadges =>
    node.props?.children?.[0]?.type.name === 'ProfileBadge'
