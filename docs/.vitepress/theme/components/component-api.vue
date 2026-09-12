<script setup lang="ts">
import { computed } from 'vue'
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
                            名称
                        </th>
                        <th scope="col">
                            说明
                        </th>
                        <th scope="col">
                            类型
                        </th>
                        <th scope="col">
                            默认值
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
                                title="必填"
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
                带 * 的为必填项。
            </p>
        </template>

        <template v-if="meta.events.length">
            <h3>Events</h3>
            <table>
                <thead>
                    <tr>
                        <th scope="col">
                            名称
                        </th>
                        <th scope="col">
                            说明
                        </th>
                        <th scope="col">
                            参数
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
                            名称
                        </th>
                        <th scope="col">
                            说明
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
                            名称
                        </th>
                        <th scope="col">
                            类型
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
        未找到组件元数据：<code>{{ name }}</code>
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
