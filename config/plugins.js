module.exports = ({ env }) => ({
  documentation: {
    config: {
      servers: [
        {
          url: 'http://localhost:1337/api',
          description: 'Local server',
        },
        {
          url: 'https://halal-cms.dev2.amelacorp.com/api',
          description: 'CMS dev server',
        },
        {
          url: 'https://halal-cms.stg2.amelacorp.com/api',
          description: 'CMS staging server',
        },
        {
          url: 'https://cms.amanahsa.com/api',
          description: 'CMS production server',
        },
      ],
    },
  },
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '30d',
      },
      register: {
        allowedFields: ['name', 'category', 'religion'],
      },
    },
  },
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        service: 'gmail',
        auth: {
          type: 'oauth2',
          user: env('MAIL_OAUTH2_USER'),
          clientId: env('MAIL_OAUTH2_CLIENT_ID'),
          clientSecret: env('MAIL_OAUTH2_CLIENT_SECRET'),
          refreshToken: env('MAIL_OAUTH2_REFRESH_TOKEN'),
        },
      },
      settings: {
        defaultFrom: env('MAIL_OAUTH2_SENDER', env('MAIL_OAUTH2_USER')),
        defaultReplyTo: env('MAIL_OAUTH2_USER'),
      },
    },
  },
  meilisearch: {
    config: {
      // Your meili host
      host: env('MEILI_HOST'),
      // Your master key or private key
      apiKey: env('MEILI_MASTER_KEY'),
      'news-post': {
        transformEntry({ entry }) {
          return {
            ...entry,
            categories: entry.categories.map((category) => category.name),
          }
        },
        settings: {
          searchableAttributes: ['title', 'categories'],
        },
      },
      restaurant: {
        transformEntry({ entry }) {
          return {
            ...entry,
            reviews: entry?.reviews?.length || 0,
            _geo: {
              lat: parseFloat(entry.geo.split(',')[0]),
              lng: parseFloat(entry.geo.split(',')[1]),
            },
          }
        },
        settings: {
          sortableAttributes: ['_geo', 'rating'],
          filterableAttributes: ['cuisineType', 'rating', '_geo'],
        },
      },
    },
  },
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_ACCESS_SECRET'),
        region: env('AWS_REGION'),
        params: {
          ACL: env('AWS_ACL', 'public-read'),
          signedUrlExpires: env('AWS_SIGNED_URL_EXPIRES', 15 * 60),
          Bucket: env('AWS_BUCKET'),
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
})
