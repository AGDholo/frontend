<template>
    <v-card flat
            :max-width="hoverMode ? 400 : undefined">
        <div class="mb-1 text-center mt-2" v-if="!compactMode && avatarURL">
            <v-avatar size="100" tile class="avatarDiv">
                <v-img :src="avatarURL" alt="Avatar" />
            </v-avatar>
        </div>
        <v-row justify="center">
            <v-col v-if="compactMode && avatarURL" style="max-width: 110px" align-self="center">
                <v-avatar size="100" tile class="avatarDiv">
                    <v-img :src="avatarURL" alt="Avatar" />
                </v-avatar>
            </v-col>
            <v-col align-self="center">
                <div class="mb-1 mt-1" :class="{'headline': !compactMode, 'text-center': !compactMode}">
                    <RouterLink :to="'/users/' + userPreview.handle" class="text-decoration-none">
                        <span v-if="userPreview.full_name">
                            {{userPreview.full_name}}
                        </span>
                        <span v-else>
                            @{{userPreview.handle}}
                        </span>
                    </RouterLink>

                    <span v-if="userPreview.full_name" class="grey--text">
                        (@{{userPreview.handle}})
                    </span>
                </div>

                <div v-if="userPreview.personal_introduction"
                     class="secondary--text"
                     :class="{'text-center': !compactMode, 'text-caption': compactMode }">
                    <span v-if="hoverMode">{{ shortIntro(userPreview.personal_introduction) }}</span>
                    <span v-else>{{ userPreview.personal_introduction }}</span>
                </div>

                <template v-if="follows">
                    <v-row v-if="compactMode">
                        <v-col>
                            <RouterLink class="text-decoration-none mr-2 text-caption"
                            :to="`/users/${userPreview.handle}?tab=followers`" v-if="loggedIn">
                                {{$t('有n个关注者', { count: follows.followers_count }) }}
                            </RouterLink>
                            <span v-else>
                                {{$t('有n个关注者', { count: follows.followers_count }) }}
                            </span>

                            <RouterLink class="text-decoration-none text-caption"
                            :to="`/users/${userPreview.handle}?tab=followed`" v-if="loggedIn">
                                {{ $t('关注了n个人', { count: follows.followed_count }) }}
                            </RouterLink>
                            <span v-else>
                                {{ $t('关注了n个人', { count: follows.followed_count }) }}
                            </span>
                        </v-col>
                    </v-row>
                    <v-row v-else class="mt-3">
                        <v-col class="text-center">
                            <RouterLink class="text-decoration-none"
                            :to="`/users/${userPreview.handle}?tab=followers`" v-if="loggedIn">
                                {{$t('有n个关注者', { count: follows.followers_count }) }}
                            </RouterLink>
                            <span v-else>
                                {{$t('有n个关注者', { count: follows.followers_count }) }}
                            </span>
                        </v-col>
                        <v-col class="text-center">
                            <RouterLink class="text-decoration-none"
                            :to="`/users/${userPreview.handle}?tab=followed`" v-if="loggedIn">
                                {{ $t('关注了n个人', { count: follows.followed_count }) }}
                            </RouterLink>
                            <span v-else>
                                {{ $t('关注了n个人', { count: follows.followed_count }) }}
                            </span>
                        </v-col>
                        <v-col class="text-center">
                            <span>
                                {{ $t('Karma') }}: {{ userPreview.karma }}
                            </span>
                        </v-col>
                    </v-row>

                    <v-row class="compact-row">
                        <v-col v-if="currentUserId != userPreview.uuid" :class="{'text-center': !compactMode}">
                            <v-btn depressed @click="cancelFollow" v-if="follows.followed_by_me" small
                                   :disabled="cancelFollowIntermediate">
                                {{$t('取消关注')}}
                                <v-progress-circular :size="20" indeterminate v-show="cancelFollowIntermediate" />
                            </v-btn>
                            <v-btn depressed @click="follow" :disabled="followIntermediate" color="primary" small v-else>
                                {{$t('关注')}}
                                <v-progress-circular :size="20" indeterminate color="primary" v-show="followIntermediate" />
                            </v-btn>

                            <v-btn depressed small class="ml-2"
                                   @click="privateMessage" :disabled="privateMessageIntermediate">
                                {{$t('私信')}}
                            </v-btn>
                        </v-col>
                    </v-row>
                </template>
                <v-skeleton-loader type="text" v-else />
            </v-col>
        </v-row>
        <div class="text-center mt-5" v-if="userPublic && userPublic.profile_view_times">
            <span class="text-caption grey--text ma-2">
            {{ $t('这个主页被浏览了n次', { times: userPublic.profile_view_times }) }}
            </span>
        </div>
    </v-card>
</template>

<script lang="ts">
import { IUserFollows, IUserPreview, IUserPublic } from '@/interfaces';
import { api } from '@/api';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiMe } from '@/api/me';
import { commitSetShowLoginPrompt } from '@/store/main/mutations';
import { readIsLoggedIn } from '@/store/main/getters';

@Component({
    name: 'UserCard',
})
export default class UserCard extends Vue {
    get currentUserId() {
        if (!this.$store.state.main.userProfile) {
            return null;
        }
        return this.$store.state.main.userProfile.uuid;
    }

    get loggedIn() {
        return readIsLoggedIn(this.$store);
    }

    @Prop() public readonly userPreview!: IUserPreview;
    @Prop() public readonly userPublic: IUserPublic | undefined;
    @Prop({ default: false }) public readonly compactMode!: boolean;
    @Prop({ default: false }) public readonly hoverMode!: boolean;

    private loading = true;
    private follows: IUserFollows | null = null;

    private followIntermediate = false;
    private cancelFollowIntermediate = false;
    private privateMessageIntermediate = false;
    private avatarURL: string | null = null;

    private shortIntro(intro: string) {
        if (!intro) {
            return intro;
        }
        if (intro.length > 25) {
            return intro.substring(0, 25) + '...';
        }
        return intro;
    }

    private async mounted() {
        if (this.userPublic && this.userPublic.gif_avatar_url) {
            this.avatarURL = this.userPublic.gif_avatar_url;
        } else if (this.userPreview.avatar_url) {
            this.avatarURL = this.userPreview.avatar_url;
        }
        await dispatchCaptureApiError(this.$store, async () => {
            this.follows = (await apiMe.getUserFollows(this.$store.state.main.token, this.userPreview.uuid)).data;
        });
        this.loading = false;
    }
    private async follow() {
        if (!this.currentUserId) {
            commitSetShowLoginPrompt(this.$store, true);
            return;
        }
        this.followIntermediate = true;
        if (this.userPreview !== null) {
            this.follows = (await apiMe.followUser(this.$store.state.main.token, this.userPreview.uuid)).data;
            this.followIntermediate = false;
        }
    }
    private async cancelFollow() {
        if (this.userPreview !== null) {
            this.cancelFollowIntermediate = true;
            await dispatchCaptureApiError(this.$store, async () => {
                this.follows = (await apiMe.cancelFollowUser(this.$store.state.main.token, this.userPreview.uuid)).data;
                this.cancelFollowIntermediate = false;
            });
        }
    }
    private async privateMessage() {
        if (!this.currentUserId) {
            commitSetShowLoginPrompt(this.$store, true);
            return;
        }
        this.privateMessageIntermediate = true;
        await dispatchCaptureApiError(this.$store, async () => {
            const r0 = await api.createChannel(this.$store.state.main.token, {
                private_with_user_uuid: this.userPreview.uuid,
            });
            const channelId = r0.data.id;
            this.$router.push(`/channels/${channelId}`);
        });
    }
}
</script>

<style scoped>
.compact-row {
    margin-top: 0 !important;
}
</style>