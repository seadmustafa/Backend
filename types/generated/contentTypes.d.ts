import type { Schema, Attribute } from '@strapi/strapi'

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions'
  info: {
    name: 'Permission'
    description: ''
    singularName: 'permission'
    pluralName: 'permissions'
    displayName: 'Permission'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    properties: Attribute.JSON & Attribute.DefaultTo<{}>
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users'
  info: {
    name: 'User'
    description: ''
    singularName: 'user'
    pluralName: 'users'
    displayName: 'User'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    username: Attribute.String
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    resetPasswordToken: Attribute.String & Attribute.Private
    registrationToken: Attribute.String & Attribute.Private
    isActive: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>
    preferedLanguage: Attribute.String
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles'
  info: {
    name: 'Role'
    description: ''
    singularName: 'role'
    pluralName: 'roles'
    displayName: 'Role'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    description: Attribute.String
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens'
  info: {
    name: 'Api Token'
    singularName: 'api-token'
    pluralName: 'api-tokens'
    displayName: 'Api Token'
    description: ''
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }> &
      Attribute.DefaultTo<''>
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    lastUsedAt: Attribute.DateTime
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >
    expiresAt: Attribute.DateTime
    lifespan: Attribute.BigInteger
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions'
  info: {
    name: 'API Token Permission'
    description: ''
    singularName: 'api-token-permission'
    pluralName: 'api-token-permissions'
    displayName: 'API Token Permission'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens'
  info: {
    name: 'Transfer Token'
    singularName: 'transfer-token'
    pluralName: 'transfer-tokens'
    displayName: 'Transfer Token'
    description: ''
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }> &
      Attribute.DefaultTo<''>
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    lastUsedAt: Attribute.DateTime
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >
    expiresAt: Attribute.DateTime
    lifespan: Attribute.BigInteger
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions'
  info: {
    name: 'Transfer Token Permission'
    description: ''
    singularName: 'transfer-token-permission'
    pluralName: 'transfer-token-permissions'
    displayName: 'Transfer Token Permission'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files'
  info: {
    singularName: 'file'
    pluralName: 'files'
    displayName: 'File'
    description: ''
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Attribute.String & Attribute.Required
    alternativeText: Attribute.String
    caption: Attribute.String
    width: Attribute.Integer
    height: Attribute.Integer
    formats: Attribute.JSON
    hash: Attribute.String & Attribute.Required
    ext: Attribute.String
    mime: Attribute.String & Attribute.Required
    size: Attribute.Decimal & Attribute.Required
    url: Attribute.String & Attribute.Required
    previewUrl: Attribute.String
    provider: Attribute.String & Attribute.Required
    provider_metadata: Attribute.JSON
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1
        },
        number
      >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders'
  info: {
    singularName: 'folder'
    pluralName: 'folders'
    displayName: 'Folder'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1
        },
        number
      >
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1
        },
        number
      >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases'
  info: {
    singularName: 'release'
    pluralName: 'releases'
    displayName: 'Release'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Attribute.String & Attribute.Required
    releasedAt: Attribute.DateTime
    scheduledAt: Attribute.DateTime
    timezone: Attribute.String
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions'
  info: {
    singularName: 'release-action'
    pluralName: 'release-actions'
    displayName: 'Release Action'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >
    contentType: Attribute.String & Attribute.Required
    locale: Attribute.String
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >
    isEntryValid: Attribute.Boolean
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions'
  info: {
    name: 'permission'
    description: ''
    singularName: 'permission'
    pluralName: 'permissions'
    displayName: 'Permission'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Attribute.String & Attribute.Required
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles'
  info: {
    name: 'role'
    description: ''
    singularName: 'role'
    pluralName: 'roles'
    displayName: 'Role'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: true
    }
  }
  attributes: {
    name: Attribute.String & Attribute.Required
    type: Attribute.String & Attribute.Unique
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >
    category: Attribute.Relation<
      'plugin::users-permissions.role',
      'manyToOne',
      'api::category.category'
    >
    religion: Attribute.Relation<
      'plugin::users-permissions.role',
      'manyToOne',
      'api::religion.religion'
    >
    releaseQR: Attribute.Boolean & Attribute.DefaultTo<false>
    description: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 300
      }>
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users'
  info: {
    name: 'user'
    description: ''
    singularName: 'user'
    pluralName: 'users'
    displayName: 'User'
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3
      }>
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    provider: Attribute.String
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    resetPasswordToken: Attribute.String & Attribute.Private
    confirmationToken: Attribute.String & Attribute.Private
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >
    avatar: Attribute.Media
    forum_comments: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::forum-comment.forum-comment'
    >
    forum_posts: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::forum-post.forum-post'
    >
    isVerified: Attribute.Boolean & Attribute.DefaultTo<false>
    onboarded: Attribute.Boolean & Attribute.DefaultTo<false>
    scope: Attribute.Enumeration<['pwa', 'portal', 'all']> &
      Attribute.Private &
      Attribute.DefaultTo<'pwa'>
    liked_posts: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToMany',
      'api::forum-post.forum-post'
    >
    onboarding_information: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::onboarding-information.onboarding-information'
    >
    reviewed_reports: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::report.report'
    >
    submitted_reports: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::report.report'
    >
    news_posts: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::news-post.news-post'
    >
    restaurant_reviews: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::restaurant-review.restaurant-review'
    >
    isViewedCommercial: Attribute.Boolean & Attribute.DefaultTo<false>
    resetPasswordTokenExpire: Attribute.DateTime & Attribute.Private
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale'
  info: {
    singularName: 'locale'
    pluralName: 'locales'
    collectionName: 'locales'
    displayName: 'Locale'
    description: ''
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          min: 1
          max: 50
        },
        number
      >
    code: Attribute.String & Attribute.Unique
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface PluginEmailDesignerEmailTemplate
  extends Schema.CollectionType {
  collectionName: 'email_templates'
  info: {
    singularName: 'email-template'
    pluralName: 'email-templates'
    displayName: 'Email-template'
    name: 'email-template'
  }
  options: {
    draftAndPublish: false
    timestamps: true
    increments: true
    comment: ''
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    templateReferenceId: Attribute.Integer & Attribute.Unique
    design: Attribute.JSON
    name: Attribute.String
    subject: Attribute.String
    bodyHtml: Attribute.Text
    bodyText: Attribute.Text
    enabled: Attribute.Boolean & Attribute.DefaultTo<true>
    tags: Attribute.JSON
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'plugin::email-designer.email-template',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'plugin::email-designer.email-template',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiCategoryCategory extends Schema.CollectionType {
  collectionName: 'categories'
  info: {
    singularName: 'category'
    pluralName: 'categories'
    displayName: 'Categories'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    name: Attribute.String
    roles: Attribute.Relation<
      'api::category.category',
      'oneToMany',
      'plugin::users-permissions.role'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiDepartureHistoryDepartureHistory
  extends Schema.CollectionType {
  collectionName: 'departure_histories'
  info: {
    singularName: 'departure-history'
    pluralName: 'departure-histories'
    displayName: 'DepartureHistory'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    receiver: Attribute.Relation<
      'api::departure-history.departure-history',
      'oneToOne',
      'plugin::users-permissions.user'
    >
    scanResult: Attribute.Enumeration<
      ['Prepared', 'Ongoing', 'Received', 'Rejected']
    > &
      Attribute.DefaultTo<'Prepared'>
    reasonReject: Attribute.String
    reasonRejectFiles: Attribute.Media
    transactionTime: Attribute.DateTime
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::departure-history.departure-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::departure-history.departure-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiForumCommentForumComment extends Schema.CollectionType {
  collectionName: 'forum_comments'
  info: {
    singularName: 'forum-comment'
    pluralName: 'forum-comments'
    displayName: 'ForumComments'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    forum_post: Attribute.Relation<
      'api::forum-comment.forum-comment',
      'manyToOne',
      'api::forum-post.forum-post'
    >
    content: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
        maxLength: 300
      }>
    user: Attribute.Relation<
      'api::forum-comment.forum-comment',
      'manyToOne',
      'plugin::users-permissions.user'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::forum-comment.forum-comment',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::forum-comment.forum-comment',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiForumPostForumPost extends Schema.CollectionType {
  collectionName: 'forum_posts'
  info: {
    singularName: 'forum-post'
    pluralName: 'forum-posts'
    displayName: 'ForumPosts'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    forum_comments: Attribute.Relation<
      'api::forum-post.forum-post',
      'oneToMany',
      'api::forum-comment.forum-comment'
    >
    sensitive_words: Attribute.Relation<
      'api::forum-post.forum-post',
      'manyToMany',
      'api::sensitive-word.sensitive-word'
    >
    content: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
        maxLength: 500
      }>
    media: Attribute.Media
    user: Attribute.Relation<
      'api::forum-post.forum-post',
      'manyToOne',
      'plugin::users-permissions.user'
    >
    users_liked: Attribute.Relation<
      'api::forum-post.forum-post',
      'manyToMany',
      'plugin::users-permissions.user'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::forum-post.forum-post',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::forum-post.forum-post',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiHalalCertificateHalalCertificate
  extends Schema.CollectionType {
  collectionName: 'halal_certificates'
  info: {
    singularName: 'halal-certificate'
    pluralName: 'halal-certificates'
    displayName: 'HalalCertificates'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    certificationBodyId: Attribute.Relation<
      'api::halal-certificate.halal-certificate',
      'oneToOne',
      'plugin::users-permissions.user'
    >
    certificatePaths: Attribute.Media
    requestId: Attribute.String
    status: Attribute.Enumeration<['Pending', 'Approved', 'Rejected']>
    auditCheck: Attribute.Boolean
    siteAuditVisitDate: Attribute.Date
    details: Attribute.Text
    evidencePaths: Attribute.Media
    reasonReject: Attribute.Text
    createdRequestId: Attribute.Relation<
      'api::halal-certificate.halal-certificate',
      'oneToOne',
      'plugin::users-permissions.user'
    >
    blockchainId: Attribute.String
    certificationBodyName: Attribute.String
    certificationBodyIdOther: Attribute.String
    expiryDate: Attribute.Date
    type: Attribute.Enumeration<['Upload', 'Request']>
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::halal-certificate.halal-certificate',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::halal-certificate.halal-certificate',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiLogBlockchainLogBlockchain extends Schema.CollectionType {
  collectionName: 'log_blockchains'
  info: {
    singularName: 'log-blockchain'
    pluralName: 'log-blockchains'
    displayName: 'LogBlockchain'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    blockchainId: Attribute.String
    channel: Attribute.Enumeration<
      ['OnboardingInformation', 'HalaCertificates', 'SupplyChainRecords']
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::log-blockchain.log-blockchain',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::log-blockchain.log-blockchain',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiNewsPostNewsPost extends Schema.CollectionType {
  collectionName: 'news_posts'
  info: {
    singularName: 'news-post'
    pluralName: 'news-posts'
    displayName: 'NewsPosts'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
        maxLength: 50
      }>
    publisher: Attribute.Relation<
      'api::news-post.news-post',
      'manyToOne',
      'plugin::users-permissions.user'
    >
    categories: Attribute.Relation<
      'api::news-post.news-post',
      'manyToMany',
      'api::news-post-category.news-post-category'
    >
    content: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    thumbnail: Attribute.Media
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::news-post.news-post',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::news-post.news-post',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiNewsPostCategoryNewsPostCategory
  extends Schema.CollectionType {
  collectionName: 'news_post_categories'
  info: {
    singularName: 'news-post-category'
    pluralName: 'news-post-categories'
    displayName: 'NewsPostCategory'
    description: ''
  }
  options: {
    draftAndPublish: false
  }
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1
        maxLength: 30
      }>
    news_posts: Attribute.Relation<
      'api::news-post-category.news-post-category',
      'manyToMany',
      'api::news-post.news-post'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::news-post-category.news-post-category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::news-post-category.news-post-category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiOnboardingInformationOnboardingInformation
  extends Schema.CollectionType {
  collectionName: 'onboarding_informations'
  info: {
    singularName: 'onboarding-information'
    pluralName: 'onboarding-informations'
    displayName: 'OnboardingInformation'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    organizationName: Attribute.String
    brandLogo: Attribute.Media
    representativeName: Attribute.String
    farmType: Attribute.Enumeration<
      [
        'Crop',
        'Livestock',
        'Mixed',
        'Organic',
        'SpecialtyCrop',
        'Subsistence',
        'Commercial',
        'Agroforestry'
      ]
    >
    certificationDate: Attribute.Date
    butcherLicense: Attribute.Boolean
    videoRecording: Attribute.Boolean
    meatFragmentation: Attribute.Boolean
    inspectionStatus: Attribute.Enumeration<['Pass', 'Fail', 'Pending']>
    accreditationStatus: Attribute.Enumeration<
      ['Accredited', 'NonAccredited', 'ConditionalAccreditation']
    >
    accreditationExpiration: Attribute.Date
    regulationDate: Attribute.Date
    enforcementStatus: Attribute.Enumeration<
      ['Compliant', 'NonCompliant', 'Unknown']
    >
    registrationDate: Attribute.Date
    license: Attribute.Media
    user: Attribute.Relation<
      'api::onboarding-information.onboarding-information',
      'oneToOne',
      'plugin::users-permissions.user'
    >
    contactInformation: Attribute.JSON
    enforcementActions: Attribute.Text
    location: Attribute.Text
    regulationsAndPolicies: Attribute.Text
    blockchainId: Attribute.String
    certificateInfo: Attribute.Relation<
      'api::onboarding-information.onboarding-information',
      'oneToMany',
      'api::halal-certificate.halal-certificate'
    >
    listOfAccreditedCertificationBodies: Attribute.JSON
    licenseId: Attribute.String
    productType: Attribute.Relation<
      'api::onboarding-information.onboarding-information',
      'oneToMany',
      'api::product-type.product-type'
    >
    farmSize: Attribute.String
    capacity: Attribute.String
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::onboarding-information.onboarding-information',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::onboarding-information.onboarding-information',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiOtpOtp extends Schema.CollectionType {
  collectionName: 'otps'
  info: {
    singularName: 'otp'
    pluralName: 'otps'
    displayName: 'Otps'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    email: Attribute.Email & Attribute.Unique
    otp: Attribute.String
    expire: Attribute.Timestamp
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<'api::otp.otp', 'oneToOne', 'admin::user'> &
      Attribute.Private
    updatedBy: Attribute.Relation<'api::otp.otp', 'oneToOne', 'admin::user'> &
      Attribute.Private
  }
}

export interface ApiProductTypeProductType extends Schema.CollectionType {
  collectionName: 'product_types'
  info: {
    singularName: 'product-type'
    pluralName: 'product-types'
    displayName: 'ProductType'
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    productType: Attribute.String
    productIngredients: Attribute.Text
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::product-type.product-type',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::product-type.product-type',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiReligionReligion extends Schema.CollectionType {
  collectionName: 'religions'
  info: {
    singularName: 'religion'
    pluralName: 'religions'
    displayName: 'Religion'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    Religion: Attribute.String
    roles: Attribute.Relation<
      'api::religion.religion',
      'oneToMany',
      'plugin::users-permissions.role'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::religion.religion',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::religion.religion',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiReportReport extends Schema.CollectionType {
  collectionName: 'reports'
  info: {
    singularName: 'report'
    pluralName: 'reports'
    displayName: 'Reports'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    reportId: Attribute.String
    PIC: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 50
      }>
    actionTaken: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 300
      }>
    auditCheck: Attribute.Boolean
    detailFiles: Attribute.Media
    compiler: Attribute.Relation<
      'api::report.report',
      'manyToOne',
      'plugin::users-permissions.user'
    >
    reviewer: Attribute.Relation<
      'api::report.report',
      'manyToOne',
      'plugin::users-permissions.user'
    >
    status: Attribute.Enumeration<['Pending', 'Processed', 'Done']> &
      Attribute.DefaultTo<'Pending'>
    detailText: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 300
      }>
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::report.report',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::report.report',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiRestaurantRestaurant extends Schema.CollectionType {
  collectionName: 'restaurants'
  info: {
    singularName: 'restaurant'
    pluralName: 'restaurants'
    displayName: 'Restaurants'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    name: Attribute.String
    address: Attribute.String
    cuisineType: Attribute.Enumeration<
      ['Allergies', 'Diabetics', 'Vegetarians', 'Vegans', 'Gluten intolerance']
    >
    menu: Attribute.Media
    logo: Attribute.Media
    phone: Attribute.String
    email: Attribute.String
    geo: Attribute.Text
    openingHours: Attribute.String
    sumRating: Attribute.BigInteger & Attribute.DefaultTo<'0'>
    reviews: Attribute.Relation<
      'api::restaurant.restaurant',
      'oneToMany',
      'api::restaurant-review.restaurant-review'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::restaurant.restaurant',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::restaurant.restaurant',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiRestaurantReviewRestaurantReview
  extends Schema.CollectionType {
  collectionName: 'restaurant_reviews'
  info: {
    singularName: 'restaurant-review'
    pluralName: 'restaurant-reviews'
    displayName: 'RestaurantReviews'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    rating: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 1
          max: 5
        },
        number
      >
    description: Attribute.Text
    evidence: Attribute.Media
    user: Attribute.Relation<
      'api::restaurant-review.restaurant-review',
      'manyToOne',
      'plugin::users-permissions.user'
    >
    restaurant: Attribute.Relation<
      'api::restaurant-review.restaurant-review',
      'manyToOne',
      'api::restaurant.restaurant'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::restaurant-review.restaurant-review',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::restaurant-review.restaurant-review',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiRolePermissionRolePermission extends Schema.CollectionType {
  collectionName: 'role_permissions'
  info: {
    singularName: 'role-permission'
    pluralName: 'role-permissions'
    displayName: 'RolePermission'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    roleType: Attribute.String & Attribute.Required
    field: Attribute.String
    allow: Attribute.Boolean
    function: Attribute.Enumeration<
      ['Onboarding', 'SupplyChainRecord', 'HighLightedInformation']
    > &
      Attribute.Required
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::role-permission.role-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::role-permission.role-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiRolePermissionFieldRolePermissionField
  extends Schema.CollectionType {
  collectionName: 'role_permission_fields'
  info: {
    singularName: 'role-permission-field'
    pluralName: 'role-permission-fields'
    displayName: 'RolePermissionField'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    function: Attribute.Enumeration<
      ['Onboarding', 'SupplyChainRecord', 'HighLightedInformation']
    >
    key: Attribute.String
    name: Attribute.String
    order: Attribute.Integer
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::role-permission-field.role-permission-field',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::role-permission-field.role-permission-field',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiScanHistoryScanHistory extends Schema.CollectionType {
  collectionName: 'scan_histories'
  info: {
    singularName: 'scan-history'
    pluralName: 'scan-histories'
    displayName: 'ScanHistory'
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    user: Attribute.Relation<
      'api::scan-history.scan-history',
      'oneToOne',
      'plugin::users-permissions.user'
    >
    record: Attribute.Relation<
      'api::scan-history.scan-history',
      'oneToOne',
      'api::supply-chain-record.supply-chain-record'
    >
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::scan-history.scan-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::scan-history.scan-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiSensitiveWordSensitiveWord extends Schema.CollectionType {
  collectionName: 'sensitive_words'
  info: {
    singularName: 'sensitive-word'
    pluralName: 'sensitive-words'
    displayName: 'SensitiveWords'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    words: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1
        maxLength: 30
      }>
    forum_posts: Attribute.Relation<
      'api::sensitive-word.sensitive-word',
      'manyToMany',
      'api::forum-post.forum-post'
    > &
      Attribute.Private
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::sensitive-word.sensitive-word',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::sensitive-word.sensitive-word',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

export interface ApiSupplyChainRecordSupplyChainRecord
  extends Schema.CollectionType {
  collectionName: 'supply_chain_records'
  info: {
    singularName: 'supply-chain-record'
    pluralName: 'supply-chain-records'
    displayName: 'SupplyChainRecords'
    description: ''
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    batchId: Attribute.String & Attribute.Unique
    healthConditions: Attribute.Text
    oneStrike: Attribute.Boolean
    inWeight: Attribute.String
    outWeight: Attribute.String
    vehicleID: Attribute.String
    route: Attribute.Text
    productName: Attribute.String
    productDetails: Attribute.Text
    productionDate: Attribute.Date
    expirationDate: Attribute.Date
    qrCode: Attribute.Text
    deliveryStatus: Attribute.Enumeration<
      ['Prepared', 'Ongoing', 'Received', 'Rejected']
    > &
      Attribute.DefaultTo<'Prepared'>
    ownership: Attribute.Boolean & Attribute.DefaultTo<false>
    GTIN: Attribute.String
    receiver: Attribute.Relation<
      'api::supply-chain-record.supply-chain-record',
      'oneToOne',
      'plugin::users-permissions.user'
    >
    sender: Attribute.Relation<
      'api::supply-chain-record.supply-chain-record',
      'oneToOne',
      'plugin::users-permissions.user'
    >
    supplyChainId: Attribute.String
    supplyChainOrderNumber: Attribute.Integer
    detailsOnAnimalFeed: Attribute.Text
    detailsOnAnimalFeedFiles: Attribute.Media
    vaccinationDetails: Attribute.Text
    vaccinationDetailsFiles: Attribute.Media
    healthConditionsFiles: Attribute.Media
    butchererDetailsFiles: Attribute.Media
    butchererDetails: Attribute.Text
    butcheringProcess: Attribute.Text
    butcheringProcessFiles: Attribute.Media
    shippingDetails: Attribute.Text
    shippingDetailsFiles: Attribute.Media
    storageCondition: Attribute.Text
    storageConditionFiles: Attribute.Media
    productImages: Attribute.Media
    reasonReject: Attribute.String
    reasonRejectFiles: Attribute.Media
    blockchainId: Attribute.String
    departureTime: Attribute.DateTime
    arrivalTime: Attribute.DateTime
    arrivalBatchId: Attribute.String
    departure_histories: Attribute.Relation<
      'api::supply-chain-record.supply-chain-record',
      'oneToMany',
      'api::departure-history.departure-history'
    >
    productType: Attribute.Relation<
      'api::supply-chain-record.supply-chain-record',
      'oneToOne',
      'api::product-type.product-type'
    >
    humidityLevels: Attribute.String
    vehicleFleetSize: Attribute.String
    temperature: Attribute.String
    quantity: Attribute.String
    createdAt: Attribute.DateTime
    updatedAt: Attribute.DateTime
    publishedAt: Attribute.DateTime
    createdBy: Attribute.Relation<
      'api::supply-chain-record.supply-chain-record',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
    updatedBy: Attribute.Relation<
      'api::supply-chain-record.supply-chain-record',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private
  }
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::permission': AdminPermission
      'admin::user': AdminUser
      'admin::role': AdminRole
      'admin::api-token': AdminApiToken
      'admin::api-token-permission': AdminApiTokenPermission
      'admin::transfer-token': AdminTransferToken
      'admin::transfer-token-permission': AdminTransferTokenPermission
      'plugin::upload.file': PluginUploadFile
      'plugin::upload.folder': PluginUploadFolder
      'plugin::content-releases.release': PluginContentReleasesRelease
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission
      'plugin::users-permissions.role': PluginUsersPermissionsRole
      'plugin::users-permissions.user': PluginUsersPermissionsUser
      'plugin::i18n.locale': PluginI18NLocale
      'plugin::email-designer.email-template': PluginEmailDesignerEmailTemplate
      'api::category.category': ApiCategoryCategory
      'api::departure-history.departure-history': ApiDepartureHistoryDepartureHistory
      'api::forum-comment.forum-comment': ApiForumCommentForumComment
      'api::forum-post.forum-post': ApiForumPostForumPost
      'api::halal-certificate.halal-certificate': ApiHalalCertificateHalalCertificate
      'api::log-blockchain.log-blockchain': ApiLogBlockchainLogBlockchain
      'api::news-post.news-post': ApiNewsPostNewsPost
      'api::news-post-category.news-post-category': ApiNewsPostCategoryNewsPostCategory
      'api::onboarding-information.onboarding-information': ApiOnboardingInformationOnboardingInformation
      'api::otp.otp': ApiOtpOtp
      'api::product-type.product-type': ApiProductTypeProductType
      'api::religion.religion': ApiReligionReligion
      'api::report.report': ApiReportReport
      'api::restaurant.restaurant': ApiRestaurantRestaurant
      'api::restaurant-review.restaurant-review': ApiRestaurantReviewRestaurantReview
      'api::role-permission.role-permission': ApiRolePermissionRolePermission
      'api::role-permission-field.role-permission-field': ApiRolePermissionFieldRolePermissionField
      'api::scan-history.scan-history': ApiScanHistoryScanHistory
      'api::sensitive-word.sensitive-word': ApiSensitiveWordSensitiveWord
      'api::supply-chain-record.supply-chain-record': ApiSupplyChainRecordSupplyChainRecord
    }
  }
}
