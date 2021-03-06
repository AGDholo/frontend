<template>
    <v-container fluid>
        <v-progress-linear
            v-if="loading"
            v-model="loadingProgress"
            :indeterminate="loadingProgress === 0" />
        <v-row v-else>
            <v-col :class="{'col-8': $vuetify.breakpoint.mdAndUp,
                            'less-left-right-padding': !$vuetify.breakpoint.mdAndUp }"  class="mb-12" fluid>
                <!-- Question info/editor -->
                <div>
                    <!-- Question topics display/editor -->
                    <v-chip-group v-if="!showQuestionEditor">
                        <v-chip :to="'/topics/' + topic.uuid" v-for="topic in question.topics" :key="topic.uuid">
                            {{ topic.name }}
                        </v-chip>
                    </v-chip-group>
                    <v-combobox hide-selected multiple small-chips
                                :label="$t('Topics')"
                                :items="hintTopicNames"
                                :delimiters="[',', '，', '、']"
                                v-if="showQuestionEditor"
                                v-model="newQuestionTopicNames" />

                    <!-- Question title display/editor -->
                    <div>
                        <div class="headline primary--text" v-if="!showQuestionEditor">
                            <RouterLink class="text-decoration-none" :to="`/questions/${this.question.uuid}`">
                                {{ question.title }}
                            </RouterLink>
                        </div>
                        <v-textarea auto-grow dense rows="1"
                                    :label="$t('Title')" v-model="newQuestionTitle" v-else />
                    </div>

                    <!-- Question description display/editor -->
                    <SimpleViewer v-if="!showQuestionEditor && question.description" :body="question.description" />
                    <div v-else-if="showQuestionEditor">
                        <SimpleEditor :placeholder="$t('Description')" ref="descEditor" class="mb-2"
                                      :initialValue="question.description" />
                    </div>
                </div>

                <!-- Question control -->
                <v-row justify="space-between">
                    <v-col class="d-flex" v-if="!showQuestionEditor">
                        <v-btn small class="ma-1 slim-btn" @click="goToCurrentUserAnswer"
                                v-if="currentUserAnswerUUID">
                                {{$t('我的回答')}}
                        </v-btn>
                        <v-btn small color="primary" class="ma-1 slim-btn" @click="showEditor = !showEditor"
                                v-else-if="answerWritable">{{$t('写回答')}}</v-btn>
                        <v-tooltip bottom v-else>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn small
                                        class="ma-1 slim-btn grey--text" v-bind="attrs" v-on="on"
                                        elevation="0" plain :ripple="false">
                                    {{$t('写回答')}}
                                </v-btn>
                            </template>
                            <span>{{$t('该圈子仅会员可以写回答')}}</span>
                        </v-tooltip>

                        <v-btn small class="ma-1 slim-btn" @click="toggleShowComments">
                            <CommentsIcon class="mr-1" small />
                            <span v-if="$vuetify.breakpoint.mdAndUp">
                                {{question.comments.length === 0 ? $t('评论') : $t('查看n条评论', {amount: question.comments.length})}}
                            </span>
                            <span v-else-if="question.comments.length"> {{question.comments.length}}</span>
                        </v-btn>

                        <v-dialog max-width="300" v-model="showCancelUpvoteDialog">
                            <v-card>
                                <v-card-title primary-title>
                                    <div class="headline primary--text">{{$t('确定取消标记为好问题？')}}</div>
                                </v-card-title>
                            <v-card-actions>
                                <v-spacer />
                                <v-btn @click="showCancelUpvoteDialog = false">{{$t('No')}}</v-btn>
                                <v-btn color="warning" @click="cancelUpvote" :disabled='cancelUpvoteIntermediate'>
                                    {{$t('Yes')}}
                                </v-btn>
                            </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <v-btn @click="showCancelUpvoteDialog = true"
                                small class="slim-btn ma-1"
                                color="primary lighten-2" v-if="upvotes && upvotes.upvoted">
                            <UpvoteIcon />
                            <span v-if="$vuetify.breakpoint.mdAndUp">{{$t('好问题')}}</span>
                            ({{ upvotes.count }})
                        </v-btn>
                        <v-btn small class="slim-btn ma-1"
                                color="primary" @click="upvote" v-else-if="upvotes"
                                :disabled="userProfile.uuid === question.author.uuid || upvoteIntermediate">
                            <UpvoteIcon />
                            <span v-if="$vuetify.breakpoint.mdAndUp">{{$t('好问题')}}</span>
                            ({{ upvotes.count }})
                        </v-btn>

                        <BookmarkedIcon class="ma-1" @click="cancelSubscription"
                                        :disabled="cancelSubscriptionIntermediate"
                                        v-if="questionSubscription && questionSubscription.subscribed_by_me" />
                        <ToBookmarkIcon class="ma-1" @click="subscribe" v-else :disabled="subscribeIntermediate" />
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <div v-bind="attrs" v-on="on" align-self="center" class="d-flex">
                                    <EditIcon @click="showQuestionEditor = true" v-show="editable" />
                                </div>
                            </template>
                            <span>{{ $t('编辑问题') }}</span>
                        </v-tooltip>
                    </v-col>

                    <v-col v-if="!showQuestionEditor"
                           :class="{'col-12': !$vuetify.breakpoint.mdAndUp,
                                    'less-top-padding': !$vuetify.breakpoint.mdAndUp}"
                           class="d-flex" align-self="center">
                        <v-spacer />
                        <SiteBtn :site="question.site" class="elevation-0"/>
                        <HistoryIcon @click="showHistoryDialog" v-if="editable && userProfile" />
                    </v-col>

                    <v-col v-if="showQuestionEditor && userProfile" class="d-flex">
                        <v-btn small class="ma-1 slim-btn" @click="commitQuestionEdit" color="primary" v-show="editable"
                            :disabled="commitQuestionEditIntermediate">{{$t('更新问题描述')}}</v-btn>
                        <v-btn small class="ma-1 slim-btn" @click="showQuestionEditor = false"
                                color="warning" v-show="editable">{{$t('取消更新')}}</v-btn>
                        <v-spacer />
                        <v-btn v-if="showQuestionEditor" @click="prepareShowMoveQuestionDialog">
                            {{$t('转移问题')}}
                        </v-btn>
                        <v-dialog max-width="600" v-model="showMoveQuestionDialog">
                            <v-card>
                                <v-card-title primary-title>
                                    <div class="headline primary--text">{{$t('转移问题')}}</div>
                                </v-card-title>
                                <v-card-text>
                                    <span>{{ $t('现问题所属圈子') }}: {{ question.site.name }}</span>
                                    <v-select :label="$t('新的圈子')" :items="siteProfiles"
                                              item-value="site" item-text="site.name" v-model="newQuestionSite" />
                                </v-card-text>
                                <v-card-actions>
                                    <span>{{ $t('没有权限？联系管理员帮助转移') }}</span>
                                    <v-spacer />
                                    <v-btn color="warning" @click="confirmMoveQuestion">{{ $t('确认转移') }}</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>

                        <v-btn v-if="showQuestionEditor & canHide" color="warning" class="ml-2"
                               @click="showConfirmHideQuestionDialog = true">
                            {{$t('隐藏问题')}}
                        </v-btn>
                        <v-dialog max-width="600" v-model="showConfirmHideQuestionDialog">
                            <v-card>
                                <v-card-title primary-title>
                                    <div class="headline primary--text">{{$t('确认隐藏问题？')}}</div>
                                </v-card-title>
                                <v-card-text>
                                    隐藏后问题将对所有用户不可见。
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer />
                                    <v-btn color="warning" @click="confirmHideQuestion">{{ $t('确认隐藏') }}</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-col>
                    <v-dialog max-width="900" v-model="historyDialog">
                        <v-card>
                            <v-card-title primary-title>
                                <div class="headline primary--text">{{$t('问题历史')}}</div>
                                <v-spacer></v-spacer>
                                <span class="text-caption grey--text">{{$t('点击展开')}}</span>
                            </v-card-title>
                            <v-expansion-panels>
                                <v-expansion-panel v-for="archive in archives" :key="archive.id">
                                    <v-expansion-panel-header>
                                        {{ $dayjs.utc(archive.created_at).local().fromNow() }}
                                        <span v-if="archive.editor"> - <UserLink :userPreview="archive.editor" /></span>
                                        <v-spacer />
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <v-chip-group>
                                            <v-chip :to="'/topics/' + topic.uuid" v-for="topic in archive.topics"
                                                    :key="topic.uuid">{{ topic.name }}</v-chip>
                                        </v-chip-group>
                                        <div class="headline primary--text">
                                            {{ archive.title }}
                                        </div>
                                        <SimpleViewer :body="archive.description" />
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </v-card>
                    </v-dialog>
                </v-row>

                <div v-show="isModerator && !isUserMode">
                    <v-row justify="end">
                        <v-col md="auto">
                            {{$t('管理：')}}
                            <!-- Moderator -->
                            <v-btn class="slim-btn ma-1" @click="toggleTopQuestoinInSite"
                                   color="warning" :disabled="toggleTopQuestoinInSiteIntermediate"
                                   v-if="isTopQuestionInSite">{{$t('取消圈子置顶')}}</v-btn>
                            <v-btn class="slim-btn ma-1" @click="toggleTopQuestoinInSite"
                                   color="warning" :disabled="toggleTopQuestoinInSiteIntermediate"
                                   v-else>{{$t('圈子置顶')}}</v-btn>
                        </v-col>
                    </v-row>
                </div>

                <div class="d-flex justify-end">
                    <ReactionBlock objectType="question" :objectId="question.uuid" />
                </div>

                <!-- Comments -->
                <v-expand-transition>
                    <CommentBlock v-show="showComments"
                                  :siteId="question.site ? question.site.uuid : undefined"
                                  commentLabel="评论问题"
                                  :commentSubmitIntermediate="commentSubmitIntermediate"
                                  :comments="question.comments"
                                  :writable="commentWritable"
                                  @submit-new-comment="submitNewQuestionCommentBody" />
                </v-expand-transition>

                <div class="ml-2 text-center">
                    <span class="text-caption grey--text" v-if="showEditor && userProfile">{{$t('编辑答案')}}</span>
                    <span class="text-caption grey--text"
                          v-else-if="loadedFullAnswers.length === 0 && answerPreviews.length === 0">{{$t('暂无答案')}}</span>
                </div>

                <!-- Answer editor -->
                <v-expand-transition v-if="userProfile">
                    <RichEditor class="ma-1" v-if="showEditor"
                                publishText="发表答案"
                                @submit-edit="newEditHandler"
                                @cancel-edit="cancelHandler"
                                @delete-draft="deleteDraft" />
                </v-expand-transition>

                <!-- Answers -->
                <Answer v-for="answer in loadedFullAnswers" :key="answer.uuid"
                        class="ma-2"
                        :answerPreview="answer"
                        :answerProp="answer"
                        :showAuthor="true"
                        :showQuestionInCard="false"
                        :showCommentId="answerCommentId"
                        @delete-answer="deleteHandler"
                        :loadFull="true" />
                <Answer v-for="answerPreview in answerPreviews" :key="answerPreview.uuid"
                        class="ma-2"
                        :answerPreview="answerPreview"
                        :showAuthor="true"
                        :showQuestionInCard="false"
                        :showCommentId="answerPreview.uuid === answerUUID ? answerCommentId : undefined"
                        @delete-answer="deleteHandler"
                        :loadFull="answerPreviews.indexOf(answerPreview) <= 2" />
            </v-col>

            <v-col class="col-4" v-if="$vuetify.breakpoint.mdAndUp">
                <QuestionCard :questionSubscription="questionSubscription"
                              :question="question"
                              :site="questionSite" />
            </v-col>
            <v-bottom-sheet v-else>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn fab fixed right bottom v-bind="attrs" v-on="on">
                        <InfoIcon />
                    </v-btn>
                </template>
                <v-sheet>
                    <QuestionCard :questionSubscription="questionSubscription"
                                  :question="question"
                                  :site="questionSite" />
                </v-sheet>
            </v-bottom-sheet>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import Answer from '@/components/Answer.vue';
import QuestionCard from '@/components/QuestionCard.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import ReactionBlock from '@/components/ReactionBlock.vue';
import CommentBlock from '@/components/CommentBlock.vue';
import UserLink from '@/components/UserLink.vue';

import BookmarkedIcon from '@/components/icons/BookmarkedIcon.vue';
import ToBookmarkIcon from '@/components/icons/ToBookmarkIcon.vue';
import HistoryIcon from '@/components/icons/HistoryIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import UpvoteIcon from '@/components/icons/UpvoteIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';

import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import { api } from '@/api';
import { apiAnswer } from '@/api/answer';
import { readIsLoggedIn, readUserMode, readUserProfile } from '@/store/main/getters';
import { IAnswer, IQuestion, IUserQuestionSubscription,
ISite, IUserSiteProfile, IAnswerPreview, IQuestionUpvotes,
IUserProfile, IQuestionArchive, INewEditEvent } from '@/interfaces';
import { newAnswerHandler } from '@/utils';
import SimpleViewer from '@/components/SimpleViewer.vue';
import SimpleEditor from '@/components/SimpleEditor.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiQuestion } from '@/api/question';
import { apiMe } from '@/api/me';
import { apiTopic } from '@/api/topic';
import { apiComment } from '@/api/comment';

@Component({
    components: {
        Answer, QuestionCard, CommentBlock, UserLink, EditIcon, UpvoteIcon,
        SiteBtn, ReactionBlock, BookmarkedIcon, ToBookmarkIcon, HistoryIcon,
        InfoIcon, CommentsIcon, SimpleViewer, SimpleEditor,
    },
})
export default class Question extends Vue {
    get isUserMode() {
        return readUserMode(this.$store);
    }
    get id() {
        return this.$router.currentRoute.params.id;
    }
    get answerUUID() {
        const aid = this.$router.currentRoute.params.aid;
        if (aid) {
            return aid;
        } else {
            return null;
        }
    }
    get answerCommentId() {
        const acid = this.$router.currentRoute.params.acid;
        if (acid) {
            return acid;
        } else {
            return null;
        }
    }
    get questionCommentId() {
        const qcid = this.$router.currentRoute.params.qcid;
        if (qcid) {
            return qcid;
        } else {
            return null;
        }
    }

    get token() { return this.$store.state.main.token; }
    private question: IQuestion | null = null;
    private showEditor: boolean = false;
    private newQuestionTitle: string = '';
    private showQuestionEditor: boolean = false;
    private showComments: boolean = false;
    private newAnswerBody: string = '';
    private questionSite: ISite | null = null;
    private userSiteProfile: IUserSiteProfile | null = null;
    private questionSubscription: IUserQuestionSubscription | null = null;
    private newQuestionTopicNames: string[] = [];
    private hintTopicNames: string[] = []; // TODO
    private answerWritable = false;
    private commentWritable = false;
    private answerPreviews: IAnswerPreview[] = [];
    private loadedFullAnswers: IAnswer[] = [];
    private editable = false;
    private canHide = false;
    private showConfirmHideQuestionDialog = false;

    private loadingProgress = 0;
    private loading = true;

    private isModerator = false;
    private toggleTopQuestoinInSiteIntermediate = false;
    private toggleShowInHomeIntermediate = false;
    private isTopQuestionInSite = false;
    private isShowInHome = false;
    private userProfile: IUserProfile | null = null;

    private commitQuestionEditIntermediate = false;
    private cancelSubscriptionIntermediate = false;
    private subscribeIntermediate = false;


    private showMoveQuestionDialog = false;

    private savedNewAnswer: IAnswer | null = null;

    private handlingNewEdit = false;

    private showCancelUpvoteDialog: boolean = false;
    private upvoteIntermediate: boolean = false;
    private cancelUpvoteIntermediate = false;
    private upvotes: IQuestionUpvotes | null = null;

    private archives: IQuestionArchive[] = [];
    private historyDialog = false;

    private siteProfiles: IUserSiteProfile[] = [];
    private newQuestionSite: ISite | null = null;
    private currentUserAnswerUUID: string | null = null;

    private commentSubmitIntermediate = false;

    private async mounted() {
        try {
            if (localStorage.getItem('new-question')) {
                this.showQuestionEditor = true;
                localStorage.removeItem('new-question');
            }
        } catch (e) {

        }

        try {
            const response = await api.getQuestion(this.token, this.id);
            this.question = response.data;
            if (!this.$route.query.title) {
                this.$router.replace({ query: { ...this.$route.query, title: this.question.title }});
            }
        } catch (err) {
            commitAddNotification(this.$store, {
                content: this.$t('问题不存在，返回主页').toString(),
                color: 'error',
            });
            this.$router.push('/');
        }

        await dispatchCaptureApiError(this.$store, async () => {
            if (this.question) {
                if (readIsLoggedIn(this.$store)) {
                    apiQuestion.bumpViewsCounter(this.token, this.question.uuid);
                    this.upvotes = {
                        question_uuid: this.question.uuid,
                        count: this.question.upvotes_count,
                        upvoted: this.question.upvoted,
                    };

                    if (this.questionCommentId !== null) {
                        this.showComments = true;
                    }

                    this.isTopQuestionInSite = this.question.is_placed_at_site_top;
                    this.isShowInHome = this.question.is_placed_at_home;

                    document.title = this.question.title;

                    this.loadingProgress = 33;

                    this.newQuestionTitle = this.question.title;
                    this.newQuestionTopicNames = this.question.topics.map((topic) => topic.name);
                    this.userProfile = readUserProfile(this.$store);
                    if (this.userProfile) {
                        if (this.userProfile.uuid === this.question.author.uuid) {
                            this.editable = true;
                            this.canHide = this.question.answers_count === 0;
                        }
                        const mod = this.question.site.moderator;
                        if (mod) {
                            this.isModerator = this.userProfile.uuid === mod.uuid;
                        }
                        if (this.isModerator) {
                            this.canHide = this.question.answers_count === 0;
                        }
                    }
                }
                await dispatchCaptureApiError(this.$store, async () => {
                    const answerPreviews = (await api.getQuestionAnswers(this.token, this.question!.uuid)).data;
                    if (this.answerUUID !== null) {
                        if (!answerPreviews.find((preview) => preview.uuid === this.answerUUID)) {
                            commitAddNotification(this.$store, {
                                content: this.$t('答案不存在').toString(),
                                color: 'error',
                            });
                        }
                    }
                    if (answerPreviews.length === 0 && !this.showQuestionEditor) {
                        this.showEditor = true;
                    }
                    this.answerPreviews = answerPreviews.sort((a, b) => {
                        if (a.uuid === this.answerUUID) {
                            return -1;
                        }
                        if (b.uuid === this.answerUUID) {
                            return 1;
                        }
                        if (a.author.uuid === this.userProfile?.uuid) {
                            this.currentUserAnswerUUID = a.uuid;
                            return -1;
                        }
                        if (b.author.uuid === this.userProfile?.uuid) {
                            this.currentUserAnswerUUID = b.uuid;
                            return 1;
                        }
                        if (a.is_placed_at_question_top) {
                            return -1;
                        }
                        if (b.is_placed_at_question_top) {
                            return 1;
                        }
                        if (a.upvotes_count > b.upvotes_count) {
                            return -1;
                        }
                        return 1;
                    });
                    this.loadingProgress = 66;

                    if (this.userProfile) {
                        this.questionSite = (await api.getSite(this.token, this.question!.site.subdomain)).data;

                        this.userSiteProfile = (await api.getUserSiteProfile(
                            this.token, this.questionSite.uuid, this.userProfile.uuid)).data;
                        if (this.userSiteProfile) {
                            this.editable = true;
                        }
                        if (this.userSiteProfile !== null || this.questionSite.public_writable_answer) {
                            this.answerWritable = true;
                        }
                        if (this.userSiteProfile !== null || this.questionSite.public_writable_comment) {
                            this.commentWritable = true;
                        }
                        this.questionSubscription = (await apiMe.getQuestionSubscription(this.token, this.question!.uuid)).data;
                    }

                    this.loadingProgress = 100;
                    this.loading = false;
                });
            }
        });
    }
    // FIXME: how to combine it with the logic in newEditHandler?
    private async newEditHandler(payload: INewEditEvent) {
        if (this.handlingNewEdit) {
            return;
        }
        this.handlingNewEdit = true;
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.question) {
                if (payload.answerId) {
                    const response = await apiAnswer.updateAnswer(this.token, payload.answerId,
                        {
                            updated_body: payload.edit.body,
                            source_format: payload.edit.source_format,
                            editor: payload.edit.editor,
                            math_enabled: payload.edit.math_enabled,
                            is_draft: payload.edit.is_draft,
                        });
                    this.savedNewAnswer = response.data;
                    payload.saveCallback(response.data);
                    if (!payload.isAutosaved) {
                        commitAddNotification(this.$store, {
                            content: this.$t(payload.edit.is_draft ? '答案草稿已更新' : '更新已发表').toString(),
                            color: 'success',
                        });
                        this.showEditor = false;
                        const answerUUIDx = this.loadedFullAnswers.findIndex(
                            (answer) => answer.uuid === response.data.uuid);
                        if (answerUUIDx === -1) {
                            this.loadedFullAnswers.unshift(response.data);
                        } else {
                            this.loadedFullAnswers[answerUUIDx] = (response.data);
                        }
                    }
                } else {
                    const newAnswer = await newAnswerHandler(this, payload.edit, payload.writingSessionUUID,
                                            payload.isAutosaved, this.question.uuid);
                    if (newAnswer) {
                        payload.saveCallback(newAnswer);
                        this.savedNewAnswer = newAnswer;
                        if (!payload.isAutosaved) {
                            commitAddNotification(this.$store, {
                                content: this.$t(payload.edit.is_draft ? '草稿已保存' : '已发表').toString(),
                                color: 'success',
                            });
                            this.loadedFullAnswers.unshift(newAnswer);
                            this.showEditor = false;
                        }
                    }
                }
            }
            this.handlingNewEdit = false;
        });
    }
    private async submitNewQuestionCommentBody(commentBody: string) {
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.question) {
                this.commentSubmitIntermediate = true;
                const response = await apiComment.postComment(this.token, {
                    site_uuid: this.question?.site.uuid,
                    question_uuid: this.id,
                    body: commentBody,
                });
                const comment = response.data;
                this.question.comments.push(comment);
                this.commentSubmitIntermediate = false;
            }
        });
    }

    private async commitQuestionEdit() {
        this.commitQuestionEditIntermediate = true;
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.question) {
                const responses = await Promise.all(
                    this.newQuestionTopicNames.map((name) => apiTopic.createTopic(this.token, { name })));
                const topicsUUIDs = responses.map((r) => r.data.uuid);
                const descEditor = this.$refs.descEditor as SimpleEditor;
                const response = await api.updateQuestion(this.token, this.question.uuid, {
                    title: this.newQuestionTitle,
                    description: descEditor.content,
                    topic_uuids: topicsUUIDs,
                });
                if (response) {
                    this.question = response.data;
                }
            }
            this.commitQuestionEditIntermediate = false;
            this.showQuestionEditor = false;
        });
    }
    private async cancelSubscription() {
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.question) {
                this.cancelSubscriptionIntermediate = true;
                const r = await apiMe.unsubscribeQuestion(this.token, this.question.uuid);
                this.questionSubscription = r.data;
                this.cancelSubscriptionIntermediate = false;
            }
        });
    }
    private async subscribe() {
        if (!this.userProfile) {
            commitSetShowLoginPrompt(this.$store, true);
            return;
        }
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.question) {
                this.subscribeIntermediate = true;
                const r = await apiMe.subscribeQuestion(this.token, this.question.uuid);
                this.questionSubscription = r.data;
                this.subscribeIntermediate = false;
            }
        });
    }

    private async upvote() {
        this.upvoteIntermediate = true;
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.question) {
                this.upvotes = (await apiQuestion.upvoteQuestion(this.token, this.question.uuid)).data;
                this.upvoteIntermediate = false;
            }
        });
    }

    private async cancelUpvote() {
        this.cancelUpvoteIntermediate = true;
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.question) {
                this.upvotes = (await apiQuestion.cancelUpvoteQuestion(this.token, this.question.uuid)).data;
                this.cancelUpvoteIntermediate = false;
                this.showCancelUpvoteDialog = false;
            }
        });
    }

    private async toggleTopQuestoinInSite() {
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.question) {
                this.toggleTopQuestoinInSiteIntermediate = true;
                await api.updateQuestionByMod(this.token, this.question.uuid, {
                    is_placed_at_site_top: !this.isTopQuestionInSite,
                });
                this.toggleTopQuestoinInSiteIntermediate = false;
                this.isTopQuestionInSite = !this.isTopQuestionInSite;
            }
        });
    }

    private async showHistoryDialog() {
        if (this.question) {
            this.archives = (await apiQuestion.getQuestionArchives(this.token, this.question.uuid)).data;
            this.archives.unshift({
                id: 0,
                title: this.question.title,
                description: this.question.description,
                topics: this.question.topics,
                created_at: this.question.updated_at,
                editor: this.question.editor,
            });
            if (this.archives.length > 0) {
                this.historyDialog = true;
            } else {
                commitAddNotification(this.$store, {
                    content: this.$t('尚无历史存档').toString(),
                    color: 'info',
                });
            }
        }
    }

    private cancelHandler() {
        this.showEditor = false;
        if (this.question && this.savedNewAnswer) {
            this.loadedFullAnswers.unshift(this.savedNewAnswer);
        }
    }

    private async deleteDraft() {
        if (this.savedNewAnswer) {
            await apiAnswer.deleteAnswerDraft(this.token, this.savedNewAnswer.uuid);
            commitAddNotification(this.$store, {
                content: this.$t('草稿已删除').toString(),
                color: 'success',
            });
            this.showEditor = false;
        } else {
            commitAddNotification(this.$store, {
                content: this.$t('无法删除草稿').toString(),
                color: 'success',
            });
        }
    }

    private removeAnswer(answerUUID: string) {
        let idx = this.loadedFullAnswers.findIndex((answer) => answer.uuid === answerUUID);
        if (idx !== -1) {
            this.loadedFullAnswers.splice(idx, 1);
        }
        idx = this.answerPreviews.findIndex((answer) => answer.uuid === answerUUID);
        if (idx !== -1) {
            this.answerPreviews.splice(idx, 1);
        }
    }

    private deleteHandler(answerUUID: string) {
        this.removeAnswer(answerUUID);
        if (this.answerUUID === answerUUID) {
            this.$router.push(`/questions/${this.question?.uuid}`);
        }
    }
    private async prepareShowMoveQuestionDialog() {
        this.siteProfiles = (await apiMe.getUserSiteProfiles(this.token)).data;
        this.showMoveQuestionDialog = true;
    }

    private async confirmMoveQuestion() {
        if (this.question) {
            if (!this.newQuestionSite) {
                commitAddNotification(this.$store, {
                    content: this.$t('未选择新的圈子').toString(),
                    color: 'info',
                });
            }
            if (this.question.site.uuid === this.newQuestionSite?.uuid) {
                commitAddNotification(this.$store, {
                    content: this.$t('没有变化').toString(),
                    color: 'info',
                });
            }
            await dispatchCaptureApiError(this.$store, async () => {
                this.question = (await apiQuestion.moveQuestion(
                    this.$store.state.main.token, this.question!.uuid, this.newQuestionSite!.uuid)).data;
                commitAddNotification(this.$store, {
                    content: this.$t('转移成功').toString(),
                    color: 'success',
                });
                this.showMoveQuestionDialog = false;
                this.showQuestionEditor = false;
            });
        }
    }

    private async confirmHideQuestion() {
        await dispatchCaptureApiError(this.$store, async () => {
            await apiQuestion.hideQuestion(this.$store.state.main.token, this.question!.uuid);
            commitAddNotification(this.$store, {
                content: this.$t('已隐藏').toString(),
                color: 'info',
            });
            this.$router.push(`/sites/${this.question!.site.subdomain}`);
        });
    }

    private async goToCurrentUserAnswer() {
        if (this.currentUserAnswerUUID) {
            this.$router.push(`/questions/${this.question?.uuid}/answers/${this.currentUserAnswerUUID}`);
            this.removeAnswer(this.currentUserAnswerUUID);
            const answer = (await apiAnswer.getAnswer(this.token, this.currentUserAnswerUUID)).data;
            this.loadedFullAnswers.unshift(answer);
        }
    }

    private toggleShowComments() {
        if (!this.userProfile && this.question!.comments.length === 0) {
            commitSetShowLoginPrompt(this.$store, true);
            return;
        }
        this.showComments = !this.showComments;
    }
}
</script>

<style scoped>
.slim-btn {
    padding: 0 4px !important;
}

.less-top-padding {
    padding-top: 0 !important;
}

.less-left-right-padding {
    padding-left: 6px !important;
    padding-right: 6px !important;
}
</style>