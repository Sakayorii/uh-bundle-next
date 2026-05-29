import { getAssetIdByName } from '@tacet-mod/assets'
import { FormSwitch, TableRowAssetIcon } from '@tacet-mod/components'
import {
    ActionSheetActionCreators,
    ToastActionCreators,
} from '@tacet-mod/discord/actions'
import { Design } from '@tacet-mod/discord/design'
import { Clipboard } from '@tacet-mod/externals/react-native-clipboard'
import {
    getInternalPluginMeta,
    InternalPluginFlags,
    isPluginEssential,
} from '@tacet-mod/plugins/_'
import { PluginFlags, PluginStatus } from '@tacet-mod/plugins/constants'
import { lookupGeneratedIconComponent } from '@tacet-mod/utils/discord'
import { getErrorStack } from '@tacet-mod/utils/error'
import { Pressable } from 'react-native'
import { ClickOutsideProvider } from 'react-native-click-outside'
import { handleDisablePlugin, handleEnablePlugin } from '../utils/actions'
import {
    openPluginSettings,
    showPluginClearDataConfirmation,
} from '../utils/alerts'
import { PluginInfo } from './PluginCard'
import { usePluginEnabled, usePluginStatus } from './PluginStateProvider'
import {
    EnablePluginTooltipProvider,
    useClickOutsideTooltip,
    useEnablePluginTooltip,
} from './TooltipProvider'
import type { AnyPlugin } from '@tacet-mod/plugins/_'

export interface PluginOptionsActionSheetProps {
    plugin: AnyPlugin
    sheetKey: string
}

const { ActionSheet, IconButton, TableRowGroup, TableRow, Stack } = Design

const FileWarningIcon = getAssetIdByName('FileWarningIcon', 'png')!
const SettingsIcon = getAssetIdByName('SettingsIcon', 'png')!

export default function PluginOptionsActionSheet({
    plugin,
    sheetKey,
}: PluginOptionsActionSheetProps) {
    const status = usePluginStatus(plugin)
    const enabled = usePluginEnabled(plugin)
    const meta = getInternalPluginMeta(plugin)
    const { dependencies, dependents } = meta!
    const essential = isPluginEssential(meta)
    const {
        manifest: { id, name, author, description, icon },
        errors,
        flags,
    } = plugin

    return (
        <ActionSheet>
            <Stack spacing={24} style={{ paddingTop: 8 }}>
                <PluginInfo
                    name={name}
                    author={author}
                    description={description}
                    icon={icon}
                    actions={
                        !essential && (
                            <FormSwitch
                                value={enabled}
                                onValueChange={v => {
                                    if (v) handleEnablePlugin(plugin)
                                    else handleDisablePlugin(plugin)
                                }}
                            />
                        )
                    }
                />
                <ClickOutsideProvider>
                    <EnablePluginTooltipProvider>
                        <PluginActions
                            plugin={plugin}
                            closeSheet={() => {
                                ActionSheetActionCreators.hideActionSheet(
                                    sheetKey,
                                )
                            }}
                        />
                    </EnablePluginTooltipProvider>
                </ClickOutsideProvider>
                <TableRowGroup title="Status">
                    <TableRow
                        icon={
                            <TableRowAssetIcon name="CircleInformationIcon" />
                        }
                        label="Status (TODO)"
                        subLabel={bitFieldToString(PluginStatus, status)}
                    />
                    {errors.length && (
                        <TableRow
                            variant="danger"
                            label="Errors"
                            icon={
                                <TableRowAssetIcon
                                    variant="danger"
                                    name="CircleErrorIcon"
                                />
                            }
                            subLabel={`${errors.length} errors. Tap to copy.`}
                            onPress={() => {
                                Clipboard.setString(
                                    errors.map(getErrorStack).join('\n'),
                                )
                                showCopiedToClipboardToast()
                            }}
                        />
                    )}
                </TableRowGroup>
                <TableRowGroup title="Advanced">
                    <TableRow
                        icon={<TableRowAssetIcon name="IdIcon" />}
                        label="ID"
                        subLabel={id}
                        onPress={() => {
                            Clipboard.setString(id)
                            showCopiedToClipboardToast()
                        }}
                    />
                    <TableRow
                        icon={<TableRowAssetIcon name="FlagIcon" />}
                        label="Flags"
                        subLabel={bitFieldToString(PluginFlags, flags)}
                    />
                    {meta.iflags && (
                        <TableRow
                            icon={<TableRowAssetIcon name="FlagIcon" />}
                            label="Internal Flags"
                            subLabel={bitFieldToString(
                                InternalPluginFlags,
                                meta.iflags,
                            )}
                        />
                    )}
                    {dependencies?.length && (
                        <TableRow
                            icon={<TableRowAssetIcon name="ListBulletsIcon" />}
                            label="Dependencies (TODO)"
                            subLabel={`${name} depends on ${dependencies.length} other plugins`}
                        />
                    )}
                    {dependents?.length && (
                        <TableRow
                            icon={<TableRowAssetIcon name="ListBulletsIcon" />}
                            label="Dependents (TODO)"
                            subLabel={`${dependents.length} other plugins depend on ${name}`}
                        />
                    )}
                </TableRowGroup>
            </Stack>
        </ActionSheet>
    )
}

function bitFieldToString(map: Record<string, number>, bitField: number) {
    return (
        Object.entries(map)
            .filter(([, value]) => bitField & value)
            .map(([key]) => key)
            .join(', ') || '-'
    )
}

function PluginActions({
    plugin,
    closeSheet,
}: {
    plugin: AnyPlugin
    closeSheet: () => void
}) {
    const enabled = usePluginEnabled(plugin)
    const enableTooltip = useEnablePluginTooltip()
    const settingsRef = useClickOutsideTooltip(useEnablePluginTooltip, () => {})

    return (
        <Stack
            direction="horizontal"
            justify="space-around"
            style={{ paddingHorizontal: 8, paddingVertical: 16 }}
        >
            <IconButton
                variant="secondary"
                size="lg"
                icon={FileWarningIcon}
                label="Clear Data"
                onPress={() => {
                    showPluginClearDataConfirmation(plugin, closeSheet)
                }}
            />
            {plugin.SettingsComponent && (
                <Pressable
                    onPress={() => {
                        if (enabled) return

                        requestAnimationFrame(() => {
                            enableTooltip.targetRef.current =
                                settingsRef.current
                            enableTooltip.setVisible(true)
                        })
                    }}
                >
                    <Design.IconButton
                        ref={settingsRef}
                        variant="secondary"
                        size="lg"
                        icon={SettingsIcon}
                        label="Settings"
                        disabled={!enabled}
                        onPress={() => {
                            openPluginSettings(plugin)
                            closeSheet()
                        }}
                    />
                </Pressable>
            )}
        </Stack>
    )
}

const CopyIcon = lookupGeneratedIconComponent('CopyIcon')!

function showCopiedToClipboardToast() {
    ToastActionCreators.open({
        key: 'TACET_PLUGIN_SETTINGS_COPIED',
        content: 'Copied to clipboard',
        IconComponent: CopyIcon,
    })
}
