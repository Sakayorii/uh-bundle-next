import { Design } from '@tacet-mod/discord/design'
import { PixelRatio, useWindowDimensions, View } from 'react-native'
import { PLUGIN_CARD_ESTIMATED_SIZE } from './PluginCard'
import { PluginFlashList } from './PluginList'
import type { AnyPlugin } from '@tacet-mod/plugins/_'

const { AlertModal, AlertActionButton, Text } = Design

export default function PluginHasDependenciesAlert({
    plugin,
    dependencies,
    action,
}: {
    plugin: AnyPlugin
    dependencies: AnyPlugin[]
    action: () => Promise<void>
}) {
    const { height: windowHeight } = useWindowDimensions()
    const maxHeight = PixelRatio.get() * windowHeight * 0.35 - 64

    return (
        <AlertModal
            title="Plugin has dependencies"
            content={
                <Text color="text-default">
                    Plugin{' '}
                    <Text variant="text-md/semibold" color="text-default">
                        {plugin.manifest.name}
                    </Text>{' '}
                    depends on other plugins to function.
                    {'\n'}
                    Enabling it will also enable the following plugins:
                </Text>
            }
            extraContent={
                <View
                    style={{
                        height: Math.min(
                            PLUGIN_CARD_ESTIMATED_SIZE * dependencies.length,
                            maxHeight,
                        ),
                        maxHeight,
                    }}
                >
                    <PluginFlashList plugins={dependencies} />
                </View>
            }
            actions={
                <>
                    <AlertActionButton
                        onPress={action}
                        text="Enable all"
                        variant="primary"
                    />
                    <AlertActionButton text="Cancel" variant="secondary" />
                </>
            }
        />
    )
}
