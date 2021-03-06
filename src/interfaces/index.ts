export interface IUserProfile {
    id: number;
    uuid: string;
    email: string;
    secondary_emails: string[];
    phone_number?: string;
    is_active: boolean;
    is_superuser: boolean;
    full_name?: string;
    handle: string;
    moderated_sites: ISite[];
    subscribed_topics: ITopic[];
    residency_topics: ITopic[];
    profession_topic: ITopic;
    remaining_coins: number;
    view_times: number;
    personal_introduction?: string;
    locale_preference?: string;
    flags?: string;
    avatar_url?: string;
    gif_avatar_url?: string;
    github_username?: string;
    twitter_username?: string;
    linkedin_url?: string;
    homepage_url?: string;
    karma: number;
    enable_deliver_unread_notifications: boolean;
    default_editor_mode: 'wysiwyg' | 'markdown_splitview' | 'markdown_realtime_rendering';
}

export interface IUserSiteProfile {
    introduction?: string;
    karma: number;
    site: ISite;
    owner: IUserPreview;
}

export interface IAnswerModUpdate {
    is_hidden_by_moderator?: boolean;
    is_placed_at_question_top?: boolean;
}

export interface IQuestionModUpdate {
    is_placed_at_site_top?: boolean;
}

export interface IAnswerUpvotes {
    answer_uuid: string;
    count: number;
    upvoted: boolean;
}
export interface IQuestionUpvotes {
    question_uuid: string;
    count: number;
    upvoted: boolean;
}

export interface IComment {
    uuid: string;
    author: IUserPreview;
    created_at: string;
    updated_at: string;
    body: string;
    root_route?: string;
    shared_to_timeline: boolean;
    is_deleted: boolean;
    upvotes_count: number;
    upvoted: boolean;
}

export interface IAnswer {
    uuid: string;
    author: IUserPreview;
    site: ISite;
    question: IQuestionPreview;
    updated_at: string;
    draft_saved_at?: string;
    body: string;
    is_published: boolean;
    source_format: 'markdown';
    editor: 'wysiwyg' | 'markdown' | 'markdown_splitview' | 'markdown_realtime_rendering';
    math_enabled: boolean;
    comments: IComment[];
    is_hidden_by_moderator: boolean;
    is_placed_at_question_top: boolean;
    view_times: number;
    upvoted: boolean;
    upvotes_count: number;
    comment_writable: boolean;
    bookmark_count: number;
    bookmarked: boolean;
}

export interface IQuestion {
    uuid: string;
    site: ISite;
    author: IUserPreview;
    editor: IUserPreview;
    created_at: string;
    updated_at: string;
    title: string;
    topics: ITopic[];
    description: string;
    comments: IComment[];
    view_times: number;
    question: IQuestion;
    is_placed_at_site_top: boolean;
    is_placed_at_home: boolean;
    upvoted: boolean;
    upvotes_count: number;
    answers_count: number;
}

export interface IUserUpdateMe {
    full_name?: string;
    handle?: string;
    email?: string;
    password?: string;
    is_active?: boolean;
    residency_topic_uuids?: string[];
    profession_topic_uuid?: string;
    work_experiences?: IUserWorkExperienceUpdate[];
    education_experiences?: IUserEducationExperienceUpdate[];
    personal_introduction?: string;
    locale_preference?: string;
    flags?: string;
    avatar_url?: string;
    gif_avatar_url?: string;
    github_username?: string;
    twitter_username?: string;
    linkedin_url?: string;
    homepage_url?: string;
    enable_deliver_unread_notifications?: boolean;
    default_editor_mode?: 'wysiwyg' | 'markdown_splitview' | 'markdown_realtime_rendering';
}

export interface IUserProfileUpdate {
    email?: string;
    phone_number?: string;
    full_name?: string;
    handle?: string;
    password?: string;
    is_active?: boolean;
    is_superuser?: boolean;
}

export interface IUserProfileCreate {
    email: string;
    full_name?: string;
    password?: string;
    is_active?: boolean;
    is_superuser?: boolean;
}

export interface ISiteUpdate {
    name?: string;
    description?: string;
    topic_uuids?: string[];
    auto_approval?: boolean;
    min_karma_for_application?: number;
    email_domain_suffix_for_application?: string;
}

export interface ISite {
    name: string;
    description?: string;
    topics: ITopic[];
    moderator?: IUserPreview;
    uuid: string;
    public_readable: boolean;
    public_writable_question: boolean;
    public_writable_submission: boolean;
    public_writable_answer: boolean;
    public_writable_comment: boolean;
    create_question_coin_deduction: number;
    subdomain: string;
    permission_type?: 'public' | 'private' | 'chaos';
    auto_approval: boolean;
    min_karma_for_application?: number;
    email_domain_suffix_for_application?: string;
    questions_count: number;
    submissions_count: number;
    members_count: number;
}

export interface IAnswerCreate {
    question_uuid: string;
    body: string;
    source_format: 'markdown';
    is_published: boolean;
    editor: 'wysiwyg' | 'markdown' | 'markdown_splitview' | 'markdown_realtime_rendering';
    math_enabled: boolean;
    writing_session_uuid: string;
}

export interface IAnswerUpdate {
    updated_body: string;
    is_draft: boolean;
    source_format: 'markdown';
    editor: 'wysiwyg' | 'markdown' | 'markdown_splitview' | 'markdown_realtime_rendering';
    math_enabled: boolean;
}

export interface IRichEditorState {
    title: string | null; // for article
    body: string;
    rendered_body_text: string | null;
    source_format: 'markdown';
    is_draft: boolean;
    editor: 'wysiwyg' | 'markdown' | 'markdown_splitview' | 'markdown_realtime_rendering';
    math_enabled: boolean;
}

export interface IQuestionCreate {
    site_uuid: string;
    title: string;
}

export interface IUserFollows {
    user_uuid: string;
    followers_count: number;
    followed_count: number;
    followed_by_me: boolean;
}

export interface IUserUpdateLoginPhoneNumber {
    phone_number: string;
    verification_code: string;
}

export interface IUserUpdateSecondaryEmails {
    secondary_email: string;
    action: 'add' | 'remove';
    verification_code?: string;
}

export interface IUserUpdatePrimaryEmail {
    email: string;
    verification_code?: string;
}

export interface IUserPreview {
    uuid: string;
    full_name?: string;
    handle: string;
    avatar_url?: string;
    personal_introduction?: string;
    karma: number;
}

export interface IQuestionPreview {
    uuid: string;
    title: string;
    description?: string;
    site: ISite;
    is_placed_at_site_top: boolean;
    is_placed_at_home: boolean;
    created_at: string;
    answers_count: number;
    upvotes_count: number;
    comments_count: number;
}

export interface IAnswerPreview {
    uuid: string;
    author: IUserPreview;
    question: IQuestionPreview;
    body: string;
    upvotes_count: number;
    is_hidden_by_moderator: boolean;
    is_placed_at_question_top: boolean;
}

// To be deprecated
export interface ICreateQuestionActivityContent {
    author_preview: IUserPreview;
    question_preview: IQuestionPreview;
}

// To be deprecated
export interface ICreateAnswerActivityContent {
    author_preview: IUserPreview;
    answer_preview: IAnswerPreview;
}

// To be deprecated
export interface IUpvoteAnswerActivityContent {
    voter_preview: IUserPreview;
    answer_preview: IAnswerPreview;
}

// To be deprecated
export interface IFollowUserActivityContent {
    follower_preview: IUserPreview;
    followed_preview: IUserPreview;
}

export interface CreateQuestion {
    verb: 'create_question';
    subject: IUserPreview;
    question: IQuestionPreview;
}

export interface CreateSubmission {
    verb: 'create_submission';
    subject: IUserPreview;
    submission: ISubmission;
}

export interface CreateArticle {
    verb: 'create_article';
    subject: IUserPreview;
    article: IArticlePreview;
}

export interface CommentArticle {
    verb: 'comment_article';
    subject: IUserPreview;
    comment: IComment;
    article: IArticlePreview;
}


export interface UpvoteArticle {
    verb: 'upvote_article';
    subject: IUserPreview;
    article: IArticlePreview;
}


export interface SubscribeArticleColumn {
    verb: 'follow_article_column';
    subject: IUserPreview;
    article_column: IArticleColumn;
}

export interface AnswerQuestion {
    verb: 'answer_question';
    subject: IUserPreview;
    answer: IAnswerPreview;
}

export interface CommentQuestion {
    verb: 'comment_question';
    subject: IUserPreview;
    comment: IComment;
    question: IQuestionPreview;
}

export interface EditQuestion {
    verb: 'edit_question';
    subject: IUserPreview;
    question: IQuestionPreview;
}

export interface CommentSubmission {
    verb: 'comment_submission';
    subject: IUserPreview;
    comment: IComment;
    submission: ISubmission;
}

export interface UpvoteSubmission {
    verb: 'upvote_submission';
    subject: IUserPreview;
    submission: ISubmission;
}

export interface ReplyComment {
    verb: 'reply_comment';
    subject: IUserPreview;
    reply: IComment;
    parent_comment: IComment;
}

export interface InviteAnswer {
    verb: 'invite_answer';
    subject: IUserPreview;
    question: IQuestionPreview;
    user: IUserPreview;
}

export interface InviteJoinSite {
    verb: 'invite_join_site';
    subject: IUserPreview;
    site: ISite;
    user?: IUserPreview;
    invited_email?: string;
}

export interface InvitedUserActivated {
    verb: 'invited_user_activated';
    invited_email?: string;
    payment_amount?: number;
}

export interface ApplyJoinSite {
    verb: 'apply_join_site';
    subject: IUserPreview;
    site: ISite;
}

export interface CommentAnswer {
    verb: 'comment_answer';
    subject: IUserPreview;
    comment: IComment;
    answer: IAnswerPreview;
}

export interface UpvoteAnswer {
    verb: 'upvote_answer';
    subject: IUserPreview;
    answer: IAnswerPreview;
}

export interface UpvoteAnswerCombined {
    verb: 'upvote_answer_combined';
    subjects: IUserPreview[];
    answer: IAnswerPreview;
}

export interface UpvoteArticleCombined {
    verb: 'upvote_article_combined';
    subjects: IUserPreview [];
    article: IArticlePreview;
}

export interface UpvoteSubmissionCombined {
    verb: 'upvote_submission_combined';
    subjects: IUserPreview [];
    submission: ISubmission;
}

export interface UpvoteQuestion {
    verb: 'upvote_question';
    subject: IUserPreview;
    question: IQuestionPreview;
}

export interface UpvoteQuestionCombined {
    verb: 'upvote_question_combined';
    subjects: IUserPreview[];
    question: IQuestionPreview;
}

export interface FollowUser {
    verb: 'follow_user';
    subject: IUserPreview;
    user: IUserPreview;
}

export interface FollowUserCombined {
    verb: 'follow_user_combined';
    subjects: IUserPreview[];
    user: IUserPreview;
}

export interface SystemBroadcast {
    verb: 'system_broadcast';
    message: string;
}

export interface SiteBroadcast {
    verb: 'site_broadcast';
    submission: ISubmission;
    site: ISite;
}

export interface CreateMessage {
    verb: 'create_message';
    subject: IUserPreview;
    channel: IChannel;
}

export interface SystemSendInvitation {
    verb: 'system_send_invitation';
    invited_email: string;
}

export interface IEvent {
    created_at: string;
    content:
        CreateQuestion |
        AnswerQuestion |
        CommentQuestion |
        ReplyComment |
        InviteAnswer |
        InviteJoinSite |
        ApplyJoinSite |
        CommentAnswer |
        UpvoteAnswer |
        UpvoteQuestion |
        FollowUser |
        SystemBroadcast |
        CreateMessage |
        InvitedUserActivated |
        CreateArticle |
        CommentArticle |
        UpvoteArticle |
        SubscribeArticleColumn |
        UpvoteQuestionCombined |
        UpvoteAnswerCombined |
        UpvoteArticleCombined |
        UpvoteSubmissionCombined |
        FollowUserCombined |
        CreateSubmission |
        CommentSubmission |
        UpvoteSubmission |
        SystemSendInvitation |
        SiteBroadcast |
        EditQuestion;
}

export interface IActivity {
    id: number;
    created_at: string;
    site_uuid: string;
    verb: string;
    event: IEvent;
}

export interface ICommentCreate {
    site_uuid?: string;
    body: string;
    question_uuid?: string;
    submission_uuid?: string;
    article_uuid?: string;
    blog_uuid?: string;
    answer_uuid?: string;
    parent_comment_uuid?: string;
}

export interface ICommentUpdate {
    body?: string;
    shared_to_timeline?: true;
}

export interface IQuestionUpdate {
    title?: string;
    description?: string;
    topic_uuids?: string[];
}

export interface IUserQuestionSubscription {
    question_uuid: string;
    subscription_count:	number;
    subscribed_by_me: boolean;
}

export interface IUserAnswerBookmark {
    answer_uuid: string;
    bookmarked_by_me: boolean;
    bookmarkers_count: number;
}

export interface IUserTopicSubscription {
    topic_uuid: string;
    subscribed_by_me: boolean;
    subscription_count: number;
}

export interface IUserPublic {
    gif_avatar_url?: string;
    uuid: string;
    full_name?: string;
    handle: string;
    profiles: IUserSiteProfile[];
    profile_view_times: number;
    personal_introduction?: string;
    subscribed_topics: ITopic[];
    github_username?: string;
    twitter_username?: string;
    linkedin_url?: string;
    homepage_url?: string;
    karma: number;
    answers_count: number;
    submissions_count: number;
    questions_count: number;
    articles_count: number;
}

export interface IUserPublicForVisitor {
    gif_avatar_url?: string;
    uuid: string;
    full_name?: string;
    handle: string;
    karma: number;
    answers_count: number;
    submissions_count: number;
    questions_count: number;
    articles_count: number;
}

export interface IProfileUpdateMod {
    site_uuid: string;
}

export interface IProfileCreate {
    site_uuid: string;
    owner_uuid: string;
}

export interface ITopic {
    uuid: string;
    name: string;
    description?: string;
    parent_topic_uuid?: string;
}

export interface ITopicCreate {
    name: string;
}

export interface ISiteCreate {
    name: string;
    description?: string;
    subdomain: string;
}

export interface IChannel {
    id: number;
    name: string;
    is_private: boolean;
    private_with_user: IUserPreview;
    admin: IUserPreview;
}

export interface IChannelCreate {
    private_with_user_uuid: string;
}

export interface IMessage {
    id: number;
    channel_id: number;
    body: string;
    author: IUserPreview;
    created_at: string;
    updated_at: string;
}

export interface IMessageCreate {
    channel_id: number;
    body: string;
}

export interface IMsg {
    msg: string;
}
export interface SiteModeratorBroadcastTaskDefinition {
    task_type: 'site_broadcast';
    to_members_of_site_uuid: string;
    submission_uuid: string;
}


export type ITaskDefinition = SiteModeratorBroadcastTaskDefinition;

export interface ITask {
    id: number;
    created_at: string;
    task_definition: ITaskDefinition;
    pending: 'pending' | 'finished' | 'failed';
    initiator: IUserPreview;
}

export interface IUserWorkExperience {
    company_topic: ITopic;
    position_topic: ITopic;
}

export interface IUserWorkExperienceUpdate {
    company_topic_uuid: string;
    position_topic_uuid: string;
}

export interface IUserEducationExperience {
    school_topic: ITopic;
    level: string;
}

export interface IUserEducationExperienceUpdate {
    school_topic_uuid: string;
    level_name: string;
}

export interface INotification {
    id: number;
    created_at: string;
    body: string;
    event?: Event;
    is_read: boolean;
}

export interface INotificationUpdate {
    is_read: boolean;
}

export interface IUserInvite {
    site_uuid?: string;
    email?: string;
    user_uuid?: string;
    personal_relation?: string;
}

export interface ICoinPayment {
    id: number;
    created_at: string;
    amount: number;
    event?: IEvent;
    payer: IUserPreview;
    payee: IUserPreview;
    comment?: string;
}

export interface IWsUserMsg {
    type: 'notification';
    data: INotification;
}

export interface IAnswerDraft {
    body_draft?: string;
    draft_saved_at?: string;
}

export interface IArchive {
    id: number;
    body: string;
    created_at: string;
}

export interface IReactions {
    counters: Map<string, number>;
    my_reactions: string[];
}

export interface IReaction {
    object_uuid: string;
    object_type: 'question' | 'answer' | 'comment' | 'article';
    reaction: '👍' | '👎' | '👀' | '❤️' | '😂' | '🙏';
    action: 'add' | 'cancel';
}

export interface IQuestionArchive {
    id: number;
    title?: string;
    description?: string;
    topics: ITopic[];
    created_at: string;
    editor: IUserPreview;
}

export interface ITopBanner {
    enabled: boolean;
    color: string;
    textColor?: string;
    text: string;
}

export interface IArticleCreate {
    title: string;
    body: string;
    article_column_uuid: string;
    is_published: boolean;
    source_format: 'markdown';
    editor: 'wysiwyg' | 'markdown' | 'markdown_splitview' | 'markdown_realtime_rendering';
    math_enabled: boolean;
    writing_session_uuid: string;
}

export interface IArticleUpdate {
    updated_title: string;
    updated_body: string;
    is_draft: boolean;
    source_format: 'markdown';
    editor: 'wysiwyg' | 'markdown' | 'markdown_splitview' | 'markdown_realtime_rendering';
    math_enabled: boolean;
}

export interface IArticleDraft {
    title_draft?: string;
    body_draft?: string;
    draft_saved_at?: number[];
}

export interface IArticle {
    uuid: string;
    title: string;
    body: string;
    updated_at: string;
    initial_published_at: string;
    draft_saved_at?: string;
    is_published: boolean;
    source_format: 'markdown';
    editor: 'wysiwyg' | 'markdown' | 'markdown_splitview' | 'markdown_realtime_rendering';
    math_enabled: boolean;
    topics: ITopic [];
    upvotes_count: number;
    author: IUserPreview;
    comments: IComment[];
    article_column: IArticleColumn;
    upvoted: boolean;
    view_times: number;
    bookmark_count: number;
    bookmarked: boolean;
}

export interface IArticleUpvotes {
    article_uuid: string;
    count: number;
    upvoted: boolean;
}

export interface IArticleColumnCreate {
    name: string;
    description?: string;
}


export interface IArticleColumnUpdate {
    name?: string;
    description?: string;
}

export interface IArticleColumn {
    uuid: string;
    name: string;
    description: string;
    created_at: string;
    owner: IUserPreview;
}

export interface IArticlePreview {
    uuid: string;
    author: IUserPreview;
    article_column: IArticleColumn;
    title: string;
    body_preview: string;
    upvotes_count: number;
    is_published: boolean;
}

export interface IArticleArchive {
    uuid: string;
    title: string;
    body: string;
    topics: ITopic[];
    created_at: string;
}

export interface IUserArticleBookmark {
    article_uuid: string;
    bookmarked_by_me: boolean;
    bookmarkers_count: number;
}


export interface IUserArticleColumnSubscription {
    article_column_uuid: string;
    subscription_count: number;
    subscribed_by_me: boolean;
}

export interface IVerificationCodeRequest {
    email?: string;
    phone_number?: string;
}


export interface ITopicUpdate {
    description?: string;
    parent_topic_uuid?: string;
}

export interface ISiteMap {
    topic: ITopic;
    sub_site_maps: ISiteMap[];
    sites: ISite[];
}

export interface ISiteMaps {
    site_maps: ISiteMap[];
    sites_without_topics: ISite[];
}

export interface IAnsweredQuestionCondition {
    condition_type: 'answered_question';
    question_uuid: string;
}

export interface IRewardCondition {
    content: IAnsweredQuestionCondition;
}


export interface IRewardCreate {
    expired_after_days: number;
    receiver_uuid: string;
    coin_amount: number;
    note_to_receiver?: string;
    condition?: IRewardCondition;
}

export interface IReward {
    id: number;
    created_at: string;
    expired_at: string;
    claimed_at?: string;
    refunded_at?: string;
    coin_amount: number;
    note_to_receiver?: string;
    giver: IUserPreview;
    receiver: IUserPreview;
    condition?: IRewardCondition;
}

export interface ITextField {
    field_type_name: 'text_field';
    desc: string;
}


export interface ISingleChoiceField {
    field_type_name: 'single_choice_field';
    desc: string;
    choices: string[];
}


export interface IMultipleChoicesField {
    field_type_name: 'multiple_choices_field';
    desc: string;
    choices: string[];
}

export interface IFormField {
    unique_name: string;
    field_type: ITextField | ISingleChoiceField | IMultipleChoicesField;
}


export interface IFormCreate {
    title: string;
    form_fields: IFormField[];
}

export interface IForm {
    author: IUserPreview;
    title: string;
    uuid: string;
    form_fields: IFormField[];
    created_at: string;
    updated_at: string;
}

export interface ITextResponseField {
    field_type_name: 'text_response_field';
    desc: string;
    text: string;
}


export interface ISingleChoiceResponseField {
    field_type_name: 'single_choice_response_field';
    desc: string;
    selected_choice: string;
}

export interface IMutipleChoicesResponseField {
    field_type_name: 'multiple_choices_response_field';
    desc: string;
    selected_choices: string[];
}

export interface IFormResponseField {
    unique_name: string;
    field_content: ITextResponseField | ISingleChoiceResponseField | IMutipleChoicesResponseField;
}


export interface IFormResponseCreate {
    form_uuid: string;
    response_fields: IFormResponseField[];
}

export interface IFormResponse {
    response_author: IUserPreview;
    form: IForm;
    id: number;
    response_fields: IFormResponseField[];
    created_at: string;
}


export interface IScores {
    full_score: number;
    score: number;
}

export interface IClaimWelcomeTestScoreMsg {
    success: boolean;
    scores: IScores;
}

export interface INewEditEvent {
    edit: IRichEditorState;
    isAutosaved: boolean;
    answerId?: string;
    articleId?: string;
    writingSessionUUID: string;
    saveCallback: (answer: IAnswer) => void;
    saveArticleCallback: (article: IArticle) => void;
}

export interface IApplication {
    id: number;
    created_at: string;
    applicant: IUserPreview;
    applied_site: ISite;
    pending: boolean;
}


export interface ISubmissionCreate {
    site_uuid: string;
    title: string;
    url?: string;
}


export interface ISubmissionUpdate {
    title?: string;
    description?: string;
    topic_uuids?: string[];
}


export interface ISubmission {
    uuid: string;
    title: string;
    description?: string;
    url?: string;
    created_at: string;
    updated_at: string;
    topics: ITopic[];
    upvotes_count: number;
    author: IUserPreview;
    comments: IComment[];
    site: ISite;
    upvoted: boolean;
    view_times: number;
}


export interface ISubmissionUpvotes {
    submission_uuid: string;
    count: number;
    upvoted: boolean;
}


export interface ISubmissionArchive {
    id: number;
    title: string;
    description?: string;
    url?: string;
    created_at: string;
}

export interface ICommentUpvotes {
    comment_uuid: string;
    count: number;
    upvoted: boolean;
}

export interface IInvitationLinkCreate {
    invited_to_site_uuid?: string;
}

export interface IInvitationLink {
    uuid: string;
    created_at: string;
    expired_at: string;
    invited_to_site?: ISite;
    inviter: IUserPreview;
    remaining_quota: number;
}

export interface IAuditLog {
    uuid: string;
    created_at: string;
    api: string;
    user: IUserPreview;
}
