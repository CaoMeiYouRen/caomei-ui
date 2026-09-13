<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import metaData from '../../data/component-meta.json'

interface ApiProperty {
    name: string
    type: string
    default?: string
    required?: boolean
    description?: string
}

interface ApiEvent {
    name: string
    type: string
    description?: string
}

interface ApiSlot {
    name: string
    type: string
    description?: string
}

interface ComponentMeta {
    props: ApiProperty[]
    events: ApiEvent[]
    slots: ApiSlot[]
    exposed: ApiProperty[]
}

const props = defineProps<{ name: string }>()

const { localeIndex } = useData()

const LABELS: Record<string, Record<string, string>> = {
    root: {
        name: '名称',
        description: '说明',
        type: '类型',
        default: '默认值',
        params: '参数',
        required: '必填',
        legend: '带 * 的为必填项。',
        missing: '未找到组件元数据：',
    },
    'en-US': {
        name: 'Name',
        description: 'Description',
        type: 'Type',
        default: 'Default',
        params: 'Parameters',
        required: 'Required',
        legend: 'Fields marked with * are required.',
        missing: 'No component metadata found: ',
    },
}

const labels = computed(() => LABELS[localeIndex.value] ?? LABELS.root)

const meta = computed<ComponentMeta | undefined>(
    () => (metaData as Record<string, ComponentMeta>)[props.name],
)
</script>

<template>
    <section v-if="meta" class="component-api">
        <h2>API</h2>

        <template v-if="meta.props.length">
            <h3>Props</h3>
            <table>
                <thead>
                    <tr>
                        <th scope="col">
                            {{ labels.name }}
                        </th>
                        <th scope="col">
                            {{ labels.description }}
                        </th>
                        <th scope="col">
                            {{ labels.type }}
                        </th>
                        <th scope="col">
                            {{ labels.default }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in meta.props" :key="item.name">
                        <td>
                            <code>{{ item.name }}</code>
                            <span
                                v-if="item.required"
                                class="component-api__required"
                                :title="labels.required"
                            >
                                *
                            </span>
                        </td>
                        <td>{{ item.description }}</td>
                        <td>
                            <code>{{ item.type }}</code>
                        </td>
                        <td>
                            <code>{{ item.default ?? '—' }}</code>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p class="component-api__legend">
                {{ labels.legend }}
            </p>
        </template>

        <template v-if="meta.events.length">
            <h3>Events</h3>
            <table>
                <thead>
                    <tr>
                        <th scope="col">
                            {{ labels.name }}
                        </th>
                        <th scope="col">
                            {{ labels.description }}
                        </th>
                        <th scope="col">
                            {{ labels.params }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in meta.events" :key="item.name">
                        <td>
                            <code>{{ item.name }}</code>
                        </td>
                        <td>{{ item.description || '—' }}</td>
                        <td>
                            <code>{{ item.type }}</code>
                        </td>
                    </tr>
                </tbody>
            </table>
        </template>

        <template v-if="meta.slots.length">
            <h3>Slots</h3>
            <table>
                <thead>
                    <tr>
                        <th scope="col">
                            {{ labels.name }}
                        </th>
                        <th scope="col">
                            {{ labels.description }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in meta.slots" :key="item.name">
                        <td>
                            <code>{{ item.name }}</code>
                        </td>
                        <td>{{ item.description || '—' }}</td>
                    </tr>
                </tbody>
            </table>
        </template>

        <template v-if="meta.exposed.length">
            <h3>Exposed</h3>
            <table>
                <thead>
                    <tr>
                        <th scope="col">
                            {{ labels.name }}
                        </th>
                        <th scope="col">
                            {{ labels.type }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in meta.exposed" :key="item.name">
                        <td>
                            <code>{{ item.name }}</code>
                        </td>
                        <td>
                            <code>{{ item.type }}</code>
                        </td>
                    </tr>
                </tbody>
            </table>
        </template>
    </section>

    <p v-else class="component-api__missing">
        {{ labels.missing }}<code>{{ name }}</code>
    </p>
</template>

<style scoped>
.component-api {
    margin-top: 24px;
}

.component-api__required {
    margin-left: 4px;
    color: var(--vp-c-danger-1);
}

.component-api__legend,
.component-api__missing {
    font-size: 13px;
    color: var(--vp-c-text-2);
}
</style>
