<template>
    <v-card flat
            :loading="loading" v-if="!showEditor && !loading">
        <div v-if="isHiddenByMod">
            <v-card-text>{{$t('内容已被管理员隐藏')}}</v-card-text>
        </div>
        <div v-else>
            <div v-if="showQuestionInCard" class="title mb-2 d-flex">
                <QuestionLink :questionPreview="answerPreview.question" />
            </div>
            <div v-if="preview || !answer" @click="expandDown" style="cursor: pointer">
                <span v-show="showAuthor">
                    <UserLink :userPreview="answerPreview.author" :showAvatar="true" />:
                </span>
                {{ answerPreviewBody }}
                <a @click="expandDown">
                    {{$t('展开全文')}}
                </a>
            </div>
            <div v-if="answer" :hidden="preview">
                <div v-if="showAuthor" class="d-flex align-center">
                    <UserLink :userPreview="answer.author" :showAvatar="true" v-show="!preview" />
                    <span class="grey--text ml-2" v-if="answer.author.personal_introduction"
                          :class="{'text-caption': !$vuetify.breakpoint.mdAndUp}">
                        {{truncatedIntro(answer.author.personal_introduction)}}
                    </span>
                    <v-spacer />
                    <span v-if="$vuetify.breakpoint.mdAndUp" class="text-caption grey--text mr-3">
                        {{$t('上次编辑：')}} {{ $dayjs.utc(answer.updated_at).local().fromNow() }}
                    </span>
                </div>

                <div class="mt-2 mb-1">
                    <v-chip small class="ml-2" color="warning" v-if="answer && !answer.is_published">
                        {{$t('此为初稿仅自己可见')}}
                    </v-chip>
                    <v-chip small class="ml-2" color="info" v-else-if="showHasDraftBadge">
                        {{$t('编辑器中有未发表的草稿')}}
                    </v-chip>
                    <Viewer :body="answer.body" class="vditor-preview" v-intersect.once="onReadFullAnswer" />
                </div>

                <div v-if="userBookmark" fluid>
                    <v-row>
                        <v-col class="d-flex" align-self="end">
                            <v-dialog max-width="300" v-model="showCancelUpvoteDialog">
                                <v-card>
                                    <v-card-title primary-title>
                                        <div class="headline">{{$t('确定收回点赞？')}}</div>
                                    </v-card-title>

                                <v-card-actions>
                                    <v-spacer />
                                    <v-btn outlined @click="showCancelUpvoteDialog = false">{{$t('No')}}</v-btn>
                                    <v-btn color="error" @click="cancelUpvote" :disabled='cancelUpvoteIntermediate'>{{$t('Yes')}}</v-btn>
                                </v-card-actions>
                                </v-card>
                            </v-dialog>

                          <div class="d-flex">
                            <v-btn depressed @click="showCancelUpvoteDialog = true"  color="primary lighten-2" v-if="upvotes && upvotes.upvoted">
                              {{$t('已赞')}} ({{ upvotes.count }})
                            </v-btn>
                            <v-btn depressed class="slim-btn ma-1" color="primary"
                                   @click="upvote" v-else :disabled="currentUserIsAuthor || upvoteIntermediate">
                              {{$t('赞')}} ({{ upvotes.count }})
                            </v-btn>

                            <v-btn depressed class="mx-1" @click="toggleShowComments">
                              {{answer.comments.length == 0 ? $t('评论') : $t('查看n条评论', {amount: answer.comments.length})}}
                            </v-btn>

                            <template v-if="userProfile">
                              <v-btn small class="slim-btn ma-1" @click="loadEditor" v-show="currentUserIsAuthor">
                                {{$t(editButtonText)}}
                              </v-btn>

                              <v-menu offset-y v-if="currentUserIsAuthor">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn v-bind="attrs" v-on="on" class="slim-btn ma-1" small >{{$t('设置')}}</v-btn>
                                </template>
                                <v-list>
                                  <v-list-item @click="confirmDeleteDialog = true">
                                    <v-list-item-icon>
                                      <DeleteIcon />
                                    </v-list-item-icon>
                                    <v-list-item-content>{{$t('永久删除')}}</v-list-item-content>
                                  </v-list-item>
                                </v-list>
                              </v-menu>

                              <v-dialog max-width="300" v-model="confirmDeleteDialog">
                                <v-card>
                                  <v-card-title primary-title>
                                    <div class="headline primary--text">{{$t('确定永久删除答案及其所有历史版本？')}}</div>
                                  </v-card-title>
                                  <v-card-actions>
                                    <v-spacer />
                                    <v-btn small ="confirmDeleteDialog = false">{{$t('No')}}</v-btn>
                                    <v-btn small color="warning" @click="deleteAnswer" :disabled='deleteAnswerIntermediate'>
                                      {{$t('Yes')}}
                                    </v-btn>
                                  </v-card-actions>
                                </v-card>
                              </v-dialog>

                              <BookmarkedIcon @click="unbookmark"
                                              :disabled="unbookmarkIntermediate"
                                              v-show="userBookmark.bookmarked_by_me && (!currentUserIsAuthor)"/>
                              <ToBookmarkIcon @click="bookmark"
                                              v-show="(!userBookmark.bookmarked_by_me) && (!currentUserIsAuthor)"
                                              :disabled="bookmarkIntermediate" />
                            </template>

                            <CollapseUpIcon @click="preview = true" class="pl-1 pr-1" />

                            <v-tooltip bottom>
                              <template v-slot:activator="{ on, attrs }">
                                <div v-bind="attrs" v-on="on" class="mt-1">
                                  <RouterLink :to="`/questions/${answer.question.uuid}/answers/${answerPreview.uuid}`"
                                              class="text-decoration-none">
                                    <LinkIcon class="pl-1 pr-1" />
                                  </RouterLink>
                                </div>
                              </template>
                              <span>{{$t('Link')}}</span>
                            </v-tooltip>
                          </div>
                        </v-col>

                        <!-- Column of variable width -->
                        <v-col md="auto" v-if="$vuetify.breakpoint.mdAndUp & !preview && userProfile">
                            <span class="text-caption grey--text ma-2">{{$t('已被阅读n次', { times: answer.view_times })}}</span>

                          <div class="d-flex justify-end mt-1">
                            <ReactionBlock objectType="answer" class="ml-1" :objectId="answer.uuid"/>
                          </div>
                        </v-col>
                    </v-row>



                    <!-- Comments -->
                    <v-expand-transition v-if="!preview">
                        <CommentBlock v-show="showComments"
                            :siteId="answer.site ? answer.site.uuid : undefined"
                            commentLabel="评论答案"
                            :commentSubmitIntermediate="commentSubmitIntermediate"
                            :comments="answer.comments"
                            :writable="commentWritable"
                            @submit-new-comment="submitNewAnswerCommentBody">
                        </CommentBlock>
                    </v-expand-transition>
                </div>
            </div>
        </div>
        <div v-if="isModerator && !isUserMode">
            <v-row justify="end">
                <v-col md="auto">
                    {{$t('管理：')}}
                    <!-- Moderator -->
                    <v-btn class="slim-btn ma-1" @click="toggleHideAnswer" color="warning" :disabled="toggleHideAnswerIntermediate"
                           v-if="isHiddenByMod">{{$t('取消隐藏')}}</v-btn>
                    <v-btn class="slim-btn ma-1" @click="toggleHideAnswer" color="warning" :disabled="toggleHideAnswerIntermediate"
                           v-else>{{$t('隐藏')}}</v-btn>

                    <v-btn class="slim-btn ma-1" @click="toggleTopAnswer" color="warning" :disabled="toggleTopAnswerIntermediate"
                           v-if="isPlacedAtQuestionTop">{{$t('取消问题中置顶')}}</v-btn>
                    <v-btn class="slim-btn ma-1" @click="toggleTopAnswer" color="warning" :disabled="toggleTopAnswerIntermediate"
                           v-else>{{$t('问题中置顶')}}</v-btn>
                </v-col>
            </v-row>
        </div>
    </v-card>
    <RichEditor v-else-if="answer && showEditor"
                :formatProp="answer.source_format"
                :answerIdProp="answer.uuid"
                publishText="发表答案"
                @submit-edit="newEditHandler"
                @cancel-edit="onCancelEdit"
                @delete-draft="deleteDraft" />
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { IAnswerDraft, IAnswer, IAnswerPreview, IAnswerUpvotes, ISite, IUserAnswerBookmark,
IUserProfile, IUserSiteProfile, INewEditEvent } from '@/interfaces';
import ReactionBlock from '@/components/ReactionBlock.vue';
import { readUserMode, readUserProfile } from '@/store/main/getters';
import BookmarkedIcon from '@/components/icons/BookmarkedIcon.vue';
import ToBookmarkIcon from '@/components/icons/ToBookmarkIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import CollapseUpIcon from '@/components/icons/CollapseUpIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import { api } from '@/api';
import { apiAnswer } from '@/api/answer';
import UserLink from '@/components/UserLink.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import QuestionLink from '@/components/QuestionLink.vue';
import CommentBlock from '@/components/CommentBlock.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { AnswerEditHandler } from '@/handlers';

import { commitAddNotification, commitSetShowLoginPrompt, commitSetWorkingDraft } from '@/store/main/mutations';
import { apiComment } from '@/api/comment';

@Component({
    components: {
        UserLink, QuestionLink, CommentBlock,
        SiteBtn, ReactionBlock, BookmarkedIcon, ToBookmarkIcon,
        DeleteIcon, CollapseUpIcon, LinkIcon },
})
export default class Answer extends Vue {

    get isUserMode() {
        return readUserMode(this.$store);
    }

    get token() { return this.$store.state.main.token; }
    @Prop() private readonly answerPreview!: IAnswerPreview;
    @Prop() private readonly answerProp: IAnswer | undefined;
    @Prop({default: false}) private readonly loadFull!: boolean;
    @Prop() private readonly showAuthor!: boolean;
    @Prop() private readonly showCommentId: number | undefined;
    @Prop({default: true}) private readonly showQuestionInCard!: boolean;

    private site: ISite | null = null;
    private answer: IAnswer | null = null;
    private upvotes: IAnswerUpvotes | null = null;
    private showComments: boolean = false;
    private newAnswerCommentBody: string = '';
    private userProfile: IUserProfile | null = null;
    private isHiddenByMod: boolean = false;
    private isPlacedAtQuestionTop: boolean = false;
    private isModerator = false;
    private commentWritable = false;
    private userSiteProfile: IUserSiteProfile | null = null;
    private userBookmark: IUserAnswerBookmark | null = null;
    private showEditor: boolean = false;
    private showCancelUpvoteDialog: boolean = false;
    private confirmDeleteDialog = false;

    private loading = true;
    private preview = true;

    private upvoteIntermediate = false;

    private cancelUpvoteIntermediate = false;
    private deleteAnswerIntermediate = false;

    private bookmarkIntermediate = false;

    private unbookmarkIntermediate = false;

    private toggleHideAnswerIntermediate = false;
    private toggleTopAnswerIntermediate = false;
    private answerPreviewBody: string = this.answerPreview.body;
    private currentUserIsAuthor = false;

    private answerEditHandler: AnswerEditHandler = new AnswerEditHandler(
        this, this.answerPreview.uuid, this.answerPreview.question.uuid, this.updatedAnswerCallback);

    private editButtonText = '编辑';
    private showHasDraftBadge = false;
    private draftPromise: Promise<IAnswerDraft> | null = null;

    private commentSubmitIntermediate = false;

    private async mounted() {
        if (this.showCommentId) {
            this.showComments = true;
        }

        this.isHiddenByMod = this.answerPreview.is_hidden_by_moderator;
        this.isPlacedAtQuestionTop = this.answerPreview.is_placed_at_question_top;
        this.userProfile = readUserProfile(this.$store);
        if (this.userProfile) {
            const mod = this.answerPreview.question.site.moderator;
            if (mod) {
                this.isModerator = this.userProfile.uuid === mod.uuid;
            }
        }

        if (this.answerProp) {
            this.updateStateWithLoadedAnswer(this.answerProp);
        } else {
            apiAnswer.getAnswer(this.token, this.answerPreview.uuid).then((response) => {
                this.updateStateWithLoadedAnswer(response.data);
            });
        }

        if (this.loadFull) {
            await this.expandDown();
        } else {
            this.loading = false;
        }
    }


    private async upvote() {
        if (!this.userProfile) {
            commitSetShowLoginPrompt(this.$store, true);
            return;
        }
        this.upvoteIntermediate = true;
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.answer) {
                this.upvotes = (await apiAnswer.upvoteAnswer(this.token, this.answer.uuid)).data;
                this.upvoteIntermediate = false;
            }
        });
    }

    private async cancelUpvote() {
        this.cancelUpvoteIntermediate = true;
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.answer) {
                this.upvotes = (await apiAnswer.cancelUpvoteAnswer(this.token, this.answer.uuid)).data;
                this.cancelUpvoteIntermediate = false;
                this.showCancelUpvoteDialog = false;
            }
        });
    }

    private async bookmark() {
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.answer) {
                this.bookmarkIntermediate = true;
                this.userBookmark = (await apiAnswer.bookmarkAnswer(this.token, this.answer.uuid)).data;
                this.bookmarkIntermediate = false;
            }
        });
    }

    private async unbookmark() {
        this.unbookmarkIntermediate = true;
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.answer) {
                this.userBookmark = (await apiAnswer.unbookmarkAnswer(this.token, this.answer.uuid)).data;
                this.unbookmarkIntermediate = false;
            }
        });
    }

    private async submitNewAnswerCommentBody(body: string) {
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.answer) {
                this.commentSubmitIntermediate = true;
                const response = await apiComment.postComment(this.token, {
                    site_uuid: this.answer.site.uuid,
                    answer_uuid: this.answer.uuid,
                    body,
                });
                const comment = response.data;
                this.answer.comments.push(comment);
                this.commentSubmitIntermediate = false;
            }
        });
    }

    private async toggleHideAnswer() {
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.answerPreview) {
                this.toggleHideAnswerIntermediate = true;
                const response = await api.updateAnswerByMod(this.token, this.answerPreview.uuid, {
                    is_hidden_by_moderator: !this.isHiddenByMod,
                });
                this.toggleHideAnswerIntermediate = false;
                this.isHiddenByMod = !this.isHiddenByMod;
            }
        });
    }

    private async toggleTopAnswer() {
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.answerPreview) {
                this.toggleTopAnswerIntermediate = true;
                const response = await api.updateAnswerByMod(this.token, this.answerPreview.uuid, {
                    is_placed_at_question_top: !this.isPlacedAtQuestionTop,
                });
                this.toggleTopAnswerIntermediate = false;
                this.isPlacedAtQuestionTop = !this.isPlacedAtQuestionTop;
            }
        });
    }

    private async newEditHandler(payload: INewEditEvent) {
        this.answerEditHandler.newEditHandler(payload);
    }

    private updatedAnswerCallback(answer: IAnswer, isAutoSaved: boolean) {
        if (!isAutoSaved) {
            this.showHasDraftBadge = false;
            this.showEditor = false;
            this.updateStateWithLoadedAnswer(answer);
        }
    }

    private updatePreview() {
        const previewDiv = this.$el.getElementsByClassName('vditor-preview')[0];
        if (previewDiv === undefined) {
            setTimeout(this.updatePreview, 200);
            return;
        }
        const text = previewDiv.textContent;
        if (text) {
            if (text.length > 120) {
                this.answerPreviewBody = text.substring(0, 120) + '...';
            } else {
                this.preview = false;
            }
        }
    }

    private updateStateWithLoadedAnswer(answer: IAnswer) {
        this.answer = answer;
        setTimeout(this.updatePreview, 200);
        if (this.userProfile) {
            this.currentUserIsAuthor = this.userProfile.uuid === this.answer.author.uuid;
            if (this.currentUserIsAuthor) {
                this.draftPromise = apiAnswer.getAnswerDraft(this.token, answer.uuid).then((response) => {
                    const draft = response.data;
                    if (draft.body_draft) {
                        this.editButtonText = '编辑草稿';
                        this.showHasDraftBadge = true;
                    }
                    return response.data;
                });
            }
        }
        this.upvotes = {
            answer_uuid: this.answer.uuid,
            count: this.answer.upvotes_count,
            upvoted: this.answer.upvoted,
        };
        this.commentWritable = this.answer.comment_writable;
        this.userBookmark = {
            answer_uuid: this.answer.uuid,
            bookmarkers_count: this.answer.bookmark_count,
            bookmarked_by_me: this.answer.bookmarked,
        };
        this.loading = false;
    }

    private async expandDown() {
        this.preview = false;
        if (!this.answer) {
            this.loading = true;
        }
    }

    private onReadFullAnswer() {
        if (this.token) {
            apiAnswer.bumpViewsCounter(this.token, this.answerPreview.uuid);
        }
    }

    private async loadEditor() {
        if (this.answer) {
            const draft = await this.draftPromise;
            if (draft && draft.body_draft) {
                commitAddNotification(this.$store,
                    { content: this.$t('载入最近的草稿').toString(),
                      color: 'success',
                    },
                );
                commitSetWorkingDraft(this.$store, {
                    title: null,
                    body: draft.body_draft,
                    rendered_body_text: null,
                    is_draft: true,
                    source_format: this.answer.source_format,
                    editor: this.answer.editor,
                    math_enabled: this.answer.math_enabled,
                });
            } else {
                commitSetWorkingDraft(this.$store, {
                    title: null,
                    body: this.answer.body,
                    rendered_body_text: null,
                    math_enabled: this.answer.math_enabled,
                    editor: this.answer.editor,
                    source_format: this.answer.source_format,
                    is_draft: false,
                });
            }
            this.showEditor = true;
        }
    }
    private onCancelEdit() {
        this.showEditor = false;
        apiAnswer.getAnswer(this.token, this.answerPreview.uuid).then((response) => {
            this.updateStateWithLoadedAnswer(response.data);
        });
    }

    @Emit('delete-answer')
    private async deleteAnswer() {
        await apiAnswer.deleteAnswer(this.token, this.answerPreview.uuid);
        commitAddNotification(this.$store, {
            content: this.$t('答案已永久删除').toString(),
            color: 'success',
        });
        this.confirmDeleteDialog = false;
        return this.answerPreview.uuid;
    }

    private async deleteDraft() {
        await apiAnswer.deleteAnswerDraft(this.token, this.answer!.uuid);
        commitAddNotification(this.$store, {
            content: this.$t('草稿已删除').toString(),
            color: 'success',
        });
        this.showHasDraftBadge = false;
        this.showEditor = false;
    }

    private truncatedIntro(intro: string) {
        if (this.$vuetify.breakpoint.mdAndUp) {
            if (intro.length > 30) {
                return intro.substring(0, 30) + '...';
            } else {
                return intro;
            }
        } else {
            if (intro.length > 18) {
                return intro.substring(0, 18) + '...';
            } else {
                return intro;
            }
        }
    }

    private toggleShowComments() {
        if (!this.userProfile && this.answer!.comments.length === 0) {
            commitSetShowLoginPrompt(this.$store, true);
            return;
        }
        this.showComments = !this.showComments;
    }
}
</script>

<style lang="sass">
.slim-btn
    padding: 0 8px !important

.vditor-preview
    padding: 0px 1px
</style>