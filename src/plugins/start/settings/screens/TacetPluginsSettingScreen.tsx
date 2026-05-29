import { useNavigation, useRoute } from '@react-navigation/native'
import { getAssetIdByName } from '@tacet-mod/assets'
import { styles } from '@tacet-mod/components/_'
import Page from '@tacet-mod/components/Page'
import SearchInput from '@tacet-mod/components/SearchInput'
import { ActionSheetActionCreators } from '@tacet-mod/discord/actions'
import { Design } from '@tacet-mod/discord/design'
import {
    getInternalPluginMeta,
    InternalPluginFlags,
    isPluginEnabled,
    isPluginEssential,
    isPluginInternal,
    pList,
} from '@tacet-mod/plugins/_'
import { PluginFlags } from '@tacet-mod/plugins/constants'
import { debounce } from '@tacet-mod/utils/callback'
import { useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'
import { ClickOutsideProvider } from 'react-native-click-outside'
import TacetIcon from '~assets/TacetIcon'
import { InstalledPluginMasonryFlashList } from '../components/PluginList'
import PluginStatesProvider from '../components/PluginStateProvider'
import {
    EnablePluginTooltipProvider,
    EssentialPluginTooltipProvider,
} from '../components/TooltipProvider'
import type { RouteProp } from '@react-navigation/core'
import type { ReactNavigationParamList } from '@tacet-mod/externals/react-navigation'
import type { FilterAndSortActionSheetProps } from '../components/FilterAndSortActionSheet'
import type { RouteNames, Setting } from '../constants'

const { Stack, IconButton, LayerScope } = Design

const FiltersHorizontalIcon = getAssetIdByName('FiltersHorizontalIcon', 'png')!

export default function TacetPluginsSettingScreen() {
    return (
        <LayerScope>
            <ClickOutsideProvider>
                <PluginStatesProvider>
                    <Page spacing={16}>
                        <EssentialPluginTooltipProvider>
                            <EnablePluginTooltipProvider>
                                <Screen />
                            </EnablePluginTooltipProvider>
                        </EssentialPluginTooltipProvider>
                    </Page>
                </PluginStatesProvider>
            </ClickOutsideProvider>
        </LayerScope>
    )
}

const SearchDebounceTime = 100

const Filters: FilterAndSortActionSheetProps['filters'] = {
    Enabled: {
        icon: getAssetIdByName('CircleCheckIcon')!,
        filter: plugin => isPluginEnabled(plugin),
    },
    Disabled: {
        icon: getAssetIdByName('CircleXIcon')!,
        filter: plugin => !isPluginEnabled(plugin),
    },
    'Has Errors': {
        icon: getAssetIdByName('CircleErrorIcon')!,
        filter: plugin => plugin.errors.length > 0,
    },
    Internal: {
        icon: TacetIcon,
        desc: 'Included with Tacet.',
        filter: (_, meta) => isPluginInternal(meta),
    },
    Essential: {
        icon: getAssetIdByName('StarIcon')!,
        desc: 'Required for Tacet to function properly.',
        filter: (_, meta) => isPluginEssential(meta),
    },
    'Non-APIs': {
        icon: getAssetIdByName('PaperIcon')!,
        desc: 'Exclude essential plugins that provide APIs for other plugins.',
        filter: (_, meta) => !(meta.iflags & InternalPluginFlags.API),
    },
} satisfies FilterAndSortActionSheetProps['filters']
const DefaultFilters: FilterAndSortActionSheetProps['filter'] = ['Non-APIs']

const DefaultSort: keyof typeof Sorts = 'Name'
const Sorts = {
    Name: [
        getAssetIdByName('IdIcon')!,
        (a, b) => a.manifest.name.localeCompare(b.manifest.name),
    ],
    'Enabled first': [
        getAssetIdByName('CircleCheckIcon')!,
        (a, b) =>
            (b.flags & PluginFlags.Enabled) - (a.flags & PluginFlags.Enabled),
    ],
} satisfies FilterAndSortActionSheetProps['sorts']

function Screen() {
    const navigation = useNavigation()
    const route =
        useRoute<
            RouteProp<
                ReactNavigationParamList,
                (typeof RouteNames)[typeof Setting.TacetPlugins]
            >
        >()

    const [search, setSearch] = useState('')
    const debouncedSetSearch = useCallback(
        debounce(setSearch, SearchDebounceTime),
        [],
    )

    const filter = route.params?.filter ?? DefaultFilters
    const matchAll = route.params?.matchAll ?? true
    const reverse = route.params?.reverse ?? false
    const sort = route.params?.sort ?? DefaultSort

    const allPlugins = useMemo(
        () =>
            [...pList.values()].map(
                plugin => [plugin, getInternalPluginMeta(plugin)!] as const,
            ),
        [],
    )

    const plugins = useMemo(
        () =>
            allPlugins
                .filter(([plugin, meta]) => {
                    if (filter.length === 0) return true
                    if (matchAll)
                        return filter.every(f =>
                            Filters[f].filter(plugin, meta),
                        )

                    return filter.some(f => Filters[f].filter(plugin, meta))
                })
                .filter(([plugin]) => {
                    const { name, description, author } = plugin.manifest
                    const query = search.toLowerCase()
                    return (
                        name.toLowerCase().includes(query) ||
                        description.toLowerCase().includes(query) ||
                        author.toLowerCase().includes(query)
                    )
                })
                .sort(([a], [b]) => {
                    const result = Sorts[sort as keyof typeof Sorts][1](a, b)
                    return reverse ? -result : result
                }),
        [allPlugins, filter, matchAll, reverse, sort, search],
    )

    return (
        <>
            <Stack direction="horizontal">
                <View style={styles.grow}>
                    <SearchInput onChange={debouncedSetSearch} size="md" />
                </View>
                <IconButton
                    icon={FiltersHorizontalIcon}
                    variant="tertiary"
                    onPress={() =>
                        ActionSheetActionCreators.openLazy(
                            import('../components/FilterAndSortActionSheet'),
                            'filter-and-sort-plugins',
                            {
                                filters: Filters,
                                filter,
                                setFilter: filter =>
                                    navigation.setParams({ filter }),
                                matchAll,
                                setMatchAll: matchAll =>
                                    navigation.setParams({ matchAll }),
                                reverse,
                                setReverse: reverse =>
                                    navigation.setParams({ reverse }),
                                sorts: Sorts,
                                sort,
                                setSort: sort => navigation.setParams({ sort }),
                            },
                        )
                    }
                />
            </Stack>
            <InstalledPluginMasonryFlashList plugins={plugins} />
        </>
    )
}
