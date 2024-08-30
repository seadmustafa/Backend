'use strict'

const { yup } = require('@strapi/utils')

const createForumCommentSchema = {
  body: yup.object().shape({
    data: yup.object().shape({
      content: yup.string().max(300).required().label('content'),
      forum_post: yup.number().required().label('forum_post'),
    }),
  }),
}

module.exports = {
  createForumCommentSchema,
}
