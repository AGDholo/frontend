<template>
    <div class="pa-3">
        <div class="mb-1">
            <div class="headline primary--text">{{ $t('My Circles') }}</div>
            <!-- TODO: rank/compute recently used sites. -->
            <div v-if="$vuetify.breakpoint.mdAndUp">
                <SiteBtn :site="profile.site" v-for="profile in siteProfiles" :key="profile.site.uuid" />
            </div>
            <v-slide-group v-else>
                <v-slide-item v-for="profile in siteProfiles" :key="profile.site.uuid">
                    <SiteBtn :site="profile.site" />
                </v-slide-item>
            </v-slide-group>

            <v-skeleton-loader type="paragraph" v-if="loadingSites" />
            <div class="d-flex mt-2" v-else>
                <v-btn small color="primary" class="ml-1" to="/sites">{{$t('查看所有圈子')}}</v-btn>
                <v-btn small class="ml-2" @click="showCreateSiteDialog = true">{{ $t('创建圈子') }}</v-btn>

                <v-dialog max-width="500" v-model="showCreateSiteDialog">
                    <CreateSiteCard />
                </v-dialog>
            </div>
        </div>

        <div class="mb-3 mt-3">
            <div class="headline primary--text">{{ $t('Pinned questions') }}</div>
            <v-skeleton-loader type="paragraph" v-if="questions === null" />
            <ul v-else>
                <li v-for="question in questions" :key="question.uuid">
                    <QuestionLink :questionPreview="question" />
                </li>
            </ul>
        </div>
        <v-divider />
        <div class="mt-6">
            <div><a class="text-decoration-none" href="https://about.cha.fan" target="_blank">关于 Chafan</a></div>
            <div><a class="text-decoration-none" href="https://about.cha.fan/docs/code-of-conduct" target="_blank">社区行为守则 (Code of Conduct)</a></div>
            <div><a class="text-decoration-none" href="https://about.cha.fan/docs/report" target="_blank">如何举报不符合规范的内容</a></div>
            <div v-if="loggedIn"><a class="text-decoration-none" href="https://discord.gg/yFt5QP3zU7" target="_blank">Discord 闲聊群</a></div>
        </div>
    </div>
</template>

<script lang="ts">
import { IQuestionPreview, IUserSiteProfile } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import QuestionLink from '@/components/QuestionLink.vue';
import CreateSiteCard from '@/components/CreateSiteCard.vue';
import { Component, Vue } from 'vue-property-decorator';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { api2 } from '@/api2';
import { apiMe } from '@/api/me';
import { readIsLoggedIn } from '@/store/main/getters';

@Component({
    components: { SiteBtn, QuestionLink, CreateSiteCard },
})
export default class ExploreCard extends Vue {
    private siteProfiles: IUserSiteProfile[] = [];
    private questions: IQuestionPreview[] | null = null;
    private loadingSites = true;

    private showCreateSiteDialog = false;

    get loggedIn() {
        return readIsLoggedIn(this.$store);
    }

    public async mounted() {
        await dispatchCaptureApiError(this.$store, async () => {
            this.questions = (await api2.getQuestionsAtHome()).data;
            if (this.$store.state.main.token) {
                this.siteProfiles = (await apiMe.getUserSiteProfiles(this.$store.state.main.token)).data;
            }
            this.loadingSites = false;
        });
    }
}
</script>