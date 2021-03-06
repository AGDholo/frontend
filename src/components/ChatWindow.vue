<template>
    <div v-if="loading">
        <v-progress-linear indeterminate />
    </div>
    <div v-else>
        <div v-if="messages.length === 0">
            {{$t('暂无历史消息')}}
        </div>
        <v-list-item v-for="message in messages" :key="message.id">
            <v-list-item-content>
                <v-list-item-title>
                    <v-card class="blue-grey lighten-5 pa-2" min-width="40%"
                            v-bind:class="[ message.author.uuid === currentUserId ? 'float-right' : 'float-left']" >
                        <UserLink :userPreview="message.author" v-if="message.author.uuid !== currentUserId" />
                        <span v-else>{{$t('我')}}</span>:
                        <SimpleViewer :body="message.body" />
                        <span class="ml-2 float-right text-caption grey--text">
                            {{ $dayjs.utc(message.created_at).local().fromNow() }}
                        </span>
                    </v-card>
                </v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <div class="ma-4">
            <v-textarea outlined :label="$t('新消息')" v-model="messageCreate.body" :disabled="sendMsgIntermediate" />
            <div class="d-flex">
                <v-spacer />
                <v-btn @click="commitNewMessage" color="primary" :disabled="sendMsgIntermediate">
                    发送
                    <v-progress-circular indeterminate size="20" v-show="sendMsgIntermediate" />
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { api } from '@/api';
import { IChannel, IMessage, IMessageCreate } from '@/interfaces';
import ChannelCard from '@/components/ChannelCard.vue';
import UserLink from '@/components/UserLink.vue';
import SimpleViewer from '@/components/SimpleViewer.vue';
import ChannelIcon from '@/components/icons/ChannelIcon.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';

@Component({
    components: { UserLink, ChannelCard, ChannelIcon, SimpleViewer },
})
export default class ChatWindow extends Vue {
    get currentUserId() {
        return this.$store.state.main.userProfile.uuid;
    }
    get token() { return this.$store.state.main.token; }
    @Prop() public readonly channel!: IChannel;

    private messages: IMessage[] = [];
    private messageCreate: IMessageCreate = {
        channel_id: this.channel.id,
        body: '',
    };

    private loading = true;

    private sendMsgIntermediate = false;

    private async mounted() {
        await dispatchCaptureApiError(this.$store, async () => {
            this.messages = (await api.getChannelMessages(this.token, this.channel.id)).data;
            this.loading = false;
        });
    }
    private async commitNewMessage() {
        await dispatchCaptureApiError(this.$store, async () => {
            this.sendMsgIntermediate = true;
            const response = await api.createMessage(this.token, this.messageCreate);
            this.messages.push(response.data);
            this.messageCreate.body = '';
            this.sendMsgIntermediate = false;
        });
    }
}
</script>
